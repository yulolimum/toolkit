# Tech Context: @yulolimum/scripts

## Technology Stack

### Multi-Domain Runtime Environments

#### Primary Runtimes
- **Node.js**: Version 22.x (for JavaScript-based automation and interactive tools)
- **Python**: Version 3.9+ (for data processing, media management, and analysis)
- **Bash**: POSIX-compatible shell (for system operations and deployment)
- **Package Manager**: pnpm 10.13.1 (for Node.js dependencies)

#### Programming Languages by Domain

**JavaScript (ES2022+)**
- **Use Cases**: Interactive tools, development automation, complex user interfaces
- **Domains**: Development workflows, personal productivity tools
- **Key Features**: ES Modules, async/await, modern syntax

**Python**
- **Use Cases**: Data processing, media management, analysis, machine learning
- **Domains**: Media library management, data analysis, content processing
- **Key Features**: Rich ecosystem, excellent file handling, data processing libraries

**TypeScript**
- **Use Cases**: Type checking and development tooling
- **Domains**: Development workflow enhancement
- **Key Features**: Static typing, modern JavaScript features

**Bash/Shell**
- **Use Cases**: System operations, deployment, maintenance, file operations
- **Domains**: System administration, deployment automation
- **Key Features**: System integration, process management, file operations

### Domain-Specific Dependencies

#### Development Category Dependencies
```json
{
  "zx": "^8.7.0",                    // Shell scripting in JavaScript
  "@inquirer/checkbox": "^4",        // Interactive CLI prompts
  "typescript": "5.8.3",             // TypeScript compiler
  "eslint": "^9.29.0",              // JavaScript/TypeScript linting
  "prettier": "^3.6.2"              // Code formatting
}
```

#### Media Management Dependencies (Python)
```python
# Planned dependencies for media scripts
pillow>=10.0.0          # Image processing
ffmpeg-python>=0.2.0    # Video processing
mutagen>=1.47.0         # Audio metadata
exifread>=3.0.0         # EXIF data extraction
tqdm>=4.65.0            # Progress bars
```

#### System Administration Dependencies (Shell + System Tools)
```bash
# System tools and utilities
jq                      # JSON processing in shell scripts
rsync                   # File synchronization
cron                    # Task scheduling
find/grep/awk/sed      # Text processing and file operations
```

#### Deployment Dependencies (Mixed)
```bash
# Deployment and infrastructure tools
ssh/scp                 # Remote access and file transfer
docker                  # Containerization
git                     # Version control integration
curl/wget              # HTTP operations
```

**Development Tooling**
- **ESLint Plugins**: React, React Hooks, Import sorting, Prettier integration
- **TypeScript Config**: Strictest configuration (@tsconfig/strictest)
- **Build Tools**: tsup for TypeScript compilation, tsx for execution
- **Python Tools**: pip for package management, virtual environments for isolation
- **Shell Tools**: shellcheck for script validation, bash completion support

## Development Setup

### Multi-Domain Project Structure
```
@yulolimum/scripts/
├── package.json              # Node.js dependencies and npm scripts
├── requirements.txt          # Python dependencies (planned)
├── tsconfig.json            # TypeScript configuration
├── eslint.config.mjs        # ESLint configuration
├── prettier.config.mjs      # Prettier configuration
├── .tool-versions          # Development tool versions (asdf)
├── .gitignore              # Git ignore patterns
├── .prettierignore         # Prettier ignore patterns
├── .python-version         # Python version specification (planned)
└── src/                    # Source code directory (flat structure)
    ├── dev-check-code-quality.mjs    # Development automation
    ├── dev-clean.sh                  # Development cleanup
    ├── dev-verify-software.sh        # Development environment
    ├── media-organize-library.py     # Media management (planned)
    ├── deploy-to-server.sh          # Deployment automation (planned)
    ├── system-cleanup-logs.sh       # System maintenance (planned)
    └── personal-backup-configs.sh   # Personal productivity (planned)
```

### Configuration Files by Domain

#### JavaScript/TypeScript Configuration
- **TypeScript**: Uses `@tsconfig/strictest` for maximum type safety
- **ESLint**: Modern flat config format with React and import sorting support
- **Prettier**: Multi-file type support with ESLint integration
- **Target**: Node.js environment with ES2022 features

#### Python Configuration (Planned)
- **Requirements**: Domain-specific dependencies for media and data processing
- **Virtual Environment**: Isolated Python environment for script dependencies
- **Code Quality**: Black for formatting, flake8 for linting, mypy for type checking
- **Target**: Python 3.9+ with modern features

