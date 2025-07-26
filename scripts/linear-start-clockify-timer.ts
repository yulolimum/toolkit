import type { Issue } from '@linear/sdk'

import confirm from '@inquirer/confirm'
import input from '@inquirer/input'
import select from '@inquirer/select'
import { LinearClient } from '@linear/sdk'
import axios from 'axios'
import parse from 'parse-duration'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { dotenv, fs, minimist, sleep, spinner } from 'zx'

dotenv.config('.env')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const cacheFile = path.join(__dirname, '.cache')

type Consts = {
  linearApiKey?: string
  linearUrl?: string
  linearIssue?: Issue
  clockifyApiKey?: string
  clockifyWorkspaceId?: string
  clockifyProjectId?: string
  clockifyProjects: ClockifyProject[]
  clockifyTimerStartDate?: Date
  clockifyTimerId?: string
  clockifyTimerParams?: Record<string, any>
}
type Flags = { linearUrl?: string }
type ClockifyProject = { id: string; name: string; clientName?: string }
type Cache = { linearClockifyTimer: { linearUrl?: string; clockifyWorkspaceId?: string; clockifyProjectId?: string } }

class LinearStartClockifyTimer {
  private cache: Cache = { linearClockifyTimer: {} }
  private state: Consts = {
    linearApiKey: process.env.LINEAR_API_KEY,
    clockifyApiKey: process.env.CLOCKIFY_API_KEY,
    clockifyProjects: [],
  }
  private flags: Flags = {}
  private linear = new LinearClient({ apiKey: this.state.linearApiKey })
  private clockify = axios.create({
    baseURL: 'https://api.clockify.me/api/v1',
    headers: { 'X-Api-Key': this.state.clockifyApiKey },
  })

  constructor() {
    const validations = this.validate()

    if (validations.includes(false)) {
      console.error('❌ Validation failed. Please check your environment variables.')
      process.exit(1)
    }
  }

  private validate() {
    const validations = []

    if (!this.state.linearApiKey) {
      console.error('❌ LINEAR_API_KEY is required. Please add it to your .env file.')
      validations.push(false)
    }

    if (!this.state.clockifyApiKey) {
      console.error('❌ CLOCKIFY_API_KEY is required. Please add it to your .env file.')
      validations.push(false)
    }

    return validations
  }

  private async writeCache(cache: Cache['linearClockifyTimer']) {
    await fs.writeJson(cacheFile, {
      ...this.cache,
      linearClockifyTimer: {
        ...this.cache.linearClockifyTimer,
        ...cache,
      },
    })
    await this.getCache()
  }

  async getCache() {
    try {
      this.cache = await fs.readJson(cacheFile)
      this.cache.linearClockifyTimer = this.cache.linearClockifyTimer ?? {}
    } catch (_e) {
      this.cache = { linearClockifyTimer: {} }
    }
  }

  parseFlags() {
    const { url } = minimist(process.argv.slice(2), {
      string: ['url'],
      default: { url: undefined },
    })

    this.flags.linearUrl = url
  }

  async verifyClockifyWorkspace() {
    if (this.cache.linearClockifyTimer.clockifyWorkspaceId) {
      this.state.clockifyWorkspaceId = this.cache.linearClockifyTimer.clockifyWorkspaceId
      return
    }

    // Fetch available workspaces from Clockify
    const workspacesResponse = await this.clockify.get('/workspaces')
    const workspaces = workspacesResponse.data

    if (!workspaces || workspaces.length === 0) {
      console.error('❌ No workspaces found. Please check your Clockify API key.')
      process.exit(1)
    }

    // Present workspaces to user for selection
    this.state.clockifyWorkspaceId = await select({
      message: 'Select a Clockify workspace:',
      choices: workspaces.map((workspace: any) => ({
        name: `${workspace.name} (${workspace.id})`,
        value: workspace.id,
      })),
    })

    // Update cache with selected workspace
    await this.writeCache({ clockifyWorkspaceId: this.state.clockifyWorkspaceId })
  }

  async getClockifyProjects() {
    // Fetch available projects from the selected workspace
    const projectsResponse = await this.clockify.get<ClockifyProject[]>(
      `/workspaces/${this.state.clockifyWorkspaceId}/projects`,
    )
    const projects = projectsResponse.data

    if (!projects || projects.length === 0) {
      console.error('❌ No projects found in the selected workspace.')
      process.exit(1)
    }

    this.state.clockifyProjects = projects
  }

