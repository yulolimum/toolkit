process.env.FORCE_COLOR ||= '1'

import confirm from '@inquirer/confirm'
import input from '@inquirer/input'
import select from '@inquirer/select'
import path from 'node:path'
import process from 'node:process'
import { $, fs, minimist } from 'zx'

//
// Constants
//
const scriptName = 'eas-update'
const scriptCommand = 'pnpm eas:update'
const updateTargets = {
  preview: { channel: 'preview', environment: 'preview' },
  production: { channel: 'production', environment: 'production' },
}

//
// Arguments
//
type ArgNames = keyof typeof parsedArgs
type Args = { [K in ArgNames]: NonNullable<(typeof parsedArgs)[K]> }

const args = minimist(process.argv.slice(2), {
  boolean: ['verbose', 'help'],
  string: ['platform', 'profile', 'message'],
  alias: { v: 'verbose', h: 'help' },
})

const parsedArgs = {
  platform: args.platform as string | undefined,
  profile: args.profile as string | undefined,
  message: args.message as string | undefined,
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
  --platform <string>   Platform to update (all, ios, android)
  --profile <string>    Update profile (preview, production)
  --message <string>    Update message (omit for auto-generated)
  --verbose, -v         Enable debug logs
  --help, -h            Show help
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
    log('The update platform must be all, ios, or android.')
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
      message: 'Select update profile',
      default: cache.args.profile ?? 'preview',
      choices: [
        { name: 'Preview', value: 'preview' },
        { name: 'Production', value: 'production' },
      ],
    })
  }

  if (response !== 'preview' && response !== 'production') {
    log('The update profile must be preview or production.')
    process.exit(1)
  }

  cache.args.profile = response
  accumulatedArgs.profile = response

  debug('profile:', response)
  await writeCache(cache)

  return response
})()

const updateTarget = updateTargets[profile]

const message = await (async function () {
  let response: string

  if (parsedArgs.message !== undefined) {
    response = parsedArgs.message
  } else {
    response = await input({
      message: 'Update message (leave empty for auto):',
      default: '',
    })
  }

  if (response) {
    accumulatedArgs.message = response
  }

  debug('message:', response || '(auto)')

  return response
})()

//
// Update command
//
const messageArgs = message ? ['--message', message] : ['--auto']

log(
  `\n> EAS_BUILD_PROFILE=${profile} npx eas-cli@latest update --platform ${platform} --channel ${updateTarget.channel} --environment ${updateTarget.environment} ${message ? `--message "${message}"` : '--auto'} --non-interactive\n`,
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
    env: { ...process.env, EAS_BUILD_PROFILE: profile },
  })`npx eas-cli@latest update --platform ${platform} --channel ${updateTarget.channel} --environment ${updateTarget.environment} ${messageArgs} --non-interactive`
} catch (error) {
  log('\nUpdate failed:', (error as Error).message)
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
