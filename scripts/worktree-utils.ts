import type { Dirent } from 'node:fs'

import { spawnSync } from 'node:child_process'
import { homedir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { $, fs } from 'zx'

const quietShell = $({ quiet: true })
const integerPattern = /^\d+$/
const lineBreakPattern = /\r?\n/
const localSdkDirectoryPattern = /^sdk\.dir=(.+)$/m
const whitespacePattern = /\s+/

const worktreePortVariables = ['WORKTREE_PORT', 'PASEO_PORT', 'CONDUCTOR_PORT', 'PASEO_WORKTREE_PORT'] as const

export type Logger = Readonly<{
  check(message: string): void
  error(message: string): void
  fail(message: string): never
  info(message: string): void
  warning(message: string): void
}>

export function createLogger(scope: string): Logger {
  const prefix = `[${scope}]`
  const error = (message: string) => console.error(`❌ ${prefix} ${message}`)

  return {
    check(message: string) {
      console.log(`✅ ${prefix} ${message}`)
    },
    error,
    fail(message: string): never {
      error(message)
      process.exit(1)
    },
    info(message: string) {
      console.info(`ℹ️ ${prefix} ${message}`)
    },
    warning(message: string) {
      console.warn(`⚠️ ${prefix} ${message}`)
    },
  }
}

export function findWorktreePort(log: ReturnType<typeof createLogger>, environment = process.env) {
  const source = worktreePortVariables.find((variable) => environment[variable])

  if (!source) {
    return
  }

  const port = environment[source]

  if (!isValidPort(port)) {
    log.fail(`${source} must be an integer between 1 and 65535.`)
  }

  return { port, source }
}

export function isValidPort(value: string | undefined): value is string {
  if (!value || !integerPattern.test(value)) {
    return false
  }

  const port = Number(value)
  return port >= 1 && port <= 65_535
}

export async function isFile(path: string) {
  try {
    return (await fs.stat(path)).isFile()
  } catch {
    return false
  }
}

export async function isDirectory(path: string) {
  try {
    return (await fs.stat(path)).isDirectory()
  } catch {
    return false
  }
}

function commandSucceeds(command: ReadonlyArray<string>) {
  const [executable, ...arguments_] = command

  if (!executable) {
    return false
  }

  return spawnSync(executable, arguments_, { stdio: 'ignore' }).status === 0
}

function findCommand(command: string) {
  const result = spawnSync('which', [command], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })

  return result.status === 0 ? result.stdout.trim() || undefined : undefined
}

function javaRuns(javaPath: string) {
  return commandSucceeds([javaPath, '-version'])
}

export async function configureJava(log: ReturnType<typeof createLogger>) {
  const configuredJava = process.env.JAVA_HOME && join(process.env.JAVA_HOME, 'bin', 'java')

  if (configuredJava && (await isFile(configuredJava)) && javaRuns(configuredJava)) {
    return
  }

  delete process.env.JAVA_HOME

  const pathJava = findCommand('java')

  if (pathJava && javaRuns(pathJava)) {
    return
  }

  const androidStudioJavaHome = '/Applications/Android Studio.app/Contents/jbr/Contents/Home'
  const androidStudioJava = join(androidStudioJavaHome, 'bin', 'java')

  if ((await isFile(androidStudioJava)) && javaRuns(androidStudioJava)) {
    process.env.JAVA_HOME = androidStudioJavaHome
    return
  }

  log.fail('Java is required. Install JDK 17 or Android Studio with its bundled runtime.')
}

async function getDirectoryNames(path: string) {
  try {
    const entries: Array<Dirent> = await fs.readdir(path, { withFileTypes: true })

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .toSorted((first, second) => first.localeCompare(second, undefined, { numeric: true }))
  } catch {
    return []
  }
}

