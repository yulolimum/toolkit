import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { $ } from 'zx'

import { createLogger, findIosSimulator, findRepoRoot, getCommandOutput, getWorktreeDeviceName } from './worktree-utils'

const quietShell = $({ quiet: true })
const scriptDirectory = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = await findRepoRoot(scriptDirectory)
const log = createLogger('ios setup')

const xcodeVersion = '26.6'
const iosDeviceTypeName = 'iPhone 17 Pro'
const iosDeviceTypeIdentifier = 'com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro'
const iosRuntimeVersion = '26.5'
const iosRuntimeBuild = '23F77'
const iosRuntimeName = `iOS ${iosRuntimeVersion}`
const iosRuntimeIdentifier = 'com.apple.CoreSimulator.SimRuntime.iOS-26-5'
const lineBreakPattern = /\r?\n/
const xcodeSetupCommands = `sudo xcode-select --switch /Applications/Xcode-26-6.app
sudo xcodebuild -license accept
sudo xcodebuild -runFirstLaunch`

function runCommand(command: ReadonlyArray<string>) {
  const [executable, ...arguments_] = command

  if (!executable) {
    return Promise.resolve(1)
  }

  const subprocess = spawn(executable, arguments_, {
    env: process.env,
    stdio: 'inherit',
  })

  return new Promise<number>((resolve, reject) => {
    subprocess.once('error', reject)
    subprocess.once('close', (exitCode) => resolve(exitCode ?? 1))
  })
}

function requireXcode() {
  const selectedXcode = getCommandOutput(['xcodebuild', '-version'])
    .split(lineBreakPattern)
    .find((line) => line.startsWith('Xcode '))

  if (selectedXcode === `Xcode ${xcodeVersion}`) {
    return
  }

  const selectedVersion = selectedXcode ? ` Selected: ${selectedXcode}.` : ''
  log.fail(
    `Xcode ${xcodeVersion} is required.${selectedVersion} Install it from https://developer.apple.com/download/all/, then run:\n${xcodeSetupCommands}`,
  )
}

function requireXcodeFirstLaunch() {
  const firstLaunchComplete = spawnSync('xcodebuild', ['-checkFirstLaunchStatus'], { stdio: 'ignore' }).status === 0

  if (!firstLaunchComplete) {
    log.fail(`Xcode ${xcodeVersion} setup is incomplete. Run:\n${xcodeSetupCommands}`)
  }
}

function iosRuntimeExists() {
  return getCommandOutput(['xcrun', 'simctl', 'list', 'runtimes', 'iOS'])
    .split(lineBreakPattern)
    .some(
      (line) =>
        line.includes(iosRuntimeIdentifier) &&
        line.includes(`(${iosRuntimeVersion} - ${iosRuntimeBuild})`) &&
        !line.includes('unavailable'),
    )
}

async function installIosRuntime() {
  log.info(`Installing ${iosRuntimeName} simulator runtime`)

  const exitCode = await runCommand([
    'xcodebuild',
    '-downloadPlatform',
    'iOS',
    '-buildVersion',
    iosRuntimeBuild,
    '-architectureVariant',
    'arm64',
  ])

  if (exitCode !== 0 || !iosRuntimeExists()) {
    log.fail(`Failed to install ${iosRuntimeName}. Install it from Xcode > Settings > Components.`)
  }

  log.check(`Installed ${iosRuntimeName} simulator runtime`)
}

async function requireIosRuntime() {
  if (!iosRuntimeExists()) {
    await installIosRuntime()
  }
}

function requireIosDeviceType() {
  const deviceTypeAvailable = getCommandOutput(['xcrun', 'simctl', 'list', 'devicetypes'])
    .split(lineBreakPattern)
    .some((line) => line.trim() === `${iosDeviceTypeName} (${iosDeviceTypeIdentifier})`)

  if (!deviceTypeAvailable) {
    log.fail(`${iosDeviceTypeName} simulator is required. Reinstall Xcode ${xcodeVersion}.`)
  }
}

requireXcode()
requireXcodeFirstLaunch()

const simulatorName = getWorktreeDeviceName(repoRoot)
await requireIosRuntime()
requireIosDeviceType()
const existingSimulator = findIosSimulator(simulatorName)

if (
  existingSimulator?.isAvailable &&
  existingSimulator.deviceTypeIdentifier === iosDeviceTypeIdentifier &&
  existingSimulator.runtimeIdentifier === iosRuntimeIdentifier
) {
  log.check(`iOS simulator already exists: ${simulatorName} (${existingSimulator.udid})`)
  process.exit(0)
}

if (existingSimulator) {
  log.info(`Replacing iOS simulator with ${iosDeviceTypeName} on ${iosRuntimeName}: ${simulatorName}`)

  if (existingSimulator.state !== 'Shutdown') {
    await quietShell`xcrun simctl shutdown ${existingSimulator.udid}`
  }

  await quietShell`xcrun simctl delete ${existingSimulator.udid}`
}

const createdUdid = (
  await quietShell`xcrun simctl create ${simulatorName} ${iosDeviceTypeIdentifier} ${iosRuntimeIdentifier}`
).stdout.trim()

log.check(`Created iOS simulator: ${simulatorName} (${createdUdid})`)
