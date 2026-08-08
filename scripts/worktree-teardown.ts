import { spawn, spawnSync } from 'node:child_process'
import { readdir, rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

import {
  androidVirtualDeviceExists,
  configureJava,
  createLogger,
  findAndroidEmulatorSerial,
  findAndroidSdkRoot,
  findAndroidSdkTool,
  findIosSimulator,
  findRepoRoot,
  getCommandOutput,
  getWorktreeDeviceName,
  isDirectory,
} from './worktree-utils'

const scriptDirectory = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = await findRepoRoot(scriptDirectory)
const deviceName = getWorktreeDeviceName(repoRoot)
const log = createLogger('mobile teardown')
const derivedDataRoot = join(homedir(), 'Library', 'Developer', 'Xcode', 'DerivedData')
const iosWorkspaceRelativePath = 'apps/mobile/ios/YourApp.xcworkspace'
const iosWorkspacePath = resolve(repoRoot, iosWorkspaceRelativePath)

function commandExists(command: string) {
  return spawnSync('which', [command], { stdio: 'ignore' }).status === 0
}

async function runCommand(command: ReadonlyArray<string>) {
  const [executable, ...arguments_] = command

  if (!executable) {
    return false
  }

  const subprocess = spawn(executable, arguments_, {
    env: process.env,
    stdio: 'inherit',
  })

  const exitCode = await new Promise<number>((resolve, reject) => {
    subprocess.once('error', reject)
    subprocess.once('close', (code) => resolve(code ?? 1))
  })

  return exitCode === 0
}

async function deleteIosSimulator() {
  if (!commandExists('xcrun')) {
    log.error('xcrun was not found; unable to delete the iOS simulator.')
    return false
  }

  const simulator = findIosSimulator(deviceName)

  if (!simulator) {
    log.info(`iOS simulator does not exist: ${deviceName}`)
    return true
  }

  if (simulator.state !== 'Shutdown' && !(await runCommand(['xcrun', 'simctl', 'shutdown', simulator.udid]))) {
    log.error(`Failed to shut down iOS simulator: ${deviceName}`)
    return false
  }

  if (!(await runCommand(['xcrun', 'simctl', 'delete', simulator.udid]))) {
    log.error(`Failed to delete iOS simulator: ${deviceName}`)
    return false
  }

  log.check(`Deleted iOS simulator: ${deviceName}`)
  return true
}

async function stopAndroidEmulator(adbPath: string) {
  const serial = findAndroidEmulatorSerial(adbPath, deviceName)

  if (!serial) {
    return true
  }

  if (!(await runCommand([adbPath, '-s', serial, 'emu', 'kill']))) {
    return false
  }

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (!findAndroidEmulatorSerial(adbPath, deviceName)) {
      return true
    }

    await sleep(500)
  }

  return false
}

async function deleteAndroidVirtualDevice() {
  const androidSdkRoot = await findAndroidSdkRoot(repoRoot)

  if (!androidSdkRoot || !(await isDirectory(androidSdkRoot))) {
    log.error('Android SDK was not found; unable to delete the Android emulator.')
    return false
  }

  const emulatorPath = await findAndroidSdkTool(androidSdkRoot, 'emulator')
  const avdManagerPath = await findAndroidSdkTool(androidSdkRoot, 'avdmanager')
  const adbPath = await findAndroidSdkTool(androidSdkRoot, 'adb')

  if (!emulatorPath || !avdManagerPath || !adbPath) {
    log.error('Android emulator, avdmanager, and adb are required for teardown.')
    return false
  }

  if (!androidVirtualDeviceExists(emulatorPath, deviceName)) {
    log.info(`Android emulator does not exist: ${deviceName}`)
    return true
  }

  await configureJava(log)

  if (!(await stopAndroidEmulator(adbPath))) {
    log.error(`Failed to stop Android emulator: ${deviceName}`)
    return false
  }

  if (!(await runCommand([avdManagerPath, 'delete', 'avd', '--name', deviceName]))) {
    log.error(`Failed to delete Android emulator: ${deviceName}`)
    return false
  }

  log.check(`Deleted Android emulator: ${deviceName}`)
  return true
}

async function deleteWorktreeDerivedData() {
  if (!(await isDirectory(derivedDataRoot))) {
    log.info('Xcode DerivedData does not exist.')
    return true
  }

  try {
    const entries = await readdir(derivedDataRoot, { withFileTypes: true })
    let deletedCount = 0

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      const derivedDataPath = join(derivedDataRoot, entry.name)
      const workspacePath = getCommandOutput([
        'plutil',
        '-extract',
        'WorkspacePath',
        'raw',
        '-o',
        '-',
        join(derivedDataPath, 'info.plist'),
      ]).trim()

      if (workspacePath !== iosWorkspacePath) {
        continue
      }

      await rm(derivedDataPath, { force: true, recursive: true })
      deletedCount += 1
    }

    if (deletedCount === 0) {
      log.info('Xcode DerivedData does not exist for this worktree.')
    } else {
      log.check(`Deleted ${deletedCount} Xcode DerivedData ${deletedCount === 1 ? 'directory' : 'directories'}.`)
    }

    return true
  } catch (error) {
    const reason = error instanceof Error ? ` ${error.message}` : ''
    log.error(`Failed to delete Xcode DerivedData.${reason}`)
    return false
  }
}

const iosDeleted = await deleteIosSimulator()
const androidDeleted = await deleteAndroidVirtualDevice()
const derivedDataDeleted = await deleteWorktreeDerivedData()

if (!iosDeleted || !androidDeleted || !derivedDataDeleted) {
  log.fail('Worktree teardown did not finish.')
}

log.check('Worktree mobile devices and DerivedData removed.')
