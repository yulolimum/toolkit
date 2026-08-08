import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $ } from 'zx'

import { copyLocalFilesFromPrimaryWorktree, createLogger, findRepoRoot } from './worktree-utils'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = await findRepoRoot(scriptDirectory)

process.env.LANG = 'en_US.UTF-8'
process.env.LC_ALL = 'en_US.UTF-8'

const shell = $({ cwd: repoRoot, stdio: 'inherit' })
const log = createLogger('mobile setup')

const mobilePackageName = '@placeholder/mobile'
const filesToCopyFromPrimaryWorktree = ['.env', '.env.local', 'apps/mobile/.env', 'apps/mobile/.env.local'] as const

log.info('Copying local files from primary worktree')
await copyLocalFilesFromPrimaryWorktree(repoRoot, filesToCopyFromPrimaryWorktree, log)

log.info('Installing dependencies')
await shell`pnpm install`

log.info('Building mobile dependencies')
await shell`pnpm --filter ${mobilePackageName}^... build`

log.info('Preparing mobile simulators and emulators')
await shell`pnpm exec tsx ${join(scriptDirectory, 'worktree-setup-ios.ts')}`
await shell`pnpm exec tsx ${join(scriptDirectory, 'worktree-setup-android.ts')}`

log.info('Prebuilding native mobile project')
await shell`pnpm --filter ${mobilePackageName} prebuild`
