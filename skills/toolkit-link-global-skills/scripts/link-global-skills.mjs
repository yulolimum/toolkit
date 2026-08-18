#!/usr/bin/env node

import { lstat, mkdir, readdir, realpath, stat, symlink, unlink } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const homeDirectory = homedir()
const skillBlacklist = new Set(['toolkit-link-global-skills'])

const providers = [
  {
    name: 'Codex',
    location: '~/.agents/skills',
    directory: join(homeDirectory, '.agents', 'skills'),
  },
  {
    name: 'Claude Code',
    location: '~/.claude/skills',
    directory: join(homeDirectory, '.claude', 'skills'),
  },
  {
    name: 'Cursor',
    location: '~/.cursor/skills',
    directory: join(homeDirectory, '.cursor', 'skills'),
  },
]

function printUsage() {
  console.log(`Usage: node link-global-skills.mjs

Use ./skills from the current repository root, then link each eligible skill into
~/.agents/skills, ~/.claude/skills, and ~/.cursor/skills.`)
}

function parseArguments(arguments_) {
  for (const argument of arguments_) {
    if (argument === '--help' || argument === '-h') {
      return { help: true }
    }

    throw new Error(`Unknown argument: ${argument}`)
  }

  return {}
}

function isMissing(error) {
  return error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')
}

async function isSkillDirectory(directory) {
  try {
    const directoryStats = await stat(directory)
    const skillFileStats = await stat(join(directory, 'SKILL.md'))

    return directoryStats.isDirectory() && skillFileStats.isFile()
  } catch {
    return false
  }
}

async function getSourceSkills(skillsDirectory) {
  let entries

  try {
    entries = await readdir(skillsDirectory, { withFileTypes: true })
  } catch {
    return []
  }

  const skills = []

  for (const entry of entries) {
    if (skillBlacklist.has(entry.name)) {
      continue
    }

    const directory = join(skillsDirectory, entry.name)

    if (await isSkillDirectory(directory)) {
      skills.push({
        name: entry.name,
        directory: await realpath(directory),
      })
    }
  }

  return skills.sort((left, right) => left.name.localeCompare(right.name))
}

async function resolveSourceSkillsDirectory() {
  const directory = join(process.cwd(), 'skills')

  if (!(await isDirectory(directory))) {
    throw new Error('No ./skills directory was found. Run this from a repository root with local skills.')
  }

  const skills = await getSourceSkills(directory)

  if (skills.length === 0) {
    throw new Error('No eligible skill directories with SKILL.md were found in ./skills.')
  }

  return {
    directory: await realpath(directory),
    skills,
  }
}

async function isDirectory(directory) {
  try {
    return (await stat(directory)).isDirectory()
  } catch {
    return false
  }
}

function entryKind(entryStats) {
  if (entryStats.isDirectory()) {
    return 'directory exists'
  }

  if (entryStats.isFile()) {
    return 'file exists'
  }

  return 'entry exists'
}

async function prepareProvider(provider, results) {
  try {
    const providerStats = await lstat(provider.directory)

    if (providerStats.isSymbolicLink()) {
      results.errors.push({
        provider: provider.name,
        message: `${provider.location} is a symlink`,
      })
      return false
    }

    if (!providerStats.isDirectory()) {
      results.errors.push({
        provider: provider.name,
        message: `${provider.location} is not a directory`,
      })
      return false
    }
  } catch (error) {
    if (!isMissing(error)) {
      results.errors.push({
        provider: provider.name,
        message: `could not inspect ${provider.location}: ${error.message}`,
      })
      return false
    }

    try {
      await mkdir(provider.directory, { recursive: true })
    } catch (mkdirError) {
      results.errors.push({
        provider: provider.name,
        message: `could not create ${provider.location}: ${mkdirError.message}`,
      })
      return false
    }
  }

  return true
}

