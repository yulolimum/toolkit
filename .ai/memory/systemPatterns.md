# System Patterns: @yulolimum/scripts

## Architecture Overview

The project follows a **prefix-based utility architecture** with independent scripts organized by domain category. Each script addresses specific automation needs while maintaining consistency in user experience and error handling across all domains (development, media, deployment, system administration, personal productivity).

## Key Technical Decisions

### Script Organization

#### Directory Structure Architecture

```
scripts/                           # Dynamic automation scripts
├── dev-check-code-quality.mjs     # Development: Interactive code quality runner
├── dev-clean.sh                   # Development: Project cleanup utility
├── dev-verify-software.sh         # Development: Environment verification
├── eas-build.mjs                  # EAS: Build automation
├── media-organize-library.py      # Media: Library organization (planned)
├── deploy-to-server.sh           # Deployment: Server deployment (planned)
├── system-cleanup-logs.sh        # System: Log cleanup (planned)
└── personal-backup-configs.sh    # Personal: Configuration backup (planned)

configs/                           # Static, shareable configuration files
├── eas.json                       # EAS deployment configuration
├── eslint.config.mjs             # ESLint configuration
└── prettier.config.mjs           # Prettier configuration
```

#### Directory Purpose and Patterns

- **scripts/**: Dynamic automation scripts that perform actions and operations
  - Interactive tools with user prompts and caching
  - Batch processing operations
  - System maintenance and deployment tasks
  - Prefix-based naming for categorization

- **configs/**: Static, shareable configuration files
  - Tool configurations (ESLint, Prettier, TypeScript)
  - Deployment configurations (EAS, Docker, CI/CD)
  - Template configurations for new projects
  - Shareable across teams and projects

#### Package.json Script Mapping

```json
{
  "scripts": {
    "dev:check-code-quality": "npx zx --install ./scripts/dev-check-code-quality.mjs",
    "dev:clean": "./scripts/dev-clean.sh",
    "dev:verify-software": "./scripts/dev-verify-software.sh",
    "eas:build": "npx zx --install ./scripts/eas-build.mjs",
    "media:organize-library": "python ./scripts/media-organize-library.py",
    "deploy:to-server": "./scripts/deploy-to-server.sh",
    "system:cleanup-logs": "./scripts/system-cleanup-logs.sh",
    "personal:backup-configs": "./scripts/personal-backup-configs.sh"
  }
}
```

#### Language Choices by Domain

- **JavaScript (ESM)**: Interactive tools, development automation, complex user interfaces
- **Python**: Data processing, media management, analysis, machine learning tasks
- **Bash**: System operations, deployment, maintenance, file operations
- **Mixed Approach**: Choose optimal language for each specific automation need

### Design Patterns

#### Cross-Domain Consistency Patterns

**Unified User Experience**

- Consistent visual feedback (✅/❌) across all script categories
- Standardized parameter passing and configuration approaches
- Common error handling and reporting patterns regardless of implementation language
- Shared preference caching strategies where applicable

**Prefix-Based Organization**

```
Category Prefixes:
- dev-*     : Development workflow automation
- eas-*     : EAS (Expo Application Services) deployment automation
- media-*   : Media library and content management
- deploy-*  : General deployment and infrastructure automation
- system-*  : System administration and maintenance
- personal-*: Personal productivity and workflow optimization
```

#### Interactive CLI Pattern (JavaScript/Node.js)

**User Preference Caching**

```javascript
// Cache user selections to reduce decision fatigue across all interactive scripts
const cacheFile = path.join(__dirname, ".cache")
let cache = { [scriptCategory]: {} }

// Restore previous selections as defaults
checked: cache[scriptCategory].tools?.includes("tool") ?? true

// EAS-specific caching example
cache.easBuild = cache.easBuild ?? {}
default: cache.easBuild.platform ?? "all"
```

**Spinner-Based Feedback**

```javascript
// Provide visual feedback during long-running operations
const output = await spinner(`Running ${operation}...`, async function () {
  return await $({ nothrow: true })`command`
})
```

**Graceful Error Handling**

```javascript
// Continue execution even if individual operations fail
if (output.exitCode !== 0) {
  console.error(`❌ Error running ${operation}: ${output.stdout || output.stderr}`)
  process.exit(1)
} else {
  console.log(`✅ ${operation} completed successfully`)
}
```

#### Batch Processing Pattern (Python)

**File Collection and Processing**

```python
# Pattern for media and data processing scripts
def process_files(input_path, output_path, options):
    files = collect_files(input_path, file_patterns)
    for file in files:
        try:
            result = process_file(file, options)
            report_success(file, result)
        except Exception as e:
            report_error(file, e)
            continue  # Graceful degradation
```

**Progress Reporting**

```python
# Consistent progress reporting across batch operations
from tqdm import tqdm
for item in tqdm(items, desc="Processing"):
    process_item(item)
```

#### Safe Execution Pattern (Shell Scripts)

**Error Handling Strategy**

```bash
set -e # Exit on any error

# Safe execution with fallback for system operations
execute_safe_step() {
  echo "Executing: $1"
  eval $1 || true 2> /dev/null # Continue on failure for cleanup operations
}
```

**Resource Validation**

```bash
# Check system resources before operations
check_disk_space() {
  available=$(df -h . | awk 'NR==2 {print $4}')
  echo "Available disk space: $available"
}
```

**Version and Dependency Validation**

```bash
# Semantic version comparison for system tools
semver_lte() {
  printf '%s\n' "$1" "$2" | sort -C -V
}

# Flexible version checking with min/max constraints
validate_tool_version() {
  local tool=$1
  local min_version=$2
  local max_version=$3
  # Implementation for cross-script tool validation
}
```

## Component Relationships

### Multi-Domain Architecture Flow

```
package.json scripts → Category-specific utilities
                    ↓
Domain-specific Logic ← Shared Patterns ← Common Configuration
                    ↓
User Interface ← Tool/Process Execution ← Category Configuration
```

### Integration Points

#### Package.json Integration

- Scripts exposed through npm/pnpm commands with category namespacing
- Consistent naming convention (`category:action`)
- Direct execution paths for flexibility across different runtimes
- Support for both interactive and automated execution modes

#### Cross-Domain Tool Integration

- **Development**: TypeScript, ESLint, Prettier with optimized flags
- **EAS Deployment**: EAS CLI with platform-specific build configurations
- **Media**: FFmpeg, ImageMagick, ExifTool for media processing
- **Deployment**: SSH, rsync, Docker for deployment automation
- **System**: System utilities, cron, backup tools for maintenance
- **Personal**: Custom tools and APIs for productivity automation

#### Multi-Language Coordination

- **JavaScript/Node.js**: zx for cross-platform shell operations, inquirer for user interaction
- **Python**: Standard library + domain-specific packages (Pillow, pandas, etc.)
- **Shell Scripts**: POSIX-compatible commands with macOS-specific optimizations
- **Configuration Sharing**: JSON-based configuration files readable across languages

#### Cross-Platform Considerations

- Primary target: macOS with graceful degradation for other Unix systems
- Language-specific cross-platform libraries (zx for JS, pathlib for Python)
- Consistent error handling and user feedback across different runtimes
- Shared configuration and cache management across script categories

## Critical Implementation Paths

### Interactive Workflow Pattern (Development, EAS Deployment, Personal Productivity)

1. **User Selection**: Interactive interface for tool/option selection
2. **Preference Caching**: Store selections for future runs across categories
3. **Command Construction**: Build complex commands with conditional flags and options
4. **Command Preview**: Show exact command before execution with confirmation
5. **Sequential Execution**: Run operations with real-time feedback
6. **Error Aggregation**: Collect and report all failures with actionable guidance
7. **Success Confirmation**: Clear indication of completion with summary

### EAS Deployment Workflow Pattern (Specialized Interactive)

1. **Platform Selection**: Choose target platforms (iOS, Android, All)
2. **Profile Configuration**: Select build profiles (Preview, Production)
3. **Distribution Strategy**: Choose distribution method (Store, Internal)
4. **Build Location**: Decide between EAS servers vs local builds
5. **Command Construction**: Build EAS CLI command with platform-specific flags
6. **Preview and Confirmation**: Show command and get user confirmation
7. **Execution with Inheritance**: Run with stdio inheritance for real-time EAS output

### Batch Processing Workflow (Media, System Administration)

1. **Resource Validation**: Check available disk space, memory, and dependencies
2. **File/Target Discovery**: Identify items to process with safety checks
3. **Batch Execution**: Process items with progress reporting and error tolerance
4. **Result Aggregation**: Collect success/failure statistics
5. **Cleanup and Reporting**: Clean temporary files and provide detailed summary

### Deployment/Automation Workflow (Deployment, System)

1. **Environment Validation**: Verify target environment and prerequisites
2. **Configuration Loading**: Load environment-specific configurations
3. **Pre-flight Checks**: Validate deployment targets and rollback capabilities
4. **Execution with Monitoring**: Execute with progress tracking and health checks
5. **Post-deployment Validation**: Verify successful completion and functionality

### Data Processing Workflow (Media, Personal)

1. **Input Validation**: Verify file formats, permissions, and integrity
2. **Metadata Extraction**: Gather existing metadata and configuration
3. **Transformation Pipeline**: Apply processing with intermediate validation
4. **Quality Assurance**: Verify output quality and completeness
5. **Organization and Cleanup**: Move files to final locations and clean temporary data

## Configuration Management

### Cross-Domain Configuration Strategy

#### User Preferences

- **Location**: `.cache` file in script directory with category-specific sections
- **Format**: JSON with hierarchical organization by script category
- **Scope**: Per-category configuration with sensible defaults
- **Persistence**: Automatic save/restore across sessions and script categories
- **Sharing**: Common preferences shared across related scripts

#### Category-Specific Configuration

- **Development**: Project-level tool configurations (ESLint, Prettier, TypeScript)
- **EAS Deployment**: Platform preferences, profile selections, distribution choices, build location preferences
- **Media**: Format preferences, quality settings, organization rules
- **Deployment**: Environment configurations, server credentials, deployment targets
- **System**: Maintenance schedules, backup locations, monitoring thresholds
- **Personal**: API keys, personal preferences, workflow customizations

#### Configuration Hierarchy

```
Global Defaults → Category Defaults → Script-Specific → User Overrides
```

#### Multi-Language Configuration Access

- **JavaScript**: JSON parsing with fs module
- **Python**: JSON parsing with standard library
- **Shell**: jq for JSON parsing and manipulation
- **Shared Schema**: Common configuration structure across languages

**EAS Configuration Example**

```javascript
// EAS-specific configuration structure
cache.easBuild = {
  platform: 'all', // "ios", "android", "all"
  profile: 'preview', // "preview", "production"
  distribution: 'internal', // "store", "internal"
  runOnEAS: true, // true for EAS servers, false for local
}
```

## Error Handling Philosophy

### Universal Graceful Degradation

- Individual operation failures don't stop entire workflows across all domains
- Clear error messages with actionable information specific to each domain
- Distinction between warnings and critical failures across different script types
- Consistent error reporting format regardless of implementation language

### Cross-Domain User Feedback

- **Visual Indicators**: ✅ for success, ❌ for errors, ⚠️ for warnings (all domains)
- **Progress Indication**: Appropriate feedback for each domain (spinners, progress bars, status updates)
- **Detailed Output**: Domain-specific output with consistent formatting
- **Summary Reporting**: Aggregate results across batch operations

### Multi-Domain Recovery Strategies

- **Configuration Issues**: Fallback to defaults with clear guidance for customization
- **Missing Dependencies**: Domain-specific installation guidance (dev tools, media codecs, system utilities)
- **Resource Constraints**: Intelligent handling of disk space, memory, and processing limitations
- **Network Issues**: Retry logic and offline fallbacks for deployment and update operations
- **Permission Problems**: Clear guidance for file permissions and system access requirements

### Language-Specific Error Handling

- **JavaScript**: Promise-based error handling with detailed stack traces
- **Python**: Exception handling with context-aware error messages
- **Shell**: Exit code management with descriptive error output
- **Cross-Language**: Consistent error code conventions for script coordination
