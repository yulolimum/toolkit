# System Patterns: @yulolimum/scripts

## Architecture Overview

The project follows a **utility-first architecture** with three independent scripts that can be used standalone or together. Each script addresses a specific aspect of the development workflow while maintaining consistency in user experience and error handling.

## Key Technical Decisions

### Script Organization

#### File Structure
```
src/
├── dev-check-code-quality.mjs  # Interactive code quality runner
├── dev-clean.sh               # Project cleanup utility
└── dev-verify-software.sh     # Environment verification
```

#### Language Choices
- **JavaScript (ESM)**: For interactive, Node.js-based tooling (`dev-check-code-quality.mjs`)
- **Bash**: For system-level operations and cross-platform compatibility (`dev-clean.sh`, `dev-verify-software.sh`)

### Design Patterns

#### Interactive CLI Pattern (`dev-check-code-quality.mjs`)

**User Preference Caching**
```javascript
// Cache user selections to reduce decision fatigue
const cacheFile = path.join(__dirname, ".cache")
let cache = { checkCodeQuality: {} }

// Restore previous selections as defaults
checked: cache.checkCodeQuality.tools?.includes("tsc") ?? true
```

**Spinner-Based Feedback**
```javascript
// Provide visual feedback during long-running operations
const output = await spinner(`Running ${tool}...`, async function () {
  return await $({ nothrow: true })`tsc --noEmit`
})
```

**Graceful Error Handling**
```javascript
// Continue execution even if individual tools fail
if (output.exitCode !== 0) {
  console.error(`❌ Error running ${tool}: ${output.stdout || output.stderr}`)
  process.exit(1)
} else {
  console.log(`✅ ${tool} completed successfully`)
}
```

#### Safe Execution Pattern (Shell Scripts)

**Error Handling Strategy**
```bash
set -e  # Exit on any error

# Safe execution with fallback
execute_clean_step() {
  echo "Executing: $1"
  eval $1 || true 2> /dev/null  # Continue on failure
}
```

**Version Validation Pattern**
```bash
# Semantic version comparison
semver_lte() {
    printf '%s\n' "$1" "$2" | sort -C -V
}

# Flexible version checking with min/max constraints
if [[ -n "${!min_version}" ]] && ! semver_lte "${!min_version}" "$semver"; then
    ((version_failures += 1))
fi
```

## Component Relationships

### Dependency Flow
```
package.json scripts → Individual utilities
                    ↓
User Interface ← Tool Execution ← Configuration
```

### Integration Points

#### Package.json Integration
- Scripts exposed through npm/pnpm commands
- Consistent naming convention (`dev:*`)
- Direct execution paths for flexibility

#### Tool Chain Integration
- **TypeScript**: `tsc --noEmit` for type checking only
- **ESLint**: `--fix --cache --format=pretty` for optimal UX
- **Prettier**: `--write --cache --log-level=error` for clean output

#### Cross-Platform Considerations
- Use of `zx` for cross-platform shell operations in JavaScript
- Bash scripts with POSIX-compatible commands
- Graceful handling of missing tools/commands

## Critical Implementation Paths

### Code Quality Workflow
1. **User Selection**: Interactive checkbox interface
2. **Preference Caching**: Store selections for future runs
3. **Sequential Execution**: Run tools one at a time with feedback
4. **Error Aggregation**: Collect and report all failures
5. **Success Confirmation**: Clear indication of completion

### Cleanup Workflow
1. **Safe Discovery**: Find artifacts without affecting source code
2. **Batch Removal**: Execute cleanup commands with error tolerance
3. **Progress Reporting**: Show what's being cleaned
4. **Completion Confirmation**: Simple success message

### Verification Workflow
1. **Tool Detection**: Check if required software is installed
2. **Version Extraction**: Parse version information from tool output
3. **Range Validation**: Compare against min/max version constraints
4. **Status Reporting**: Aggregate and display all results
5. **Exit Code Management**: Fail fast if critical tools are missing

## Configuration Management

### User Preferences
- **Location**: `.cache` file in script directory
- **Format**: JSON with tool-specific sections
- **Scope**: Per-script configuration with sensible defaults
- **Persistence**: Automatic save/restore across sessions

### Tool Configuration
- **ESLint**: Relies on project-level configuration files
- **Prettier**: Uses project-level configuration with fallback defaults
- **TypeScript**: Uses project `tsconfig.json`

## Error Handling Philosophy

### Graceful Degradation
- Individual tool failures don't stop the entire process
- Clear error messages with actionable information
- Distinction between warnings and critical failures

### User Feedback
- **Visual Indicators**: ✅ for success, ❌ for errors
- **Progress Indication**: Spinners for long-running operations
- **Detailed Output**: Tool-specific output when relevant

### Recovery Strategies
- Cache corruption handling with fallback to defaults
- Missing tool detection with clear installation guidance
- Version mismatch reporting with specific requirements
