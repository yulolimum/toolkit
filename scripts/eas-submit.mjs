process.env.FORCE_COLOR = '1'

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
  cache.easSubmit = cache.easSubmit ?? {}
} catch (_error) {
  cache = { easSubmit: {} }
}

let platform = await select({
  message: 'Select platform',
  default: cache.easSubmit.platform ?? 'ios',
  choices: [
    { name: 'iOS', value: 'ios' },
    { name: 'Android', value: 'android' },
  ],
})

const profile = await select({
  message: 'Select profile',
  default: cache.easSubmit.profile ?? 'preview',
  choices: [
    { name: 'Preview', value: 'preview' },
    { name: 'Production', value: 'production' },
  ],
})

const localBuild = await select({
  message: 'Local build?',
  default: cache.easSubmit.localBuild ?? false,
  choices: [
    { name: 'No', value: false },
    { name: 'Yes', value: true },
  ],
})

const pathFlag = !localBuild
  ? ''
  : platform === 'ios'
    ? '--path build/ios/build.ipa'
    : '--path build/android/app-release.aab'

const cmd = `npx eas-cli@latest submit -e ${profile} -p ${platform} --no-wait ${pathFlag}`

console.log(`\n> ${cmd}\n`)
const confirm = await select({
  message: 'Proceed?',
  default: true,
  choices: [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ],
})

if (!confirm) {
  console.log('Aborted')
  process.exit(0)
}

fs.writeJson(cacheFile, {
  ...cache,
  easSubmit: { platform, profile, localBuild },
})

spawn(cmd, {
  stdio: 'inherit',
  shell: true,
})

export {}