export function getCommandOutput(command: ReadonlyArray<string>) {
  const [executable, ...arguments_] = command

  if (!executable) {
    return ''
  }

  const result = spawnSync(executable, arguments_, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  return result.status === 0 ? result.stdout : ''
}

export async function findRepoRoot(directory: string) {
  return (await quietShell`git -C ${directory} rev-parse --show-toplevel`).stdout.trim()
}

export async function findPrimaryWorktreeRoot(repoRoot: string) {
  const output = (await quietShell`git -C ${repoRoot} worktree list --porcelain -z`).stdout
  const worktreeEntry = output.split('\0').find((entry) => entry.startsWith('worktree '))
  const primaryWorktreeRoot = worktreeEntry?.slice('worktree '.length)

  if (!primaryWorktreeRoot) {
    throw new Error('Unable to find the primary Git worktree')
  }

  return primaryWorktreeRoot
}

export async function copyLocalFile(sourceRoot: string, targetRoot: string, relativePath: string, log: Logger) {
  const sourcePath = join(sourceRoot, relativePath)
  const targetPath = join(targetRoot, relativePath)

  if (!(await fs.pathExists(sourcePath))) {
    log.warning(`Local file not found, skipping: ${relativePath}`)
    return
  }

  if (await fs.pathExists(targetPath)) {
    log.info(`Local file already exists, skipping: ${relativePath}`)
    return
  }

  await fs.ensureDir(dirname(targetPath))
  await fs.copy(sourcePath, targetPath, { overwrite: false })
  log.check(`Copied local file: ${relativePath}`)
}

export async function copyLocalFilesFromPrimaryWorktree(
  targetRoot: string,
  relativePaths: ReadonlyArray<string>,
  log: Logger,
) {
  const sourceRoot = await findPrimaryWorktreeRoot(targetRoot)

  if (sourceRoot === targetRoot) {
    log.info('Local files are already in the primary worktree')
    return
  }

  for (const relativePath of relativePaths) {
    await copyLocalFile(sourceRoot, targetRoot, relativePath, log)
  }
}

export function createSafeWorktreeName(worktreeName: string) {
  const safeName = worktreeName
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')

  if (!safeName) {
    throw new Error('Git worktree name must contain at least one letter or number')
  }

  return safeName
}

export function getWorktreeName(repoRoot: string) {
  return createSafeWorktreeName(basename(repoRoot))
}

export function getWorktreeDeviceName(repoRoot: string) {
  return `worktree-${getWorktreeName(repoRoot)}`
}

export async function findAndroidSdkRoot(repoRoot: string) {
  const environmentSdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT

  if (environmentSdkRoot) {
    return environmentSdkRoot
  }

  const localPropertiesPath = join(repoRoot, 'apps', 'mobile', 'android', 'local.properties')

  if (await isFile(localPropertiesPath)) {
    const localProperties = await fs.readFile(localPropertiesPath, 'utf8')
    const localSdkRoot = localProperties.match(localSdkDirectoryPattern)?.[1]

    if (localSdkRoot) {
      return localSdkRoot.replaceAll('\\:', ':').replaceAll('\\\\', '\\')
    }
  }

  const defaultMacOsSdkRoot = join(homedir(), 'Library', 'Android', 'sdk')

  if (await isDirectory(defaultMacOsSdkRoot)) {
    return defaultMacOsSdkRoot
  }

  return undefined
}

export async function findAndroidSdkTool(androidSdkRoot: string, toolName: string) {
  const directSdkTools = [
    join(androidSdkRoot, 'cmdline-tools', 'latest', 'bin', toolName),
    join(androidSdkRoot, 'emulator', toolName),
    join(androidSdkRoot, 'platform-tools', toolName),
  ]

  for (const sdkTool of directSdkTools) {
    if (await isFile(sdkTool)) {
      return sdkTool
    }
  }

  const commandLineToolsRoot = join(androidSdkRoot, 'cmdline-tools')
  const commandLineToolVersions = await getDirectoryNames(commandLineToolsRoot)

  for (const version of commandLineToolVersions.toReversed()) {
    const versionedSdkTool = join(commandLineToolsRoot, version, 'bin', toolName)

    if (await isFile(versionedSdkTool)) {
      return versionedSdkTool
    }
  }

  return findCommand(toolName)
}

export async function requireAndroidSdkRoot(repoRoot: string, log: Logger) {
  const androidSdkRoot = await findAndroidSdkRoot(repoRoot)

  if (!androidSdkRoot || !(await isDirectory(androidSdkRoot))) {
    return log.fail('Android SDK not found. Install Android Studio or set ANDROID_HOME to your Android SDK directory.')
  }

  return androidSdkRoot
}

export async function requireAndroidSdkTool(androidSdkRoot: string, toolName: string, log: Logger, message: string) {
  const toolPath = await findAndroidSdkTool(androidSdkRoot, toolName)

  if (!toolPath) {
    return log.fail(message)
  }

  return toolPath
}

export function androidVirtualDeviceExists(emulatorPath: string, avdName: string) {
  return getCommandOutput([emulatorPath, '-list-avds'])
    .split(lineBreakPattern)
    .some((line) => line.trim() === avdName)
}

export function findAndroidEmulatorSerial(adbPath: string, avdName: string) {
  const serials = getCommandOutput([adbPath, 'devices'])
    .split(lineBreakPattern)
    .slice(1)
    .map((line) => line.trim().split(whitespacePattern, 1)[0])
    .filter((serial): serial is string => Boolean(serial?.startsWith('emulator-')))

  for (const serial of serials) {
    const runningAvdName = getCommandOutput([adbPath, '-s', serial, 'emu', 'avd', 'name'])
      .split(lineBreakPattern)
      .map((line) => line.trim())
      .find((line) => line && line !== 'OK')

    if (runningAvdName === avdName) {
      return serial
    }
  }

  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function findIosSimulator(simulatorName: string) {
  const output = getCommandOutput(['xcrun', 'simctl', 'list', 'devices', '--json'])

  try {
    const simulatorList: unknown = JSON.parse(output)

    if (!isRecord(simulatorList) || !isRecord(simulatorList.devices)) {
      return
    }

    for (const [runtimeIdentifier, devices] of Object.entries(simulatorList.devices)) {
      if (!Array.isArray(devices)) {
        continue
      }

      for (const device of devices) {
        if (
          isRecord(device) &&
          device.name === simulatorName &&
          typeof device.deviceTypeIdentifier === 'string' &&
          typeof device.state === 'string' &&
          typeof device.udid === 'string'
        ) {
          return {
            deviceTypeIdentifier: device.deviceTypeIdentifier,
            isAvailable: device.isAvailable === true,
            runtimeIdentifier,
            state: device.state,
            udid: device.udid,
          }
        }
      }
    }
  } catch {
    return
  }

  return undefined
}

export function findIosSimulatorUdid(simulatorName: string) {
  const simulator = findIosSimulator(simulatorName)
  return simulator?.isAvailable ? simulator.udid : undefined
}
