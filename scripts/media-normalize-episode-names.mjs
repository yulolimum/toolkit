process.env.FORCE_COLOR = '1'

import confirm from '@inquirer/confirm' // @^5
import axios from 'axios'
import path from 'path'
import { dotenv, fs, minimist } from 'zx' // @^8

dotenv.config('.env')

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

// Validate required environment variables
if (!OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY is required. Please add it to your .env file.')
  process.exit(1)
}

// Initialize OpenRouter API client
const openrouter = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
})

// Video file extensions to process
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.ts', '.m2ts']

// Parse CLI arguments
const {
  _: [directory],
} = minimist(process.argv.slice(2))

// Validate directory argument
if (!directory) {
  console.error('❌ Error: Directory argument is required')
  console.log('Usage: npx zx media-normalize-episode-names.mjs <directory>')
  process.exit(1)
}

// Check if directory exists
if (!(await fs.pathExists(directory))) {
  console.error(`❌ Error: Directory '${directory}' does not exist`)
  process.exit(1)
}

// Get directory stats
const dirStats = await fs.stat(directory)
if (!dirStats.isDirectory()) {
  console.error(`❌ Error: '${directory}' is not a directory`)
  process.exit(1)
}

// Scan directory for video files (no subdirectories)
console.log(`📁 Scanning directory: ${directory}`)

const items = await fs.readdir(directory)
const videoFiles = []

for (const item of items) {
  const itemPath = path.join(directory, item)
  const itemStats = await fs.stat(itemPath)

  if (itemStats.isDirectory()) {
    console.error(`❌ Error: Subdirectory '${item}' found. This script only processes flat directories.`)
    process.exit(1)
  }

  if (itemStats.isFile()) {
    const ext = path.extname(item).toLowerCase()
    if (VIDEO_EXTENSIONS.includes(ext)) {
      videoFiles.push({
        name: item,
        fullPath: path.resolve(itemPath),
        extension: ext,
      })
    }
  }
}

if (videoFiles.length === 0) {
  console.log('⚠️  No video files found in directory')
  process.exit(0)
}

console.log(`📺 Found ${videoFiles.length} video file(s)`)

