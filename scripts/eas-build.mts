process.env.FORCE_COLOR ||= '1'

import confirm from '@inquirer/confirm'
import select from '@inquirer/select'
import path from 'node:path'
import process from 'node:process'
import { $, fs, minimist } from 'zx'

//
// Constants
//
const scriptName = 'eas-build'
const scriptCommand = 'pnpm eas:build'

//
// Arguments
//
type ArgNames = keyof typeof parsedArgs
type Args = { [K in ArgNames]: NonNullable<(typeof parsedArgs)[K]> }

const args = minimist(process.argv.slice(2), {
  boolean: ['addNewDevices', 'local', 'verbose', 'help'],
  string: ['platform', 'profile'],
  alias: { v: 'verbose', h: 'help' },
})

const parsedArgs = {
  platform: args.platform as string | undefined,
  profile: args.profile as string | undefined,
  addNewDevices: args['addNewDevices'] ? true : undefined,
  local: args.local ? true : undefined,
  verbose: Boolean(args.verbose),
  help: Boolean(args.help),
}

const accumulatedArgs: Partial<Args> = {
  verbose: parsedArgs.verbose,
  help: parsedArgs.help,
}

//
// Cache
//
type Cache = {
  args: Partial<Args>
}

const repoRoot = process.cwd()
const cacheDir = path.join(repoRoot, 'node_modules', '.cache', scriptName)
const cacheFile = path.join(cacheDir, 'cache.json')

async function readCache() {
  try {
    const cache = (await fs.readJson(cacheFile)) as Cache
    cache.args = cache.args || {}
    return cache
  } catch {
    return { args: {} }
  }
}

async function writeCache(cache: Cache) {
  await fs.ensureDir(cacheDir)
  await fs.writeJson(cacheFile, cache, { spaces: 2 })
}

const cache = await readCache()

//
// Logging
//
function log(...args: Parameters<typeof console.log>) {
  console.log(...args)
}

function debug(...args: Parameters<typeof console.log>) {
  if (parsedArgs.verbose) console.log(`[${scriptName}]`, ...args)
}

//
// Help
//
if (parsedArgs.help) {
  log(`Usage: ${scriptCommand} [options]

Options:
  --platform <string>    Platform to build (all, ios, android)
  --profile <string>     Build profile (development, preview, production)
  --local                Run an iOS or Android build locally
  --addNewDevices        Register iOS devices for a development build
  --verbose, -v          Enable debug logs
  --help, -h             Show help
`)
  process.exit(0)
}

//
// Script
//
const platform = await (async function () {
  let response: string

  if (parsedArgs.platform !== undefined) {
    response = parsedArgs.platform
  } else {
    response = await select<string>({
      message: 'Select platform',
      default: cache.args.platform ?? 'all',
      choices: [
        { name: 'All', value: 'all' },
        { name: 'iOS', value: 'ios' },
        { name: 'Android', value: 'android' },
      ],
    })
  }

  if (response !== 'all' && response !== 'ios' && response !== 'android') {
    log('The build platform must be all, ios, or android.')
    process.exit(1)
  }

  cache.args.platform = response
  accumulatedArgs.platform = response

  debug('platform:', response)
  await writeCache(cache)

  return response
})()

const profile = await (async function () {
  let response: string

  if (parsedArgs.profile !== undefined) {
    response = parsedArgs.profile
  } else {
    response = await select<string>({
      message: 'Select profile',
      default: cache.args.profile ?? 'preview',
      choices: [
        { name: 'Development', value: 'development' },
        { name: 'Preview', value: 'preview' },
        { name: 'Production', value: 'production' },
      ],
    })
  }

  if (response !== 'development' && response !== 'preview' && response !== 'production') {
    log('The build profile must be development, preview, or production. PR previews are created by CI.')
    process.exit(1)
  }

  cache.args.profile = response
  accumulatedArgs.profile = response

  debug('profile:', response)
  await writeCache(cache)

  return response
})()

const local = await (async function () {
  if (platform === 'all') {
    if (parsedArgs.local) {
      log('Local builds require an iOS or Android platform.')
      process.exit(1)
    }

    debug('local: false (not available for all platforms)')
    return false
  }

  let response: boolean

  if (parsedArgs.local !== undefined) {
    response = parsedArgs.local
  } else {
    response = await confirm({
      message: 'Run this build locally?',
      default: cache.args.local ?? false,
    })
  }

  cache.args.local = response
  accumulatedArgs.local = response

  debug('local:', response)
  await writeCache(cache)

  return response
})()

const addNewDevices = await (async function () {
  if (profile !== 'development' || platform !== 'ios') {
    if (parsedArgs.addNewDevices) {
      log('Registering devices requires an iOS development build.')
      process.exit(1)
    }

    debug('addNewDevices: false (only available for iOS development builds)')
    return false
  }

  let response: boolean

  if (parsedArgs.addNewDevices !== undefined) {
    response = parsedArgs.addNewDevices
  } else {
    response = await select({
      message: 'Are there new iOS devices to register?',
      default: cache.args.addNewDevices ?? false,
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
    })
  }

  if (response && local) {
    log('Registering devices requires a cloud build so EAS can refresh the ad hoc profile.')
    process.exit(1)
  }

  cache.args.addNewDevices = response
  accumulatedArgs.addNewDevices = response

  debug('addNewDevices:', response)
  await writeCache(cache)

  return response
})()

//
// Build command
//
const localArgs = local ? ['--local'] : []
const provisioningArgs = addNewDevices ? ['--refresh-ad-hoc-provisioning-profile'] : []
const buildCommand = `npx eas-cli@latest build --profile ${profile} --platform ${platform} --non-interactive${local ? ' --local' : ''}${addNewDevices ? ' --refresh-ad-hoc-provisioning-profile' : ''}`

if (addNewDevices) {
  log(`\n> npx eas-cli@latest device:create\n> ${buildCommand}\n`)
} else {
  log(`\n> ${buildCommand}\n`)
}

const shouldProceed = await confirm({
  message: 'Proceed?',
  default: true,
})

if (!shouldProceed) {
  log('Aborted')
  process.exit(0)
}

try {
  if (addNewDevices) {
    await $({ stdio: 'inherit' })`npx eas-cli@latest device:create`
  }

  await $({
    stdio: 'inherit',
  })`npx eas-cli@latest build --profile ${profile} --platform ${platform} --non-interactive ${localArgs} ${provisioningArgs}`
} catch (error) {
  log('\nBuild failed:', (error as Error).message)
  process.exitCode = 1
}

//
// Repeatable CLI command
//
const stringArgs = Object.entries(accumulatedArgs).reduce((args, [key, value]) => {
  if (value === undefined) return args

  if (typeof value === 'boolean') {
    if (value) args += ` --${key}`
  } else {
    args += ` --${key} "${value}"`
  }

  return args
}, '')

log(`\nYou can re-run this script with same settings using the following command:\n`, `${scriptCommand}${stringArgs}`)

export {}
