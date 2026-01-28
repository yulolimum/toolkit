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
- **[`media:play-twitch-stream`](scripts/media-play-twitch-stream.mjs)** - Interactive Twitch stream launcher with OAuth device flow, fetches followed channels, filters live streams, and launches via streamlink
- **[`media:recursively-hardlink`](scripts/media-recursively-hardlink.sh)** - Create hardlinks for media files to save disk space

## AI

### LLM Rules (`ai/rules/`)

Shareable LLM rules and prompts for development projects. Copy and paste into your AI assistant configurations as needed.

**Priority-Based Loading**: Each rule file contains YAML frontmatter with priority metadata for optimal loading order:

- **[`agent-behavior-rules.md`](ai/rules/agent-behavior-rules.md)** (Priority 1) - AI agent communication guidelines emphasizing direct, efficient communication with veteran developer persona and problem-focused approach
- **[`memory-bank.md`](ai/rules/memory-bank.md)** (Priority 2) - Comprehensive memory bank system for Cline with project registry, core file structure, and documentation workflows
- **[`general-programming-rules.md`](ai/rules/general-programming-rules.md)** (Priority 3) - General programming guidelines covering comments, naming conventions, exports, function definitions, and codebase exploration
- **[`react-rules.md`](ai/rules/react-rules.md)** (Priority 4) - React component best practices covering prop types, function declarations, exports, destructuring, and hook imports
- **[`.memory-registry.example`](ai/rules/.memory-registry.example)** - Example project-to-memory-bank mapping registry for cross-project memory management (copy to `.memory-registry` and customize for your projects)

**Usage**: Load rules in priority order (1-4) for optimal LLM behavior, with higher priority rules taking precedence in case of conflicts.

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

- **[`QueryState.tsx`](components/QueryState.tsx)** - React component that handles different states of single or multiple Tanstack Query results with customizable UI for loading, error, empty, and success states

## Hooks

### React Hooks (`hooks/`)

Reusable React hooks for common patterns and functionality. Copy and paste into your React/React Native projects as needed.

- **[`useAuthorization.tsx`](hooks/useAuthorization.tsx)** - Authorization context system with hook and component for role/permission-based UI rendering with AND/OR logic support
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