async function removeBrokenLinks(provider, results) {
  let entries

  try {
    entries = await readdir(provider.directory, { withFileTypes: true })
  } catch (error) {
    results.errors.push({
      provider: provider.name,
      message: `could not read ${provider.location}: ${error.message}`,
    })
    return
  }

  for (const entry of entries) {
    if (!entry.isSymbolicLink()) {
      continue
    }

    const linkPath = join(provider.directory, entry.name)

    try {
      await stat(linkPath)
    } catch (error) {
      if (!isMissing(error)) {
        results.errors.push({
          provider: provider.name,
          message: `could not inspect ${entry.name}: ${error.message}`,
        })
        continue
      }

      try {
        await unlink(linkPath)
        results.removed.push({ provider: provider.name, skill: entry.name })
      } catch (unlinkError) {
        results.errors.push({
          provider: provider.name,
          message: `could not remove ${entry.name}: ${unlinkError.message}`,
        })
      }
    }
  }
}

async function linkSkill(provider, skill, results) {
  const destination = join(provider.directory, skill.name)

  try {
    const destinationStats = await lstat(destination)

    if (destinationStats.isSymbolicLink()) {
      try {
        if ((await realpath(destination)) === skill.directory) {
          return
        }
      } catch (error) {
        results.errors.push({
          provider: provider.name,
          message: `could not resolve ${skill.name}: ${error.message}`,
        })
        return
      }

      results.conflicts.push({
        provider: provider.name,
        skill: skill.name,
        message: 'points somewhere else',
      })
      return
    }

    results.conflicts.push({
      provider: provider.name,
      skill: skill.name,
      message: entryKind(destinationStats),
    })
    return
  } catch (error) {
    if (!isMissing(error)) {
      results.errors.push({
        provider: provider.name,
        message: `could not inspect ${skill.name}: ${error.message}`,
      })
      return
    }
  }

  try {
    await symlink(skill.directory, destination, 'dir')
    results.linked.push({ provider: provider.name, skill: skill.name })
  } catch (error) {
    results.errors.push({
      provider: provider.name,
      message: `could not link ${skill.name}: ${error.message}`,
    })
  }
}

function groupByProvider(entries) {
  const entriesByProvider = new Map()

  for (const entry of entries) {
    const providerEntries = entriesByProvider.get(entry.provider) ?? []
    providerEntries.push(entry)
    entriesByProvider.set(entry.provider, providerEntries)
  }

  return entriesByProvider
}

function printGroups(title, entries) {
  if (entries.length === 0) {
    return
  }

  console.log(`\n${title}:`)

  const entriesByProvider = groupByProvider(entries)

  for (const provider of providers) {
    const providerEntries = entriesByProvider.get(provider.name)

    if (providerEntries?.length) {
      console.log(`- ${provider.name}: ${providerEntries.map((entry) => entry.skill).join(', ')}`)
    }
  }
}

function printSummary(results) {
  printGroups('Removed broken links', results.removed)
  printGroups('Linked skills', results.linked)

  if (results.conflicts.length > 0) {
    console.log('\nLeft unchanged:')

    for (const conflict of results.conflicts) {
      console.log(`- ${conflict.provider}: ${conflict.skill} (${conflict.message})`)
    }
  }

  if (results.errors.length > 0) {
    console.log('\nCould not update:')

    for (const error of results.errors) {
      console.log(`- ${error.provider}: ${error.message}`)
    }
  }

  if (
    results.removed.length === 0 &&
    results.linked.length === 0 &&
    results.conflicts.length === 0 &&
    results.errors.length === 0
  ) {
    console.log('\nNo changes. All local skills are already linked.')
  }
}

async function main() {
  const arguments_ = parseArguments(process.argv.slice(2))

  if (arguments_.help) {
    printUsage()
    return
  }

  const source = await resolveSourceSkillsDirectory()
  const results = {
    removed: [],
    linked: [],
    conflicts: [],
    errors: [],
  }

  const availableProviders = []

  for (const provider of providers) {
    if (await prepareProvider(provider, results)) {
      availableProviders.push(provider)
    }
  }

  for (const provider of availableProviders) {
    await removeBrokenLinks(provider, results)
  }

  for (const provider of availableProviders) {
    for (const skill of source.skills) {
      await linkSkill(provider, skill, results)
    }
  }

  printSummary(results)

  if (results.errors.length > 0) {
    process.exitCode = 1
  }
}

try {
  await main()
} catch (error) {
  console.error(error.message)
  process.exitCode = 2
}
