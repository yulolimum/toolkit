process.env.FORCE_COLOR = '1'

import input from '@inquirer/input' // @^4
import select from '@inquirer/select' // @^4
import { spawn } from 'child_process'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { fs } from 'zx' // @^8

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cacheFile = path.join(__dirname, '.cache')
let cache

try {
  cache = await fs.readJson(cacheFile)
  cache.easUpdate = cache.easUpdate ?? {}
} catch (_error) {
  cache = { easUpdate: {} }
}

const platform = await select({
  message: 'Select platform',
  default: cache.easUpdate.platform ?? 'all',
  choices: [
    { name: 'All', value: 'all' },
    { name: 'iOS', value: 'ios' },
    { name: 'Android', value: 'android' },
  ],
})

const channel = await select({
  message: 'Select channel',
  default: cache.easUpdate.channel ?? 'preview',
  choices: [
    { name: 'Preview', value: 'preview' },
    { name: 'Production', value: 'production' },
  ],
})

const message = await input({ message: 'Provide a summary/description for this update', required: false })

const messageFlag = message ? `--message "${message}"` : '--auto'

const cmd = `npx eas-cli@latest update --platform ${platform} --channel ${channel} --environment ${channel} --clear-cache ${messageFlag} --non-interactive`

console.log(`\n> ${cmd}\n`)
const confirm = await select({
  message: 'Proceed?',
  default: true,
  choices: [
    { name: 'No', value: false },
    { name: 'Yes', value: true },
  ],
})

if (!confirm) {
  console.log('Aborted')
  process.exit(0)
}

fs.writeJson(cacheFile, {
  ...cache,
  easUpdate: { platform, channel },
})

spawn(cmd, { stdio: 'inherit', shell: true })

export {}
