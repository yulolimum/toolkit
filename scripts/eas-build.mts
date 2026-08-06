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
  boolean: ['addNewDevices', 'verbose', 'help'],
  string: ['platform', 'profile', 'distribution'],
  alias: { v: 'verbose', h: 'help' },
})

const parsedArgs = {
  platform: args.platform as string | undefined,
  profile: args.profile as string | undefined,
  distribution: args.distribution as string | undefined,
  addNewDevices: args['addNewDevices'] ? true : undefined,
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
  --platform <string>       Platform to build (all, ios, android)
  --profile <string>        Build profile (development, preview, production)
  --distribution <string>   Distribution method (store, internal)
  --addNewDevices         Register new iOS devices before build
  --verbose, -v             Enable debug logs
  --help, -h                Show help
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

  cache.args.profile = response
  accumulatedArgs.profile = response

  debug('profile:', response)
  await writeCache(cache)

  return response
})()

const distribution = await (async function () {
  if (profile === 'development') {
    const response = 'development'

    cache.args.distribution = response
    accumulatedArgs.distribution = response

    debug('distribution:', response, '(auto-selected for development profile)')
    await writeCache(cache)

    return response
  }

  let response: string

  if (parsedArgs.distribution !== undefined) {
    response = parsedArgs.distribution
  } else {
    let choices: Array<{ name: string; value: string; description?: string }>

    if (platform === 'ios') {
      choices = [
        { name: 'TestFlight', value: 'store' },
        { name: 'EAS (ad-hoc)', value: 'internal' },
      ]
    } else if (platform === 'android') {
      choices = [
        { name: 'Play Store (Internal Testing)', value: 'store' },
        { name: 'EAS (apk)', value: 'internal' },
      ]
    } else {
      choices = [
        { name: 'Store', value: 'store', description: 'TestFlight (iOS) and Play Store (Android)' },
        { name: 'Internal', value: 'internal', description: 'EAS (ad-hoc) for iOS and EAS (apk) for Android' },
      ]
    }

    response = await select({
      message: 'Select distribution',
      default: cache.args.distribution ?? 'internal',
      choices,
    })
  }

  cache.args.distribution = response
  accumulatedArgs.distribution = response

  debug('distribution:', response)
  await writeCache(cache)

  return response
})()

const addNewDevices = await (async function () {
  if (platform === 'android') {
    debug('addNewDevices: false (not applicable for Android)')
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

  cache.args.addNewDevices = response
  accumulatedArgs.addNewDevices = response

  debug('addNewDevices:', response)
  await writeCache(cache)

  return response
})()

//
// Build command
//
const profileOption = distribution === 'internal' ? `${profile}:internal` : profile
const localArgs = profile === 'development' ? ['--local'] : []

if (addNewDevices) {
  log(
    `\nTo register new devices, the following command needs to be run manually:\n > npx eas-cli@latest build -e ${profileOption} -p ${platform}\n`,
  )
  process.exit(0)
}

log(
  `\n> npx eas-cli@latest build -e ${profileOption} -p ${platform} --non-interactive${localArgs.length ? ' --local' : ''}\n`,
)

const shouldProceed = await confirm({
  message: 'Proceed?',
  default: true,
})

if (!shouldProceed) {
  log('Aborted')
  process.exit(0)
}

try {
  await $({
    stdio: 'inherit',
  })`npx eas-cli@latest build -e ${profileOption} -p ${platform} --non-interactive ${localArgs}`
} catch (error) {
  log('\nBuild failed:', (error as Error).message)
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
