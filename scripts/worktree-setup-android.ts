import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $, fs } from 'zx'

import {
  androidVirtualDeviceExists,
  configureJava,
  createLogger,
  findRepoRoot,
  getWorktreeDeviceName,
  isDirectory,
  isFile,
  requireAndroidSdkRoot,
  requireAndroidSdkTool,
} from './worktree-utils'

const quietShell = $({ quiet: true })
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = await findRepoRoot(scriptDirectory)
const log = createLogger('android setup')

const androidDeviceProfile = 'pixel_7_pro'
const androidSystemImage = 'system-images;android-36;google_apis;arm64-v8a'
const androidSystemImagePath = join('system-images', 'android-36', 'google_apis', 'arm64-v8a')
const lineBreakPattern = /\r?\n/

function runCommand(command: ReadonlyArray<string>, input?: string) {
  const [executable, ...arguments_] = command

  if (!executable) {
    return Promise.resolve(1)
  }

  const subprocess = spawn(executable, arguments_, {
    env: process.env,
    stdio: input === undefined ? 'inherit' : ['pipe', 'inherit', 'inherit'],
  })

  if (input !== undefined) {
    subprocess.stdin?.end(input)
  }

  return new Promise<number>((resolve, reject) => {
    subprocess.once('error', reject)
    subprocess.once('close', (exitCode) => resolve(exitCode ?? 1))
  })
}

function findAvdHome() {
  if (process.env.ANDROID_AVD_HOME) {
    return process.env.ANDROID_AVD_HOME
  }

  const androidUserHome = process.env.ANDROID_USER_HOME || join(homedir(), '.android')
  return join(androidUserHome, 'avd')
}

async function setAvdConfigValue(configPath: string, key: string, value: string) {
  const keyPrefix = `${key}=`
  const config: string = await fs.readFile(configPath, 'utf8')
  const configLines = config.split(lineBreakPattern)
  const updatedConfig = configLines
    .map((line) => (line.startsWith(keyPrefix) ? `${keyPrefix}${value}` : line))
    .join('\n')
  const configWithValue = configLines.some((line) => line.startsWith(keyPrefix))
    ? updatedConfig
    : `${config}${config.endsWith('\n') || config.length === 0 ? '' : '\n'}${keyPrefix}${value}\n`
  const temporaryPath = `${configPath}.tmp.${process.pid}`

  await fs.writeFile(temporaryPath, configWithValue)
  await fs.rename(temporaryPath, configPath)
}

async function configureAvdInput(avdHome: string, avdName: string) {
  const configPath = join(avdHome, `${avdName}.avd`, 'config.ini')

  if (!(await isFile(configPath))) {
    log.warning(`Android emulator config was not found: ${configPath}`)
    return
  }

  await setAvdConfigValue(configPath, 'hw.keyboard', 'yes')
  await setAvdConfigValue(configPath, 'hw.stylus', 'no')
  log.check(`Configured Android emulator input: ${avdName}`)
}

async function deviceProfileExists(avdManagerPath: string) {
  const output: string = (await quietShell`${avdManagerPath} list device -c`).stdout
  return output.split(lineBreakPattern).some((line) => line.trim() === androidDeviceProfile)
}

async function installSystemImage(androidSdkRoot: string, sdkManagerPath: string) {
  const systemImageDirectory = join(androidSdkRoot, androidSystemImagePath)

  if (await isDirectory(systemImageDirectory)) {
    return
  }

  log.info(`Installing Android system image: ${androidSystemImage}`)

  const exitCode = await runCommand([sdkManagerPath, `--sdk_root=${androidSdkRoot}`, androidSystemImage])

  if (exitCode !== 0 || !(await isDirectory(systemImageDirectory))) {
    log.fail(`Failed to install Android system image: ${androidSystemImage}`)
  }
}

async function createAndroidVirtualDevice(avdManagerPath: string, avdName: string, systemImage: string) {
  const exitCode = await runCommand(
    [avdManagerPath, 'create', 'avd', '--name', avdName, '--package', systemImage, '--device', androidDeviceProfile],
    'no\n',
  )

  if (exitCode !== 0) {
    log.fail(`Failed to create Android emulator: ${avdName}`)
  }
}

if (process.arch !== 'arm64') {
  log.fail(`Only ARM64 machines are supported. Detected architecture: ${process.arch}`)
}

await configureJava(log)

const configuredAndroidSdkRoot = await requireAndroidSdkRoot(repoRoot, log)

process.env.ANDROID_HOME = configuredAndroidSdkRoot

const commandLineToolsMessage =
  "Android SDK Command-line Tools are required. Install 'Android SDK Command-line Tools (latest)' from Android Studio's SDK Manager."
const detectedAvdManagerPath = await requireAndroidSdkTool(
  configuredAndroidSdkRoot,
  'avdmanager',
  log,
  commandLineToolsMessage,
)
const detectedSdkManagerPath = await requireAndroidSdkTool(
  configuredAndroidSdkRoot,
  'sdkmanager',
  log,
  commandLineToolsMessage,
)
const detectedEmulatorPath = await requireAndroidSdkTool(
  configuredAndroidSdkRoot,
  'emulator',
  log,
  "Android Emulator is required. Install it from Android Studio's SDK Manager.",
)

const worktreeAvdName = getWorktreeDeviceName(repoRoot)
const configuredAvdHome = findAvdHome()

if (androidVirtualDeviceExists(detectedEmulatorPath, worktreeAvdName)) {
  await configureAvdInput(configuredAvdHome, worktreeAvdName)
  log.check(`Android emulator already exists: ${worktreeAvdName}`)
  process.exit(0)
}

if (!(await deviceProfileExists(detectedAvdManagerPath))) {
  log.fail(
    `Android device profile '${androidDeviceProfile}' is required. Update 'Android SDK Command-line Tools (latest)' in Android Studio.`,
  )
}

await installSystemImage(configuredAndroidSdkRoot, detectedSdkManagerPath)
log.info(`Creating Android emulator with device profile: ${androidDeviceProfile}`)
await createAndroidVirtualDevice(detectedAvdManagerPath, worktreeAvdName, androidSystemImage)
await configureAvdInput(configuredAvdHome, worktreeAvdName)
log.check(`Created Android emulator: ${worktreeAvdName}`)
