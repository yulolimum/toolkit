process.env.FORCE_COLOR ||= '1'

import checkbox from '@inquirer/checkbox'
import path from 'node:path'
import process from 'node:process'
import { $, fs, minimist, spinner } from 'zx'

const scriptName = 'dev-check-code-quality'
const scriptCommand = 'pnpm dev:check-code-quality'
const allTools = ['tsc', 'eslint', 'prettier'] as const

type Tool = (typeof allTools)[number]

type ArgNames = keyof typeof parsedArgs
type Args = { [K in ArgNames]: NonNullable<(typeof parsedArgs)[K]> }

const args = minimist(process.argv.slice(2), {
  boolean: ['all', 'verbose', 'help'],
  string: ['tools'],
  alias: { v: 'verbose', h: 'help' },
})

const paths = args._.map(String)
const parsedArgs = {
  all: Boolean(args.all),
  tools: args.tools as string | undefined,
  verbose: Boolean(args.verbose),
  help: Boolean(args.help),
}

const accumulatedArgs: Partial<Args> = {
  all: parsedArgs.all,
  tools: parsedArgs.tools,
  verbose: parsedArgs.verbose,
  help: parsedArgs.help,
}

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

function log(...args: Parameters<typeof console.log>) {
  console.log(...args)
}

function debug(...args: Parameters<typeof console.log>) {
  if (parsedArgs.verbose) console.log(`[${scriptName}]`, ...args)
}

if (parsedArgs.help) {
  log(`Usage: ${scriptCommand} [paths...] [options]

Options:
  --all                 Run all checks without prompting
  --tools <list>        Run a comma-separated list: tsc, eslint, prettier
  --verbose, -v         Enable debug logs
  --help, -h            Show help
`)
  process.exit(0)
}

if (parsedArgs.all && parsedArgs.tools !== undefined) {
  log('Use either --all or --tools, not both.')
  process.exit(1)
}

function parseTools(value: string) {
  const tools = value
    .split(',')
    .map((tool) => tool.trim())
    .filter(Boolean)

  const invalidTools = tools.filter((tool) => !allTools.includes(tool as Tool))

  if (invalidTools.length > 0) {
    log(`Unknown tools: ${invalidTools.join(', ')}. Choose from: ${allTools.join(', ')}.`)
    process.exit(1)
  }

  if (tools.length === 0) {
    log(`Choose at least one tool: ${allTools.join(', ')}.`)
    process.exit(1)
  }

  return [...new Set(tools)] as Tool[]
}

const tools = await (async function () {
  let response: Tool[]

  if (parsedArgs.all) {
    response = [...allTools]
  } else if (parsedArgs.tools !== undefined) {
    response = parseTools(parsedArgs.tools)
  } else {
    const cachedTools = cache.args.tools
      ? cache.args.tools
          .split(',')
          .map((tool) => tool.trim())
          .filter((tool): tool is Tool => allTools.includes(tool as Tool))
      : [...allTools]

    response = await checkbox<Tool>({
      message: 'Which formatting/linting options do you want to run?',
      choices: [
        {
          name: 'Type Check',
          value: 'tsc',
          description: '- runs tsc',
          checked: cachedTools.includes('tsc'),
        },
        {
          name: 'Lint',
          value: 'eslint',
          description: '- runs eslint for included files',
          checked: cachedTools.includes('eslint'),
        },
        {
          name: 'Prettier',
          value: 'prettier',
          description: '- runs prettier',
          checked: cachedTools.includes('prettier'),
        },
      ],
    })
  }

  const toolsArgument = response.join(',')

  cache.args.tools = toolsArgument
  accumulatedArgs.tools = parsedArgs.all ? undefined : toolsArgument

  debug('tools:', response)
  await writeCache(cache)

  return response
})()

for (const tool of tools) {
  debug('Running tool:', tool)

  const output = await spinner(`Running ${tool}...`, async function () {
    if (tool === 'tsc') {
      return $({ nothrow: true })`tsc --noEmit`
    }

    const targetPaths = paths.length ? paths : tool === 'eslint' ? '.' : '**/*.{json,md,yml,yaml,html,scss,css,sh}'

    if (tool === 'eslint') {
      return $({ nothrow: true })`eslint --fix --cache --format=pretty ${targetPaths}`
    }

    return $({ nothrow: true })`prettier --write ${targetPaths} --cache --log-level=error`
  })

  if (output.exitCode !== 0) {
    log(`❌ Error running ${tool}: ${output.stdout || output.stderr}`)
    process.exit(1)
  }

  log(`✅ ${tool} completed successfully`)

  if (output.stdout) log(output.stdout)
}

const stringArgs = Object.entries(accumulatedArgs).reduce((args, [key, value]) => {
  if (value === undefined) return args

  if (typeof value === 'boolean') {
    if (value) args += ` --${key}`
  } else {
    args += ` --${key} "${value}"`
  }

  return args
}, '')

const stringPaths = paths.map((targetPath) => ` ${JSON.stringify(targetPath)}`).join('')

log(
  '\nYou can re-run this script with the same settings using the following command:\n',
  `${scriptCommand}${stringArgs}${stringPaths}`,
)

export {}
