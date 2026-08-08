process.env.FORCE_COLOR = '1'

import input from '@inquirer/input' // @^5
import select from '@inquirer/select' // @^5
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { $, fs, minimist, spinner } from 'zx' // @^8

const __dirname = dirname(fileURLToPath(import.meta.url))
const cacheFile = path.join(__dirname, '.cache')

const cache = await fs.readJson(cacheFile).catch(() => ({}))

cache.mediaAccelerate = cache.mediaAccelerate ?? {}

const {
  _: [file],
} = minimist(process.argv.slice(2))

let inputFilePath
if (file) {
  inputFilePath = file
} else {
  inputFilePath = await input({
    message: 'Enter path to video file:',
    validate: (value) => {
      if (!value.trim()) {
        return 'Please enter a file path'
      }
      return true
    },
  })
}

inputFilePath = inputFilePath.trim()

if (!(await fs.pathExists(inputFilePath))) {
  console.error(`❌ Error: File '${inputFilePath}' does not exist`)
  process.exit(1)
}

const filePath = path.resolve(inputFilePath)
const fileName = path.basename(filePath)
const fileExt = path.extname(filePath)
const fileNameWithoutExt = path.basename(filePath, fileExt)

console.log(`🎬 Processing video: ${fileName}`)

const includeAudio = await select({
  message: 'Include audio in accelerated video?',
  choices: [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ],
  default: cache.mediaAccelerate.includeAudio ?? true,
})

// Ask for speed multiplier
const speed = await input({
  message: 'Enter speed multiplier (e.g., 2.0 for 2x speed):',
  default: cache.mediaAccelerate.speed ?? '1.5',
  validate: (value) => {
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0) {
      return 'Please enter a valid positive number'
    }
    return true
  },
})

cache.mediaAccelerate = { includeAudio, speed }
await fs.writeJson(cacheFile, cache)

const videoSpeed = 1 / parseFloat(speed)

const speedFormatted = speed.replace('.', '_')
const outputFile = `${fileNameWithoutExt}_${speedFormatted}x${fileExt}`
const outputPath = path.join(path.dirname(filePath), outputFile)

let ffmpegCommand
if (includeAudio) {
  ffmpegCommand = [
    'ffmpeg',
    '-i',
    filePath,
    '-filter_complex',
    `[0:v]setpts=${videoSpeed}*PTS[v];[0:a]atempo=${speed}[a]`,
    '-map',
    '[v]',
    '-map',
    '[a]',
    outputPath,
  ]
} else {
  ffmpegCommand = [
    'ffmpeg',
    '-i',
    filePath,
    '-filter_complex',
    `[0:v]setpts=${videoSpeed}*PTS[v]`,
    '-map',
    '[v]',
    outputPath,
  ]
}

console.log(`🚀 Accelerating video by ${speed}x${includeAudio ? ' (with audio)' : ' (video only)'}...`)

try {
  await spinner('Processing video...', async () => {
    await $`${ffmpegCommand}`
  })

  console.log(`✅ Video acceleration complete!`)
  console.log(`📁 Output: ${outputFile}`)
} catch (error) {
  console.error(`❌ Error processing video: ${error.message}`)
  process.exit(1)
}
