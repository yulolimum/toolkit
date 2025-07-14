import confirm from '@inquirer/confirm'
import input from '@inquirer/input'
import select from '@inquirer/select'
import { LinearClient } from '@linear/sdk'
import axios from 'axios'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { dotenv, fs, minimist, sleep, spinner } from 'zx'

dotenv.config('.env')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cacheFile = path.join(__dirname, '.cache')
let cache

try {
  cache = await fs.readJson(cacheFile)
  cache.linearClockifyTimer = cache.linearClockifyTimer ?? {}
} catch (_error) {
  cache = { linearClockifyTimer: {} }
}

const { url } = minimist(process.argv.slice(2), {
  string: ['url'],
  default: { url: null },
})

const LINEAR_API_KEY = process.env.LINEAR_API_KEY
const CLOCKIFY_API_KEY = process.env.CLOCKIFY_API_KEY

// Validate required environment variables
if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY is required. Please add it to your .env file.')
  process.exit(1)
}

if (!CLOCKIFY_API_KEY) {
  console.error('❌ CLOCKIFY_API_KEY is required. Please add it to your .env file.')
  process.exit(1)
}

// Initialize API clients
const linear = new LinearClient({ apiKey: LINEAR_API_KEY })
const clockify = axios.create({
  baseURL: 'https://api.clockify.me/api/v1',
  headers: { 'X-Api-Key': CLOCKIFY_API_KEY },
})

// Get Linear issue URL (first step)
const linearUrl = await input({
  message: 'Enter the Linear issue URL:',
  default: url ?? cache.linearClockifyTimer.url ?? '',
  required: true,
})

// Validate Linear URL format
const linearIssueId = linearUrl.match(/linear\.app\/[^/]+\/issue\/([^/]+)/)?.[1]

if (!linearIssueId) {
  console.error('❌ Invalid Linear issue URL. Please provide a valid URL.')
  process.exit(1)
}

// Fetch Linear issue details
const linearIssue = await linear.issue(linearIssueId)

if (!linearIssue) {
  console.error(`❌ Issue with ID ${linearIssueId} not found.`)
  process.exit(1)
}

// Use cached workspace or prompt for selection
let workspaceId = cache.linearClockifyTimer.workspaceId

if (!workspaceId) {
  // Fetch available workspaces from Clockify
  const workspacesResponse = await clockify.get('/workspaces')
  const workspaces = workspacesResponse.data

  if (!workspaces || workspaces.length === 0) {
    console.error('❌ No workspaces found. Please check your Clockify API key.')
    process.exit(1)
  }

  // Present workspaces to user for selection
  workspaceId = await select({
    message: 'Select a Clockify workspace:',
    choices: workspaces.map((workspace: any) => ({
      name: `${workspace.name} (${workspace.id})`,
      value: workspace.id,
    })),
  })

  // Update cache with selected workspace
  await fs.writeJson(cacheFile, {
    ...cache,
    linearClockifyTimer: {
      ...cache.linearClockifyTimer,
      workspaceId,
    },
  })
}

// Fetch available projects from the selected workspace
const projectsResponse = await clockify.get(`/workspaces/${workspaceId}/projects`)
const projects = projectsResponse.data

if (!projects || projects.length === 0) {
  console.error('❌ No projects found in the selected workspace.')
  process.exit(1)
}

// Present projects to user for selection (always prompt, but use cache as default)
const projectId = await select({
  message: 'Select a project:',
  choices: projects.map((project: any) => ({
    name: `${project.name} (${project.clientName || 'No client'})`,
    value: project.id,
  })),
  default: cache.linearClockifyTimer.projectId ?? null,
})

// Update cache with all selections
await fs.writeJson(cacheFile, {
  ...cache,
  linearClockifyTimer: {
    ...cache.linearClockifyTimer,
    url: linearUrl,
    workspaceId,
    projectId,
  },
})

// Extract Linear issue details
const { url: issueUrl, title: linearTitle, identifier: linearId } = linearIssue

// Start Clockify timer
const startTime = Date.now()

const clockifyParams = {
  billable: true,
  description: `[${linearId}] ${linearTitle} - ${issueUrl}`,
  projectId,
  start: new Date(startTime).toISOString(),
  type: 'REGULAR',
}

const startTimerResponse = await clockify.post(`/workspaces/${workspaceId}/time-entries`, clockifyParams)

if (startTimerResponse.statusText !== 'Created') {
  console.error('❌ Failed to start timer:', startTimerResponse)
  process.exit(1)
}

const timerId = startTimerResponse.data.id

function calculateElapsedTime() {
  const elapsed = Date.now() - startTime
  const seconds = Math.floor(elapsed / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingSeconds = seconds % 60
  const remainingMinutes = minutes % 60
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (remainingMinutes > 0 || hours > 0) parts.push(`${remainingMinutes}m`)
  parts.push(`${remainingSeconds}s`)
  return parts.join(' ')
}

async function logTime() {
  return spinner(calculateElapsedTime(), () => sleep(1000))
}

let stopSpinner = true

process.on('SIGINT', async () => {
  stopSpinner = false
  process.stdout.write('\r')
  await sleep(1000)
  process.stdout.write('\r')

  const stopTracking = await confirm({ message: 'Stop time tracking?', default: true })

  if (stopTracking) {
    await clockify.put(`/workspaces/${workspaceId}/time-entries/${timerId}`, {
      ...clockifyParams,
      end: new Date().toISOString(),
    })
  }

  console.info(`Total Time Logged: ${calculateElapsedTime()}`)

  process.exit(0)
})

while (stopSpinner) {
  await logTime()
}
