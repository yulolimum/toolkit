process.env.FORCE_COLOR = '1'

import checkbox from '@inquirer/checkbox' // @^4
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { $, fs, minimist, spinner } from 'zx' // @^8

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cacheFile = path.join(__dirname, '.cache')
let cache

try {
  cache = await fs.readJson(cacheFile)
  cache.checkCodeQuality = cache.checkCodeQuality ?? {}
} catch (_error) {
  cache = { checkCodeQuality: {} }
}

const { _: paths, all } = minimist(process.argv.slice(2), {
  boolean: ['all'],
  default: { all: false },
})

const tools = all
  ? ['tsc', 'eslint', 'prettier']
  : await checkbox({
      message: 'Which formatting/linting options do you want to run?',
      choices: [
        {
          name: 'Type Check',
          value: 'tsc',
          description: '- runs `tsc`',
          checked: cache.checkCodeQuality.tools?.includes('tsc') ?? true,
        },
        {
          name: 'Lint',
          value: 'eslint',
          description: '- runs eslint for included files',
          checked: cache.checkCodeQuality.tools?.includes('eslint') ?? true,
        },
        {
          name: 'Prettier',
          value: 'prettier',
          description: '- runs prettier',
          checked: cache.checkCodeQuality.tools?.includes('prettier') ?? true,
        },
      ],
    })

fs.writeJson(cacheFile, {
  ...cache,
  checkCodeQuality: { tools },
})

for (const tool of tools) {
  const output = await spinner(`Running ${tool}...`, async function () {
    switch (tool) {
      case 'tsc':
        return await $({ nothrow: true })`tsc --noEmit`
      case 'eslint':
        return await $({ nothrow: true })`eslint --fix --cache --format=pretty ${paths.length ? paths : '.'}`
      case 'prettier':
        return await $({
          nothrow: true,
        })`prettier --write ${paths.length ? paths : '**/*.{json,md,yml,yaml,html,scss,css,sh}'} --cache --log-level=error`
      default:
        console.error(`Unknown command: ${tool}`)
        return { exitCode: 1, stdout: '', stderr: '' }
    }
  })

  if (output.exitCode !== 0) {
    console.error(`❌ Error running ${tool}: ${output.stdout || output.stderr}`)
    process.exit(1)
  } else {
    console.log(`✅ ${tool} completed successfully`)
    console.log(output.stdout)
  }
}
