# @yulolimum/scripts

Personal automation scripts and shareable configs organized by domain with interactive CLI interfaces and preference caching.

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
- **[`media:recursively-hardlink`](scripts/media-recursively-hardlink.sh)** - Create hardlinks for media files to save disk space

## Configs

### Shareable (`configs/`)
- **[`eas.json`](configs/eas.json)** - EAS deployment configuration
- **[`eslint.config.mjs`](configs/eslint.config.mjs)** - ESLint rules with React and import sorting
- **[`prettier.config.mjs`](configs/prettier.config.mjs)** - Code formatting configuration

## Usage

Scripts are standalone and can be run independently. Install dependencies as needed.

```bash
# .mjs scripts can be run without dependencies
npx zx --install ./scripts/script-name.mjs

# .ts scripts can be run via tsx
npx tsx ./scripts/script-name.ts

# Shell scripts can be run directly
./scripts/script-name.sh
