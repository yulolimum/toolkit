import { spawn, spawnSync } from 'node:child_process'
import { closeSync, openSync, readSync, writeSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { fs } from 'zx'

import {
  androidVirtualDeviceExists,
  createLogger,
  findAndroidEmulatorSerial,
  findIosSimulatorUdid,
  findRepoRoot,
  findWorktreePort,
  getCommandOutput,
  getWorktreeDeviceName,
  isValidPort,
  requireAndroidSdkRoot,
  requireAndroidSdkTool,
} from './worktree-utils'

const scriptDirectory = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = await findRepoRoot(scriptDirectory)
const mobileRoot = join(repoRoot, 'apps', 'mobile')
const log = createLogger('mobile run')

process.env.LANG = 'en_US.UTF-8'
process.env.LC_ALL = 'en_US.UTF-8'

type Platform = 'android' | 'ios'
type Terminal = Readonly<{
  inputFileDescriptor: number
  outputFileDescriptor: number
}>

function createTerminal(): Terminal {
  let inputFileDescriptor: number | undefined

  try {
    inputFileDescriptor = openSync('/dev/tty', 'r')
    const outputFileDescriptor = openSync('/dev/tty', 'w')

    return {
      inputFileDescriptor,
      outputFileDescriptor,
    }
  } catch (error) {
    if (inputFileDescriptor !== undefined) {
      closeSync(inputFileDescriptor)
    }

    const reason = error instanceof Error ? ` ${error.message}` : ''
    return log.fail(`Unable to open the interactive terminal.${reason}`)
  }
}

function readTerminalKey() {
  const buffer = Buffer.alloc(1)
  const bytesRead = readSync(terminal.inputFileDescriptor, buffer, 0, 1, null)
  return bytesRead === 1 ? buffer.toString() : ''
}

function setTerminalMode(settings: ReadonlyArray<string>) {
  return spawnSync('stty', ['-f', '/dev/tty', ...settings], { stdio: 'ignore' }).status === 0
}

function waitForExit(subprocess: ReturnType<typeof spawn>) {
  return new Promise<number>((resolve, reject) => {
    subprocess.once('error', reject)
    subprocess.once('close', (exitCode) => resolve(exitCode ?? 1))
  })
}

function commandExists(command: string) {
  return spawnSync('which', [command], { stdio: 'ignore' }).status === 0
}

function findPlatformArgument(arguments_: ReadonlyArray<string>): Platform | undefined {
  const platformIndex = arguments_.indexOf('--platform')

  if (platformIndex === -1) {
    return
  }

  const platform = arguments_[platformIndex + 1]

  if (platform === 'android' || platform === 'ios') {
    return platform
  }

  return log.fail('Invalid platform. Use "--platform android" or "--platform ios".')
}

function choosePlatform(): Platform | undefined {
  const originalMode = getCommandOutput(['stty', '-f', '/dev/tty', '-g']).trim()

  if (!originalMode || !setTerminalMode(['raw', '-echo'])) {
    log.fail('Unable to enable interactive terminal input.')
  }

  try {
    while (true) {
      writeSync(terminal.outputFileDescriptor, 'ℹ️ [mobile run] Type "i" for iOS or "a" for Android: ')
      const choice = readTerminalKey().toLowerCase()
      writeSync(terminal.outputFileDescriptor, '\n')

      if (choice === 'i') {
        return 'ios'
      }

      if (choice === 'a') {
        return 'android'
      }

      if (!choice || choice === '^C') {
        return
      }

      log.warning('Invalid choice.')
    }
  } finally {
    if (!setTerminalMode([originalMode])) {
      log.error('Unable to restore the interactive terminal.')
    }
  }
}

async function runCommand(command: ReadonlyArray<string>, cwd = repoRoot) {
  const [executable, ...arguments_] = command

  if (!executable) {
    return log.fail('A command is required.')
  }

  const subprocess = spawn(executable, arguments_, {
    cwd,
    env: process.env,
    stdio: 'inherit',
  })
  const exitCode = await waitForExit(subprocess)

  if (exitCode !== 0) {
    process.exit(exitCode)
  }
}

async function runApp(command: ReadonlyArray<string>, environment = process.env): Promise<never> {
  const [executable, ...arguments_] = command

  if (!executable) {
    return log.fail('A command is required.')
  }

  const subprocess = spawn(executable, arguments_, {
    cwd: mobileRoot,
    env: environment,
    stdio: [terminal.inputFileDescriptor, terminal.outputFileDescriptor, terminal.outputFileDescriptor],
  })

  process.exit(await waitForExit(subprocess))
}

function getMetroPortArguments(metroPort: string | undefined) {
  return metroPort ? ['--port', metroPort] : []
}

async function bootIos(deviceName: string, metroPort: string | undefined): Promise<never> {
  if (!commandExists('xcrun')) {
    return log.fail('xcrun is required to run the iOS simulator.')
  }

  const udid = findIosSimulatorUdid(deviceName)

  if (!udid) {
    log.error(`iOS simulator does not exist: ${deviceName}`)
    return log.fail('Run the worktree setup script before using run.')
  }

  log.info(`Booting iOS simulator ${deviceName}`)

  const bootedDevices = getCommandOutput(['xcrun', 'simctl', 'list', 'devices', 'booted'])

  if (!bootedDevices.includes(udid)) {
    await runCommand(['xcrun', 'simctl', 'boot', udid])
  }

  await runCommand(['xcrun', 'simctl', 'bootstatus', udid, '-b'])
  spawnSync('open', ['-a', 'Simulator', '--args', '-CurrentDeviceUDID', udid], {
    stdio: 'ignore',
  })

  log.info('Starting iOS app')
  return runApp([
    'pnpm',
    'run',
    'ios',
    '--',
    '--no-install',
    '--device',
    deviceName,
    ...getMetroPortArguments(metroPort),
  ])
}

async function waitForAndroidBoot(adbPath: string, serial: string, deviceName: string) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const bootCompleted = getCommandOutput([adbPath, '-s', serial, 'shell', 'getprop', 'sys.boot_completed']).trim()

    if (bootCompleted === '1') {
      return
    }

    await sleep(1000)
  }

  log.fail(`Android emulator did not finish booting: ${deviceName}`)
}