#### Shell Script Configuration
- **Linting**: shellcheck for script validation and best practices
- **Compatibility**: POSIX-compliant with macOS-specific optimizations
- **Error Handling**: Consistent exit codes and error reporting
- **Documentation**: Inline documentation and usage examples

#### Cross-Language Configuration
- **JSON Schema**: Shared configuration structure for cross-language access
- **Environment Variables**: Consistent environment variable usage
- **Logging**: Unified logging format across different runtimes
- **Cache Management**: Shared cache directory structure

### Tool Integration by Domain

#### JavaScript/Node.js Integration
```javascript
import { $, fs, minimist, spinner } from "zx"
import checkbox from "@inquirer/checkbox"

// Cross-platform shell command execution
const output = await $({ nothrow: true })`command`

// File system operations with error handling
await fs.readJson(cacheFile)
await fs.writeJson(cacheFile, data)

// Interactive user prompts with caching
const tools = await checkbox({
  message: "Select options:",
  choices: [/* ... */],
})

// CLI argument parsing
const { _: paths, all } = minimist(process.argv.slice(2))
```

#### Python Integration (Planned)
```python
import json
import argparse
from pathlib import Path
from tqdm import tqdm

# Configuration management
def load_config(config_path):
    with open(config_path) as f:
        return json.load(f)

# Progress reporting for batch operations
for item in tqdm(items, desc="Processing"):
    process_item(item)

# Command line argument parsing
parser = argparse.ArgumentParser(description='Media processing script')
parser.add_argument('--input', required=True, help='Input directory')
args = parser.parse_args()
```

#### Shell Script Integration
```bash
# JSON configuration parsing
parse_config() {
    local config_file="$1"
    jq -r '.key' "$config_file"
}

# Cross-script communication
source_common_functions() {
    # Load shared functions and variables
    source "$(dirname "$0")/common.sh"
}

# Error handling and logging
log_error() {
    echo "❌ Error: $1" >&2
    exit 1
}

log_success() {
    echo "✅ Success: $1"
}
```

#### Cross-Language Configuration Access
```javascript
// JavaScript
const config = await fs.readJson('.cache')

// Python
import json
with open('.cache') as f:
    config = json.load(f)

// Shell
config_value=$(jq -r '.key' .cache)
```

## Technical Constraints

### Environment Requirements

#### Operating System
- **Primary Target**: macOS (personal development environment)
- **Secondary**: Linux/Unix systems with graceful degradation
- **Compatibility**: POSIX-compliant commands with macOS-specific optimizations

#### Multi-Runtime Dependencies
- **Node.js**: 22.0.0 - 22.999.0 (enforced by verification script)
- **Python**: 3.9+ (for data processing and media management)
- **Java**: 17.0.0 - 17.999.0 (for mobile development tools)
- **System Tools**: Standard Unix utilities (find, grep, awk, sed, jq)

#### Domain-Specific Tools
- **Development**: TypeScript, ESLint, Prettier, Git
- **Media**: FFmpeg, ImageMagick, ExifTool (planned)
- **Deployment**: SSH, rsync, Docker (planned)
- **System**: cron, backup utilities, monitoring tools (planned)

#### Package Management Strategy
- **Node.js**: pnpm preferred for performance, npm fallback
- **Python**: pip with virtual environments for isolation
- **System**: Homebrew for macOS tool installation
- **Cross-Platform**: Graceful handling of missing optional dependencies

### Performance Considerations

#### Domain-Specific Performance
- **Development**: ESLint and Prettier caching, incremental type checking
- **Media**: Streaming processing for large files, parallel batch operations
- **Deployment**: Connection pooling, incremental transfers
- **System**: Resource monitoring, scheduled operations during low usage

#### Resource Management
- **Memory**: Streaming operations for large datasets, garbage collection optimization
- **Disk**: Intelligent caching strategies, automatic cleanup of temporary files
- **Network**: Retry logic, bandwidth throttling, offline operation support
- **CPU**: Parallel processing where safe, priority-based task scheduling

#### Scalability Patterns
- **Batch Processing**: Configurable batch sizes for memory management
- **Progress Tracking**: Non-blocking progress reporting across all domains
- **Error Recovery**: Checkpoint-based recovery for long-running operations
- **Resource Limits**: Configurable limits for disk usage, memory consumption

## Development Patterns

### Cross-Domain Error Handling Strategy

#### JavaScript/Node.js
```javascript
// Graceful error handling with detailed feedback
try {
  cache = await fs.readJson(cacheFile)
} catch (_error) {
  cache = { [scriptCategory]: {} }  // Fallback to defaults
}

// Process continuation with error reporting
if (output.exitCode !== 0) {
  console.error(`❌ Error running ${operation}: ${output.stdout || output.stderr}`)
  process.exit(1)
} else {
  console.log(`✅ ${operation} completed successfully`)
}
```

