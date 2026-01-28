#!/usr/bin/env zx

import select from '@inquirer/select'
import axios from 'axios'
import { spawn } from 'child_process'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { chalk, dotenv, fs, path, spinner } from 'zx'

dotenv.config('.env')

const __dirname = dirname(fileURLToPath(import.meta.url))
const cacheFile = path.join(__dirname, '.cache')

// Load cache
let cache = {}
try {
  cache = await fs.readJson(cacheFile)
} catch (_error) {
  cache = {}
}

cache.mediaTwitch = cache.mediaTwitch ?? {}

// Validate environment variables
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET
const TWITCH_STREAMLINK_OAUTH = process.env.TWITCH_STREAMLINK_OAUTH

if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
  console.error('❌ Missing required environment variables:')
  console.error('   TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in .env')
  process.exit(1)
}

if (!TWITCH_STREAMLINK_OAUTH) {
  console.error('❌ Missing required environment variable:')
  console.error('   TWITCH_STREAMLINK_OAUTH must be set in .env')
  console.error('   This is the OAuth token for streamlink (not the API token)')
  process.exit(1)
}

/**
 * Get valid access token (refresh if expired, or start device flow if needed)
 */
async function getAccessToken() {
  const now = Date.now()

  // Check if we have a valid cached token
  if (cache.mediaTwitch.accessToken && cache.mediaTwitch.expiresAt && cache.mediaTwitch.expiresAt > now) {
    return cache.mediaTwitch.accessToken
  }

  // Try to refresh token if we have a refresh token
  if (cache.mediaTwitch.refreshToken) {
    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          refresh_token: cache.mediaTwitch.refreshToken,
          grant_type: 'refresh_token',
        },
      })

      cache.mediaTwitch.accessToken = response.data.access_token
      cache.mediaTwitch.refreshToken = response.data.refresh_token
      cache.mediaTwitch.expiresAt = now + response.data.expires_in * 1000

      await fs.writeJson(cacheFile, cache)
      return cache.mediaTwitch.accessToken
    } catch (error) {
      console.log('⚠️  Token refresh failed, starting new authorization...')
    }
  }

  // Start device authorization flow
  return await deviceAuthorizationFlow()
}

/**
 * Device authorization flow for first-time setup
 */
async function deviceAuthorizationFlow() {
  console.log('🔐 Starting Twitch authorization...\n')

  // Step 1: Request device code
  const deviceResponse = await axios.post('https://id.twitch.tv/oauth2/device', null, {
    params: {
      client_id: TWITCH_CLIENT_ID,
      scopes: 'user:read:follows',
    },
  })

  const { device_code, user_code, verification_uri, expires_in, interval } = deviceResponse.data

  console.log('📱 Please authorize this app:')
  console.log(`   1. Go to: ${chalk.cyan(verification_uri)}`)
  console.log(`   2. Enter code: ${chalk.yellow(user_code)}`)
  console.log('\n⏳ Waiting for authorization...\n')

  // Step 2: Poll for token
  const pollInterval = (interval || 5) * 1000
  const expiresAt = Date.now() + expires_in * 1000

  while (Date.now() < expiresAt) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval))

    try {
      const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: TWITCH_CLIENT_ID,
          device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        },
      })

      // Success! Store tokens
      const now = Date.now()
      cache.mediaTwitch.accessToken = tokenResponse.data.access_token
      cache.mediaTwitch.refreshToken = tokenResponse.data.refresh_token
      cache.mediaTwitch.expiresAt = now + tokenResponse.data.expires_in * 1000

      await fs.writeJson(cacheFile, cache)

      console.log('✅ Authorization successful!\n')
      return cache.mediaTwitch.accessToken
    } catch (error) {
      // Expected errors during polling
      if (error.response?.data?.message === 'authorization_pending') {
        continue
      }
      if (error.response?.data?.message === 'slow_down') {
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
        continue
      }
      throw error
    }
  }

  throw new Error('Authorization timed out')
}

/**
 * Fetch user ID
 */
async function getUserId(accessToken) {
  const response = await axios.get('https://api.twitch.tv/helix/users', {
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response.data.data[0].id
}

/**
 * Fetch followed channels
 */
async function getFollowedChannels(accessToken, userId) {
  const response = await axios.get('https://api.twitch.tv/helix/channels/followed', {
    params: {
      user_id: userId,
      first: 100,
    },
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response.data.data
}

/**
 * Get live streams for followed channels
 */
async function getLiveStreams(accessToken, channelIds) {
  if (channelIds.length === 0) {
    return []
  }

  const response = await axios.get('https://api.twitch.tv/helix/streams', {
    params: {
      user_id: channelIds,
      first: 100,
    },
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response.data.data
}

/**
 * Calculate elapsed time from stream start
 */
function getElapsedTime(startedAt) {
  const now = new Date()
  const start = new Date(startedAt)
  const diffMs = now - start
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

/**
 * Main execution
 */
async function main() {
  try {
    // Get valid access token
    const accessToken = await getAccessToken()

    // Fetch user ID
    const userId = await spinner('Fetching user info...', () => getUserId(accessToken))

    // Fetch followed channels
    const followedChannels = await spinner('Fetching followed channels...', () =>
      getFollowedChannels(accessToken, userId),
    )

    if (followedChannels.length === 0) {
      console.log('⚠️  You are not following any channels')
      process.exit(0)
    }

    // Get live streams
    const channelIds = followedChannels.map((channel) => channel.broadcaster_id)
    const liveStreams = await spinner('Checking for live streams...', () => getLiveStreams(accessToken, channelIds))

    if (liveStreams.length === 0) {
      console.log('⚠️  None of your followed channels are currently live')
      process.exit(0)
    }

    // Merge followed channel data with live stream data
    const enrichedStreams = liveStreams.map((stream) => {
      const followData = followedChannels.find((channel) => channel.broadcaster_id === stream.user_id)
      return {
        ...stream,
        followed_at: followData?.followed_at,
      }
    })

    // Sort by followed_at (oldest follows first)
    enrichedStreams.sort((a, b) => new Date(a.followed_at) - new Date(b.followed_at))

    // Create selection choices with new format
    const choices = enrichedStreams.map((stream) => {
      const viewers = stream.viewer_count.toLocaleString()
      const elapsed = getElapsedTime(stream.started_at)
      return {
        name: `${stream.user_name}   -   ${stream.game_name}   -   ${elapsed} (${viewers} viewers)`,
        description: stream.title,
        value: stream.user_login,
      }
    })

    // Prompt user to select stream
    const selectedChannel = await select({
      message: 'Select a stream to watch:',
      choices,
      default: cache.mediaTwitch.lastChannel,
    })

    // Cache last selected channel
    cache.mediaTwitch.lastChannel = selectedChannel
    await fs.writeJson(cacheFile, cache)

    // Launch streamlink in background
    console.log(`\n🎬 Launching stream: ${selectedChannel}\n`)

    spawn(
      'streamlink',
      [
        `--twitch-api-header=Authorization=OAuth ${TWITCH_STREAMLINK_OAUTH}`,
        '--twitch-disable-ads',
        '--twitch-low-latency',
        `https://www.twitch.tv/${selectedChannel}`,
        'best',
      ],
      {
        detached: true,
        stdio: 'inherit',
      },
    ).unref()
  } catch (error) {
    if (error.response) {
      console.error(`❌ Twitch API error: ${error.response.data.message || error.message}`)
    } else {
      console.error(`❌ Error: ${error.message}`)
    }
    process.exit(1)
  }
}

main()