function reverseAndroidPort(adbPath: string, serial: string, port: string) {
  if (!isValidPort(port)) {
    return
  }

  spawnSync(adbPath, ['-s', serial, 'reverse', `tcp:${port}`, `tcp:${port}`], {
    stdio: 'ignore',
  })
}

async function findAndroidEnvPorts() {
  const fileNames: Array<string> = await fs.readdir(mobileRoot)
  const envFileNames = fileNames.filter((fileName) => fileName.startsWith('.env'))
  const ports = new Set<string>()

  for (const fileName of envFileNames) {
    const filePath = join(mobileRoot, fileName)

    if (!(await fs.stat(filePath)).isFile()) {
      continue
    }

    const contents = await fs.readFile(filePath, 'utf8')

    for (const match of contents.matchAll(/(?:localhost|127\.0\.0\.1):(\d+)/g)) {
      const port = match[1]

      if (port) {
        ports.add(port)
      }
    }
  }

  return [...ports].toSorted()
}

async function reverseAndroidEnvPorts(adbPath: string, serial: string) {
  for (const port of await findAndroidEnvPorts()) {
    reverseAndroidPort(adbPath, serial, port)
  }
}

function configureAndroidInput(adbPath: string, serial: string) {
  spawnSync(adbPath, ['-s', serial, 'shell', 'settings', 'put', 'secure', 'show_ime_with_hard_keyboard', '1'], {
    stdio: 'ignore',
  })
  spawnSync(adbPath, ['-s', serial, 'shell', 'settings', 'put', 'secure', 'stylus_handwriting_enabled', '0'], {
    stdio: 'ignore',
  })
}

function startAndroidEmulator(emulatorPath: string, deviceName: string) {
  const logFile = openSync(`/tmp/${deviceName}-emulator.log`, 'a')
  const emulator = spawn(emulatorPath, ['-avd', deviceName], {
    detached: true,
    stdio: ['ignore', logFile, logFile],
  })

  emulator.unref()
  closeSync(logFile)
}

async function waitForAndroidSerial(adbPath: string, deviceName: string) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const serial = findAndroidEmulatorSerial(adbPath, deviceName)

    if (serial) {
      return serial
    }

    await sleep(1000)
  }

  return undefined
}

async function bootAndroid(deviceName: string, metroPort: string | undefined): Promise<never> {
  const androidSdkRoot = await requireAndroidSdkRoot(repoRoot, log)
  const emulatorPath = await requireAndroidSdkTool(
    androidSdkRoot,
    'emulator',
    log,
    'emulator is required to run the Android emulator.',
  )
  const adbPath = await requireAndroidSdkTool(
    androidSdkRoot,
    'adb',
    log,
    'adb is required to run the Android emulator.',
  )

  if (!androidVirtualDeviceExists(emulatorPath, deviceName)) {
    log.error(`Android emulator does not exist: ${deviceName}`)
    return log.fail('Run the worktree setup script before using run.')
  }

  let serial = findAndroidEmulatorSerial(adbPath, deviceName)

  if (!serial) {
    log.info(`Starting Android emulator ${deviceName}`)
    startAndroidEmulator(emulatorPath, deviceName)
    serial = await waitForAndroidSerial(adbPath, deviceName)
  }

  if (!serial) {
    return log.fail(`Android emulator did not start: ${deviceName}`)
  }

  log.info(`Waiting for Android emulator ${deviceName}`)
  await waitForAndroidBoot(adbPath, serial, deviceName)
  configureAndroidInput(adbPath, serial)

  for (const port of ['443', '4000']) {
    reverseAndroidPort(adbPath, serial, port)
  }

  if (metroPort) {
    reverseAndroidPort(adbPath, serial, metroPort)
  }

  await reverseAndroidEnvPorts(adbPath, serial)

  log.info('Starting Android app')
  return runApp(['pnpm', 'run', 'android', '--', '--device', deviceName, ...getMetroPortArguments(metroPort)], {
    ...process.env,
    ANDROID_SERIAL: serial,
  })
}

const terminal = createTerminal()
const worktreeDeviceName = getWorktreeDeviceName(repoRoot)
const worktreePort = findWorktreePort(log)
const selectedMetroPort = worktreePort?.port

if (worktreePort) {
  process.env.WORKTREE_PORT = worktreePort.port
  process.env.EXPO_METRO_PORT = worktreePort.port
  process.env.METRO_PORT = worktreePort.port
  process.env.RCT_METRO_PORT = worktreePort.port
  log.info(`Using Metro port ${worktreePort.port} from ${worktreePort.source}`)
} else {
  log.info("Using Metro's default port")
}

log.info(`Using device ${worktreeDeviceName}`)
log.info('Expected web dev server to be running separately: pnpm run dev:web')

const platform = findPlatformArgument(process.argv.slice(2)) ?? choosePlatform()

if (platform === 'ios') {
  await bootIos(worktreeDeviceName, selectedMetroPort)
} else if (platform === 'android') {
  await bootAndroid(worktreeDeviceName, selectedMetroPort)
} else {
  log.info('Run cancelled.')
}
