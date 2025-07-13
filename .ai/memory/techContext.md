# Tech Context: @yulolimum/scripts

## Technology Stack

### Core Technologies

#### Runtime Environment
- **Node.js**: Version 22.x (specified in verification script)
- **Package Manager**: pnpm 10.13.1
- **Module System**: ES Modules (ESM) for JavaScript files

#### Programming Languages
- **JavaScript (ES2022+)**: Primary language for interactive scripts
- **TypeScript**: Type checking and development tooling
- **Bash**: System-level operations and cross-platform utilities

#### Key Dependencies

**Production Dependencies**
```json
{
  "zx": "^8.7.0",                    // Shell scripting in JavaScript
  "@inquirer/checkbox": "^4",        // Interactive CLI prompts
  "typescript": "5.8.3",             // TypeScript compiler
  "eslint": "^9.29.0",              // JavaScript/TypeScript linting
  "prettier": "^3.6.2"              // Code formatting
}
```

**Development Tooling**
- **ESLint Plugins**: React, React Hooks, Import sorting, Prettier integration
- **TypeScript Config**: Strictest configuration (@tsconfig/strictest)
- **Build Tools**: tsup for TypeScript compilation, tsx for execution

## Development Setup

### Project Structure
```
@yulolimum/scripts/
├── package.json              # Project configuration and scripts
├── tsconfig.json            # TypeScript configuration
├── eslint.config.mjs        # ESLint configuration
├── prettier.config.mjs      # Prettier configuration
├── .tool-versions          # Development tool versions (asdf)
├── .gitignore              # Git ignore patterns
├── .prettierignore         # Prettier ignore patterns
└── src/                    # Source code directory
    ├── dev-check-code-quality.mjs
    ├── dev-clean.sh
    └── dev-verify-software.sh
```

### Configuration Files

#### TypeScript Configuration
- Uses `@tsconfig/strictest` for maximum type safety
- Configured for Node.js environment
- ES2022 target for modern JavaScript features

#### ESLint Configuration
- Modern flat config format (`eslint.config.mjs`)
- React and React Hooks support
- Import sorting and organization
- Prettier integration for consistent formatting
- Pretty formatter for enhanced output

#### Prettier Configuration
- Package.json plugin for consistent formatting
- Integrated with ESLint for conflict resolution
- Configured for multiple file types (JSON, MD, YAML, HTML, CSS)

### Tool Integration

#### ZX Framework
```javascript
import { $, fs, minimist, spinner } from "zx"

// Shell command execution with error handling
const output = await $({ nothrow: true })`tsc --noEmit`

// File system operations
await fs.readJson(cacheFile)
await fs.writeJson(cacheFile, data)

// CLI argument parsing
const { _: paths, all } = minimist(process.argv.slice(2))
```

#### Inquirer Integration
```javascript
import checkbox from "@inquirer/checkbox"

// Interactive user prompts with caching
const tools = await checkbox({
  message: "Which formatting/linting options do you want to run?",
  choices: [/* ... */],
})
```

## Technical Constraints

### Environment Requirements

#### Operating System
- **Primary Target**: macOS (development environment)
- **Secondary**: Linux/Unix systems
- **Compatibility**: POSIX-compliant shell commands

#### Software Dependencies
- **Node.js**: 22.0.0 - 22.999.0 (enforced by verification script)
- **Java**: 17.0.0 - 17.999.0 (for mobile development)
- **Xcode**: 16.2+ (iOS development)
- **Android Tools**: adb, CocoaPods 1.16.0+

#### Package Manager
- **pnpm**: Preferred for performance and disk efficiency
- **npm**: Fallback compatibility maintained
- **Workspace Support**: Ready for monorepo expansion

### Performance Considerations

#### Execution Speed
- **Caching**: ESLint and Prettier use built-in caching
- **Parallel Execution**: Tools run sequentially for clear feedback
- **Minimal Dependencies**: Focused dependency tree for fast installs

#### Resource Usage
- **Memory**: Efficient through streaming operations
- **Disk**: Cache files stored locally, cleaned by cleanup script
- **Network**: Minimal external dependencies

## Development Patterns

### Error Handling Strategy

#### JavaScript/Node.js
```javascript
// Graceful error handling with detailed feedback
try {
  cache = await fs.readJson(cacheFile)
} catch (_error) {
  cache = { checkCodeQuality: {} }  // Fallback to defaults
}

// Process continuation with error reporting
if (output.exitCode !== 0) {
  console.error(`❌ Error running ${tool}: ${output.stdout || output.stderr}`)
  process.exit(1)
}
```

#### Shell Scripts
```bash
set -e  # Fail fast on errors

# Safe execution with error tolerance
execute_clean_step() {
  echo "Executing: $1"
  eval $1 || true 2> /dev/null
}
```

### Configuration Management

#### User Preferences
- **Storage**: JSON files in script directory
- **Scope**: Tool-specific configuration sections
- **Defaults**: Sensible defaults with user override capability

#### Tool Configuration
- **ESLint**: Project-level `.eslintrc` or `eslint.config.js`
- **Prettier**: Project-level `.prettierrc` or `prettier.config.js`
- **TypeScript**: Project-level `tsconfig.json`

### Cross-Platform Compatibility

#### File Path Handling
```javascript
import path, { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const cacheFile = path.join(__dirname, ".cache")
```

#### Command Execution
- **ZX**: Cross-platform shell command execution
- **Process Environment**: `FORCE_COLOR=1` for consistent output
- **Error Handling**: Platform-agnostic error detection

## Future Technical Considerations

### Scalability
- **Monorepo Support**: Ready for workspace-based projects
- **Plugin Architecture**: Extensible tool integration
- **Configuration Inheritance**: Shared configuration across projects

### Maintenance
- **Dependency Updates**: Regular updates for security and features
- **Tool Evolution**: Adaptation to new development tools
- **Performance Optimization**: Continuous improvement of execution speed