#### Python
```python
import logging
from pathlib import Path

# Structured error handling for batch operations
def process_files(files):
    results = {'success': [], 'errors': []}
    for file_path in files:
        try:
            result = process_file(file_path)
            results['success'].append((file_path, result))
            print(f"✅ Processed: {file_path}")
        except Exception as e:
            results['errors'].append((file_path, str(e)))
            print(f"❌ Error processing {file_path}: {e}")
            continue  # Graceful degradation
    return results
```

#### Shell Scripts
```bash
set -e  # Fail fast on critical errors

# Safe execution with error tolerance for cleanup operations
execute_safe_step() {
  echo "Executing: $1"
  eval $1 || {
    echo "⚠️ Warning: $1 failed, continuing..."
    return 0
  }
}

# Critical operations that must succeed
execute_critical_step() {
  echo "Executing critical step: $1"
  eval $1 || {
    echo "❌ Critical error: $1 failed"
    exit 1
  }
}
```

### Multi-Domain Configuration Management

#### Cross-Language Configuration Strategy
```json
{
  "dev": {
    "tools": ["tsc", "eslint", "prettier"],
    "preferences": { "autoFix": true, "verbose": false }
  },
  "media": {
    "formats": ["jpg", "png", "mp4"],
    "quality": "high",
    "organization": { "byDate": true, "byType": true }
  },
  "deploy": {
    "environments": ["staging", "production"],
    "rollback": { "enabled": true, "keepVersions": 3 }
  },
  "system": {
    "schedule": "daily",
    "cleanup": { "logs": true, "temp": true, "cache": true }
  }
}
```

#### Language-Specific Configuration Access
- **JavaScript**: `await fs.readJson('.cache')` with category-specific sections
- **Python**: `json.load()` with validation and type hints
- **Shell**: `jq` for JSON parsing and manipulation
- **Validation**: JSON schema validation across all languages

#### Configuration Hierarchy
- **Global Defaults**: Shipped with scripts
- **User Preferences**: Stored in `.cache` file
- **Environment Overrides**: Environment variables for CI/CD
- **Runtime Parameters**: Command-line arguments and flags

### Cross-Platform Compatibility

#### Multi-Language Path Handling
```javascript
// JavaScript
import path, { dirname } from "path"
import { fileURLToPath } from "url"
const __dirname = dirname(fileURLToPath(import.meta.url))
const cacheFile = path.join(__dirname, ".cache")
```

```python
# Python
from pathlib import Path
script_dir = Path(__file__).parent
cache_file = script_dir / ".cache"
```

```bash
# Shell
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cache_file="$script_dir/.cache"
```

#### Cross-Platform Command Execution
- **JavaScript**: ZX framework for cross-platform shell operations
- **Python**: subprocess with shell=False for security
- **Shell**: POSIX-compatible commands with macOS optimizations
- **Environment**: Consistent environment variable handling across languages

#### Platform-Specific Optimizations
- **macOS**: Native tool integration (Spotlight, Quick Look, etc.)
- **Linux**: Alternative tool detection and graceful fallbacks
- **Windows**: WSL compatibility considerations (future)
- **Universal**: UTF-8 encoding, locale-aware operations

## Future Technical Considerations

### Multi-Domain Scalability
- **Category Expansion**: Easy addition of new script categories without architectural changes
- **Cross-Domain Integration**: Scripts that coordinate across multiple domains
- **Workspace Support**: Enhanced support for monorepo and multi-project environments
- **Plugin Architecture**: Extensible system for custom automation tools

### Technology Evolution
- **Runtime Updates**: Support for new versions of Node.js, Python, and system tools
- **Tool Integration**: Adaptation to new tools in each domain (AI tools, new media formats, etc.)
- **Performance Optimization**: Continuous improvement across all script categories
- **Security Enhancement**: Regular security updates and best practice adoption

### Maintenance Strategy
- **Dependency Management**: Automated dependency updates with compatibility testing
- **Cross-Language Testing**: Validation across different runtime environments
- **Documentation**: Automated documentation generation from code comments
- **Monitoring**: Usage analytics and performance monitoring across all domains

### Integration Opportunities
- **CI/CD Integration**: Enhanced support for automated environments
- **Cloud Services**: Integration with cloud storage, processing, and deployment services
- **API Integration**: Standardized approach for external service integration
- **Team Collaboration**: Enhanced support for shared configurations and team workflows