// LLM function for episode name normalization using OpenRouter
async function callLLMForNormalization(files) {
  console.log('🤖 Calling OpenRouter LLM for episode name normalization...')

  try {
    // Create a list of filenames for the prompt
    const fileList = files.map((file) => file.name).join('\n')

    const prompt = `You are an expert at normalizing TV episode filenames with knowledge of international TV shows and languages. Given the following video filenames, please normalize them to a clean format.

ADVANCED RULES:
1. **Show Title Correction**: Only use official show titles when CERTAIN. When UNCERTAIN or UNKNOWN, clean the filename but keep the original show name.
2. **Russian Translation**: For Russian shows (Cyrillic or phonetic English), only translate when CERTAIN of the correct title.
3. **Format**: Use "Show Name s##e##.ext" (e.g., "Breaking Bad s01e01.mkv")
4. **Preserve Extension**: Keep the original file extension
5. **Clean Metadata**: Remove quality tags, release groups, and other metadata
6. **Season/Episode**: Extract or make reasonable assumptions for season/episode numbers

CONFIDENCE CATEGORIES:
- **CERTAIN**: Well-known international shows, exact matches to known Russian shows, clear unambiguous titles
- **UNCERTAIN**: Shows that seem familiar but not 100% sure, partial matches, could be correct but might be wrong
- **UNKNOWN**: Never heard of this show, completely unfamiliar title, no knowledge to base decision on

DECISION LOGIC:
- **CERTAIN**: Use official/corrected title and translate Russian shows to proper Cyrillic
- **UNCERTAIN/UNKNOWN**: Clean the filename but keep the original show name structure

EXAMPLES:
- "Во.все.тяжкие.s01e01.mkv" → "Breaking Bad s01e01.mkv" (if confident it's Breaking Bad)
- "Ulicy.razbityh.fonarej.Menty.(1.sezon.27.serija.iz.31).1997.DivX.DVDRip.AVI" → "Улицы разбитых фонарей s01e27.avi" (if confident in Russian phonetic → Cyrillic translation)
- "Sherlock.Holmes.2021.s01e01.x264.mkv" → "Sherlock Holmes s01e01.mkv"
- "Unknown.Show.Name.s01e01.mkv" → "Unknown Show Name s01e01.mkv" (keep cleaned filename)

Filenames to normalize:
${fileList}

Return ONLY a JSON object mapping old filename to new filename:
{
  "old_filename.ext": "Corrected Show Name s01e01.ext",
  "another_file.mkv": "Another Show s02e05.mkv"
}`

    const requestPayload = {
      model: 'anthropic/claude-3.5-sonnet', // We'll make this configurable later
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistent results
    }

    console.log('🤖 Making request to OpenRouter...')

    const startTime = Date.now()
    const response = await openrouter.post('/chat/completions', requestPayload)
    const endTime = Date.now()
    const duration = endTime - startTime

    // Collect data for summary table
    const apiSummary = {
      model: requestPayload.model,
      temperature: requestPayload.temperature,
      filesProcessed: files.length,
      duration,
      status: `${response.status} ${response.statusText}`,
      promptTokens: response.data.usage?.prompt_tokens || 'N/A',
      completionTokens: response.data.usage?.completion_tokens || 'N/A',
      totalTokens: response.data.usage?.total_tokens || 'N/A',
      totalCost: response.data.usage?.total_cost || response.data.usage?.cost || null,
      promptSize: prompt.length,
      responseSize: JSON.stringify(response.data).length,
    }

    // Display API summary using console.table
    console.log('\n🤖 OpenRouter API Summary:')
    console.table({
      Model: apiSummary.model,
      Temperature: apiSummary.temperature,
      'Files Processed': apiSummary.filesProcessed,
      'Duration (s)': (apiSummary.duration / 1000).toFixed(2),
      Status: apiSummary.status,
      'Prompt Tokens': apiSummary.promptTokens,
      'Completion Tokens': apiSummary.completionTokens,
      'Total Tokens': apiSummary.totalTokens,
      'Total Cost': apiSummary.totalCost ? `$${apiSummary.totalCost.toFixed(6)}` : 'N/A',
      'Prompt Size': `${apiSummary.promptSize.toLocaleString()} chars`,
      'Response Size': `${apiSummary.responseSize.toLocaleString()} chars`,
    })

    const content = response.data.choices[0].message.content

    // Try to parse the JSON response
    let mapping
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        mapping = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('❌ Failed to parse LLM response as JSON:', parseError.message)
      console.log('Raw response:', content)

      // Fallback: return original filenames
      mapping = {}
      files.forEach((file) => {
        mapping[file.name] = file.name
      })
    }

    return mapping
  } catch (error) {
    console.error('❌ Error calling OpenRouter API:', error.message)

    // Fallback: return original filenames
    const mapping = {}
    files.forEach((file) => {
      mapping[file.name] = file.name
    })
    return mapping
  }
}

// Call LLM for normalization
const nameMapping = await callLLMForNormalization(videoFiles)

// Present confirmation table
console.log('\n📋 Proposed episode name changes:')
console.log('─'.repeat(120))
console.log('Current Name → Proposed Name')
console.log('─'.repeat(120))

for (const [oldName, newName] of Object.entries(nameMapping)) {
  console.log(`${oldName} → ${newName}`)
}

console.log('─'.repeat(120))

// Get user confirmation
const shouldProceed = await confirm({
  message: 'Proceed with renaming these files?',
  default: false,
})

if (!shouldProceed) {
  console.log('❌ Operation cancelled')
  process.exit(0)
}

// Rename files
console.log('\n🔄 Renaming files...')

let successCount = 0
let errorCount = 0

for (const [oldName, newName] of Object.entries(nameMapping)) {
  const _oldPath = path.join(directory, oldName)
  const newPath = path.join(directory, newName)

  try {
    // Check if target file already exists
    if (await fs.pathExists(newPath)) {
      console.log(`⚠️  Skipping '${oldName}' - target file '${newName}' already exists`)
      continue
    }

    // Rename the file (works for both regular files and hardlinks)
    await fs.rename(_oldPath, newPath)
    console.log(`✅ Renamed: ${oldName} → ${newName}`)
    successCount++
  } catch (error) {
    console.error(`❌ Error renaming '${oldName}': ${error.message}`)
    errorCount++
  }
}

// Summary
console.log('\n📊 Summary:')
console.log(`✅ Successfully renamed: ${successCount} files`)
if (errorCount > 0) {
  console.log(`❌ Errors: ${errorCount} files`)
}
console.log('🎬 Episode name normalization complete!')
