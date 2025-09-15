# @yulolimum/toolkit

Personal development toolkit and reusable code registry organized by domain with interactive CLI interfaces and preference caching.

## Scripts

### Development (`dev-*`)

- **[`dev:check-code-quality`](scripts/dev-check-code-quality.mjs)** - Interactive TypeScript, ESLint, and Prettier runner
- **[`dev:clean`](scripts/dev-clean.sh)** - Clean project artifacts and build outputs
- **[`dev:verify-software`](scripts/dev-verify-software.sh)** - Verify development environment and tool versions

### EAS Deployment (`eas-*`)

- **[`eas:build`](scripts/eas-build.mjs)** - Interactive EAS build automation with platform/profile selection
- **[`eas:submit`](scripts/eas-submit.mjs)** - App store submission with local/remote build support
- **[`eas:update`](scripts/eas-update.mjs)** - Over-the-air updates with channel and messaging options

### Linear Integration (`linear-*`)

- **[`linear:start-clockify-timer`](scripts/linear-start-clockify-timer.ts)** - Start Clockify timer for Linear issues with workspace/project selection and smart caching

### Media Management (`media-*`)

- **[`media:accelerate-video`](scripts/media-accelerate-video.mjs)** - Interactive video acceleration with FFmpeg, supports audio inclusion choice and speed multiplier with preference caching
- **[`media:normalize-episode-names`](scripts/media-normalize-episode-names.mjs)** - Normalize TV episode filenames using OpenRouter LLM with Russian translation support
- **[`media:recursively-hardlink`](scripts/media-recursively-hardlink.sh)** - Create hardlinks for media files to save disk space

## Configs

### Shareable (`configs/`)

- **[`eas.json`](configs/eas.json)** - EAS deployment configuration
- **[`eslint.config.mjs`](configs/eslint.config.mjs)** - ESLint rules with React and import sorting
- **[`prettier.config.mjs`](configs/prettier.config.mjs)** - Code formatting configuration with shell script and Tailwind CSS support

## Utils

### Reusable Code (`utils/`)

Utility functions and modules for common development tasks. Copy and paste into your projects as needed.

_Coming soon - this section will be populated with reusable utility functions._

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

- **[`TSQueryOutput.tsx`](components/TSQueryOutput.tsx)** - React component that handles different states of Tanstack Query results with customizable UI for loading, error, empty, and success states

## Hooks

### React Hooks (`hooks/`)

Reusable React hooks for common patterns and functionality. Copy and paste into your React/React Native projects as needed.

- **[`useMultiCountPress.ts`](hooks/useMultiCountPress.ts)** - React hook for detecting multiple consecutive presses within a time threshold (useful for debug modes, secret features, etc.)
- **[`useQueryRefreshControlProps.ts`](hooks/useQueryRefreshControlProps.ts)** - React hook that provides RefreshControl props for automatically refetching React Query queries on pull-to-refresh
- **[`useScreenPreventRemove.ts`](hooks/useScreenPreventRemove.ts)** - React Navigation hook to prevent screen unmounting based on conditions (unsaved changes, loading states, etc.)

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
