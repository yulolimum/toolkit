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
  cache.easBuild = cache.easBuild ?? {}
} catch (_error) {
  cache = { easBuild: {} }
}

let platform = await select({
  message: 'Select platform',
  default: cache.easBuild.platform ?? 'all',
  choices: [
    { name: 'All', value: 'all' },
    { name: 'iOS', value: 'ios' },
    { name: 'Android', value: 'android' },
  ],
})

const profile = await select({
  message: 'Select profile',
  default: cache.easBuild.profile ?? 'preview',
  choices: [
    { name: 'Preview', value: 'preview' },
    { name: 'Production', value: 'production' },
  ].filter(Boolean),
})

const distribution = await (async function () {
  let choices = []

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

  return await select({
    message: 'Select distribution',
    default: cache.easBuild.distribution ?? 'internal',
    choices,
  })
})()

const runOnEAS = await (async function () {
  if (distribution === 'internal') {
    return true
  } else {
    return await select({
      message: 'Run on EAS Servers?',
      default: cache.easBuild.runOnEAS ?? true,
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false, description: 'Creating the build locally will require manual submission.' },
      ],
    })
  }
})()

const outputFlag = runOnEAS
  ? ''
  : platform === 'ios'
    ? '--output build/ios/build.ipa'
    : '--output build/android/app-release.aab'

const localFlag = runOnEAS ? '' : '--local'

const profileOption = distribution === 'store' ? profile : `${profile}:${distribution}`

const cmd = `npx eas-cli@latest build -e ${profileOption} -p ${platform} --non-interactive ${outputFlag} ${localFlag}`

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
  easBuild: { platform, profile, distribution, runOnEAS },
})

spawn(cmd, { stdio: 'inherit', shell: true })

export {}
