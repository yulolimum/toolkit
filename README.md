# @yulolimum/toolkit

Personal development toolkit and reusable code registry organized by domain with interactive CLI interfaces and preference caching.

## Scripts

### Development (`dev-*`)

- **[`dev:check-code-quality`](scripts/dev-check-code-quality.mjs)** - Interactive TypeScript, ESLint, and Prettier runner
- **[`dev:clean`](scripts/dev-clean.sh)** - Clean project artifacts and build outputs
- **[`dev:verify-software`](scripts/dev-verify-software.sh)** - Verify development environment and tool versions

### EAS Deployment (`eas-*`)

- **[`eas:build`](scripts/eas-build.mts)** - Interactive EAS build automation with platform/profile selection
- **[`eas:submit`](scripts/eas-submit.mts)** - App store submission with platform/profile selection
- **[`eas:update`](scripts/eas-update.mts)** - Over-the-air updates with channel and messaging options

### Linear Integration (`linear-*`)

- **[`linear:start-clockify-timer`](scripts/linear-start-clockify-timer.ts)** - Start Clockify timer for Linear issues with workspace/project selection and smart caching

### Media Management (`media-*`)

- **[`media:accelerate-video`](scripts/media-accelerate-video.mjs)** - Interactive video acceleration with FFmpeg, supports audio inclusion choice and speed multiplier with preference caching
- **[`media:normalize-episode-names`](scripts/media-normalize-episode-names.mjs)** - Normalize TV episode filenames using OpenRouter LLM with Russian translation support
- **[`media:play-twitch-stream`](scripts/media-play-twitch-stream.mjs)** - Interactive Twitch stream launcher with OAuth device flow, fetches followed channels, filters live streams, and launches via streamlink
- **[`media:recursively-hardlink`](scripts/media-recursively-hardlink.sh)** - Create hardlinks for media files to save disk space

## Workflows

### GitHub Actions (`workflows/`)

Reusable GitHub Actions workflows for CI/CD automation. Copy into your `.github/workflows/` directory.

- **[`eas-preview-deploy.yml`](workflows/eas-preview-deploy.yml)** - Automatic EAS preview builds for PRs with fingerprint-based caching, OTA updates, and PR comments with QR codes

## Configs

### Shareable (`configs/`)

- **[`eas.json`](configs/eas.json)** - EAS deployment configuration
- **[`eslint.config.mjs`](configs/eslint.config.mjs)** - ESLint rules with React and import sorting
- **[`prettier.config.mjs`](configs/prettier.config.mjs)** - Code formatting configuration with shell script and Tailwind CSS support

## Utils

### Reusable Code (`utils/`)

Utility functions and modules for common development tasks. Copy and paste into your projects as needed.

- **[`arrays.ts`](utils/arrays.ts)** - Array helpers for normalization, toggling, shuffling, selection, deduplication, and sorting
- **[`colors.ts`](utils/colors.ts)** - Parse color strings, calculate WCAG contrast, and choose readable black or white text
- **[`dates.ts`](utils/dates.ts)** - Date helpers for compact elapsed-time labels and inclusive range containment
- **[`geo.ts`](utils/geo.ts)** - React Native Maps region calculation for a set of coordinates
- **[`objects.ts`](utils/objects.ts)** - Object utilities: `getObjPath`, `isObjEmpty`, type-safe `getObjectKeys`/`Values`/`Entries`, `pick`, `pickBy`, `removeNullishValues`, `omit`, `getRootLevelObject`
- **[`provider-registry.tsx`](utils/provider-registry.tsx)** - Compose multiple React providers without deep nesting, with conditional inclusion and typed props
- **[`safe-try-catch.ts`](utils/safe-try-catch.ts)** - `safeResolve` and `safeExec` functions for error handling without try/catch blocks, returning `{ ok, value }` result objects
- **[`strings.ts`](utils/strings.ts)** - String helpers for pluralization, regex escaping, truncation, list summaries, SemVer-core comparison, and character filtering

## Lib

### Library Configuration (`lib/`)

Pre-configured library instances and setup patterns. Ready-to-use configurations for common libraries and frameworks.

- **[`mmkv.ts`](lib/mmkv.ts)** - Pre-configured MMKV instance for React Native persistent storage

## Services

### Service Extensions (`services/`)

Custom service implementations and extensions. Reusable service patterns for common application needs.

- **[`storage.ts`](services/storage.ts)** - Type-safe persistent storage service with imperative and reactive APIs built on MMKV

## Components

### React Components (`components/`)

Reusable React components for common UI patterns and functionality. Copy and paste into your React/React Native projects as needed.

- **[`AspectImage.tsx`](components/AspectImage.tsx)** - Expo Image wrapper that displays images at natural aspect ratio with optional max width/height constraints
- **[`MeasuringView.tsx`](components/MeasuringView.tsx)** - React Native View wrapper that measures its layout and passes dimensions to a render function child
- **[`QueryState.tsx`](components/QueryState.tsx)** - React component that handles different states of single or multiple Tanstack Query results with customizable UI for loading, error, empty, and success states

## Hooks

### React Hooks (`hooks/`)

Reusable React hooks for common patterns and functionality. Copy and paste into your React/React Native projects as needed.

- **[`useAppState.ts`](hooks/useAppState.ts)** - React Native hook for tracking app state (active/background/inactive) with transition callbacks
- **[`useAuthorization.tsx`](hooks/useAuthorization.tsx)** - Authorization context system with hook and component for role/permission-based UI rendering with AND/OR logic support
- **[`useDebouncedValue.ts`](hooks/useDebouncedValue.ts)** - Debounce a value with configurable delay, leading mode, force update, and cancel (adapted from Mantine)
- **[`useMultiCountPress.ts`](hooks/useMultiCountPress.ts)** - React hook for detecting multiple consecutive presses within a time threshold (useful for debug modes, secret features, etc.)
- **[`useQueryRefreshControlProps.ts`](hooks/useQueryRefreshControlProps.ts)** - React hook that provides RefreshControl props for automatically refetching React Query queries on pull-to-refresh
- **[`useScreenPreventRemove.ts`](hooks/useScreenPreventRemove.ts)** - React Navigation hook to prevent screen unmounting based on conditions (unsaved changes, loading states, etc.)

## Docs

### Development (`dev-*`)

- **[`dev-eas.md`](docs/dev-eas.md)** - Complete guide to Expo Application Services (EAS) including builds, submissions, OTA updates, and deployment workflows
- **[`dev-environment-setup.md`](docs/dev-environment-setup.md)** - Step-by-step environment setup guide for React Native development including tools, languages, and IDEs
- **[`dev-push-notifications.md`](docs/dev-push-notifications.md)** - Comprehensive guide to push notification concepts and implementation approaches for React Native apps

## Usage

Scripts are standalone and can be run independently. Install dependencies as needed.

```bash
# .mjs scripts can be run without dependencies
npx zx --install ./scripts/script-name.mjs

# .ts scripts can be run via tsx
npx tsx ./scripts/script-name.ts

# Shell scripts can be run directly
./scripts/script-name.sh
```