  async askForClockifyProject() {
    // Present projects to user for selection (always prompt, but use cache as default)
    this.state.clockifyProjectId = await select({
      message: 'Select a project:',
      choices: this.state.clockifyProjects.map((project: any) => ({
        name: `${project.name} (${project.clientName || 'No client'})`,
        value: project.id,
      })),
      default: this.cache.linearClockifyTimer.clockifyProjectId || undefined,
    })

    await this.writeCache({ clockifyProjectId: this.state.clockifyProjectId })
  }

  async askForLinearIssueUrl() {
    // Get Linear issue URL (first step)
    this.state.linearUrl = await input({
      message: 'Enter the Linear issue URL:',
      default: this.flags.linearUrl ?? this.cache.linearClockifyTimer.linearUrl ?? '',
      required: true,
    })

    // Validate Linear URL format
    const linearIssueId = this.state.linearUrl.match(/linear\.app\/[^/]+\/issue\/([^/]+)/)?.[1]

    if (!linearIssueId) {
      console.error('❌ Invalid Linear issue URL. Please provide a valid URL.')
      process.exit(1)
    }

    // Fetch Linear issue details
    this.state.linearIssue = await this.linear.issue(linearIssueId)

    if (!this.state.linearIssue) {
      console.error(`❌ Issue with ID ${linearIssueId} not found.`)
      process.exit(1)
    }

    await this.writeCache({ linearUrl: this.state.linearUrl })
  }

  async askForConfirmation() {
    const confirmation = await confirm({
      message: `Start timer?`,
      default: true,
    })

    if (confirmation) {
      await this.startClockifyTimer()

      let stopSpinner = true

      process.on('SIGINT', async () => {
        stopSpinner = false
        process.stdout.write('\r')
        await sleep(1000)
        process.stdout.write('\r')
        await this.stopClockifyTimer()
      })

      while (stopSpinner) {
        await this.logElapsedTime()
      }
    } else {
      const time = await input({
        message: 'Enter time to add (e.g., 1h30m, 45m):',
        required: true,
      })

      const timeInMs = parse(time)

      this.startClockifyTimer(timeInMs)
    }
  }

  async startClockifyTimer(duration?: number | null) {
    // Extract Linear issue details
    const { url: issueUrl, title: linearTitle, identifier: linearId } = this.state.linearIssue ?? {}

    let start: Date | undefined
    let end: Date | undefined

    if (duration) {
      start = new Date(Date.now() - duration)
      end = new Date()
    } else {
      start = new Date()
      end = undefined
    }

    // Start Clockify timer
    this.state.clockifyTimerStartDate = start

    this.state.clockifyTimerParams = {
      billable: true,
      description: `[${linearId}] ${linearTitle} - ${issueUrl}`,
      projectId: this.state.clockifyProjectId,
      start: this.state.clockifyTimerStartDate.toISOString(),
      end: end ? end.toISOString() : undefined,
      type: 'REGULAR',
    }

    const startTimerResponse = await this.clockify.post(
      `/workspaces/${this.state.clockifyWorkspaceId}/time-entries`,
      this.state.clockifyTimerParams,
    )

    if (startTimerResponse.statusText !== 'Created') {
      console.error('❌ Failed to start timer:', startTimerResponse)
      process.exit(1)
    }

    this.state.clockifyTimerId = startTimerResponse.data.id
  }

  async stopClockifyTimer() {
    const stopTracking = await confirm({ message: 'Stop time tracking?', default: true })

    if (stopTracking) {
      await this.clockify.put(
        `/workspaces/${this.state.clockifyWorkspaceId}/time-entries/${this.state.clockifyTimerId}`,
        {
          ...this.state.clockifyTimerParams,
          end: new Date().toISOString(),
        },
      )
    }

    console.info(`Total Time Logged: ${this.calculateElapsedTime()}`)

    process.exit(0)
  }

  calculateElapsedTime() {
    const elapsed = Date.now() - (this.state.clockifyTimerStartDate?.getTime() || 0)
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

  logElapsedTime() {
    return spinner(this.calculateElapsedTime(), () => sleep(1000))
  }
}

const timer = new LinearStartClockifyTimer()

timer.parseFlags()
await timer.getCache()
await timer.verifyClockifyWorkspace()
const projectsPromise = timer.getClockifyProjects()
await timer.askForLinearIssueUrl()
await projectsPromise
await timer.askForClockifyProject()
await timer.askForConfirmation()
