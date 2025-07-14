# @yulolimum/scripts

Personal automation scripts and shareable configs organized by domain with interactive CLI interfaces and preference caching.

## Scripts

### Development (`dev-*`)
- **`dev:check-code-quality`** - Interactive TypeScript, ESLint, and Prettier runner
- **`dev:clean`** - Clean project artifacts and build outputs
- **`dev:verify-software`** - Verify development environment and tool versions

### EAS Deployment (`eas-*`)
- **`eas:build`** - Interactive EAS build automation with platform/profile selection
- **`eas:submit`** - App store submission with local/remote build support
- **`eas:update`** - Over-the-air updates with channel and messaging options

## Configs

### Shareable (`configs/`)
- **`eas.json`** - EAS deployment configuration
- **`eslint.config.mjs`** - ESLint rules with React and import sorting
- **`prettier.config.mjs`** - Code formatting configuration

## Usage

Scripts are standalone and can be run independently. Install dependencies as needed.

```bash
# .mjs scripts can be run without dependencies
npx zx --install ./scripts/script-name.mjs

# Shell scripts can be run directly
./scripts/script-name.sh
