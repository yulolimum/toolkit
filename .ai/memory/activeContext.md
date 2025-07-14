# Active Context: @yulolimum/scripts

## Current Work Focus

### Media Script LLM Integration (Current Session)

- **Status**: Completed comprehensive OpenRouter LLM integration for episode name normalization
- **Completed**:
  - Integrated OpenRouter API with axios client and proper authentication
  - Enhanced prompt engineering with Russian translation capabilities and confidence categories
  - Implemented dynamic console.table API summary with cost tracking
  - Added comprehensive error handling with graceful fallbacks
  - Created advanced prompt with CERTAIN/UNCERTAIN/UNKNOWN confidence categories
  - Added support for both Cyrillic and phonetic Russian show name translation
  - Included real-world examples (Улицы разбитых фонарей) for better LLM understanding
  - Enabled actual file renaming functionality (removed test mode)
  - Updated README.md to reflect OpenRouter LLM and Russian translation support
  - Added OPENROUTER_API_KEY to .env.example with documentation
- **Completed**: Final memory bank updates for current session
- **Next**: Test the script with real Russian media files

### Previous Session: Prettier Configuration Enhancement

- **Status**: Completed comprehensive Prettier configuration with multi-language support
- **Completed**:
  - Added `prettier-plugin-sh` for shell script formatting with tab indentation
  - Added `prettier-plugin-tailwindcss` for automatic CSS class sorting
  - Updated configuration to use single quotes (`singleQuote: true`)
  - Updated to modern trailing comma standard (`trailingComma: "all"`)
  - Configured shell script overrides with tabs and comment preservation
  - Reformatted all existing shell scripts to use tab indentation
  - Updated README.md to reflect shell script and Tailwind CSS support
  - Installed prettier-plugin-tailwindcss as dev dependency

### Previous Session: Linear Integration Category Implementation

- **Status**: Completed Linear-Clockify timer integration with full functionality
- **Completed**:
  - Implemented `linear-start-clockify-timer.ts` with complete timer functionality
  - Added environment variable configuration with validation
  - Implemented smart workspace caching (skip if cached)
  - Implemented project selection with cached defaults (always prompt)
  - Added Linear URL input with CLI argument support (`--url`)
  - Integrated Linear API for issue validation and data fetching
  - Integrated Clockify API for workspace/project fetching and timer management
  - Added real-time timer display with elapsed time formatting
  - Implemented graceful timer stopping with Ctrl+C confirmation
  - Updated package.json with `linear:start-clockify-timer` script entry
  - Updated README.md to include Linear Integration category
  - Created comprehensive .env.example with API key instructions
  - Cleaned up code (removed unused CLI arguments, fixed ESLint issues)

### Project Vision Evolution

#### Expanded Scope Understanding

The project has evolved from a **development utilities package** to a **comprehensive personal automation and utility collection** covering:

- **Development Workflows**: Code quality, environment setup, project cleanup
- **Media Management**: Library organization, format conversion, metadata handling
- **Deployment Automation**: Server deployment, environment synchronization
- **System Administration**: Maintenance, backup, monitoring
- **Personal Productivity**: Task automation, data processing, workflow optimization

#### Current Implementation Status

**Development Category (Fully Functional)**

1. **dev-check-code-quality.mjs**: Interactive code quality runner
   - TypeScript type checking
   - ESLint linting with auto-fix
   - Prettier formatting
   - User preference caching
   - Selective tool execution

2. **dev-clean.sh**: Project cleanup utility
   - Removes development artifacts (.DS_Store, caches)
   - Cleans build outputs (node_modules, dist, .next, .expo)
   - Safe execution with error tolerance

3. **dev-verify-software.sh**: Environment verification
   - Validates required development tools
   - Version range checking (Node.js 22.x, Java 17.x, etc.)
   - Comprehensive reporting

**EAS Deployment Category (Nearly Complete)**

1. **eas-build.mjs**: Interactive EAS build automation
   - Platform selection (iOS, Android, All)
   - Profile selection (Preview, Production)
   - Distribution selection (Store, Internal)
   - EAS server vs local build options
   - User preference caching
   - Command preview and confirmation

2. **eas-submit.mjs**: App store submission automation
   - Platform selection (iOS, Android)
   - Profile selection (Preview, Production)
   - Local build support with automatic path detection
   - Smart path logic for iOS (.ipa) vs Android (.aab)
   - User preference caching
   - Command preview and confirmation

3. **eas-update.mjs**: Over-the-air update management
   - Platform selection (All, iOS, Android)
   - Channel selection (Preview, Production)
   - Optional update messaging or auto-generated
   - Environment mapping and cache clearing
   - User preference caching
   - Command preview and confirmation

**Media Management Category (Started)**

1. **media-recursively-hardlink.sh**: Movie and TV show hardlink creation
   - Creates hardlinks for movies and TV shows to save disk space
   - Handles both single files and directories (flat structure only)
   - Safety checks for source/destination validation
   - Comprehensive error handling with colored output
   - Prevents subdirectory processing (enforces flat structure)
   - Detailed usage documentation with examples

2. **media-normalize-episode-names.mjs**: LLM-powered episode filename normalization
   - OpenRouter API integration with Claude 3.5 Sonnet for intelligent filename processing
   - Advanced Russian translation support (Cyrillic ↔ phonetic English)
   - Confidence-based decision making (CERTAIN/UNCERTAIN/UNKNOWN categories)
   - Interactive confirmation with before/after preview table
   - Comprehensive error handling with graceful fallbacks to original filenames
   - Dynamic API cost tracking and performance monitoring with console.table
   - Real-world examples including complex Russian show names
   - Safe file renaming with duplicate detection and error reporting

**Other Categories (Planned)**

- **system-\***: System maintenance and administration
- **personal-\***: Personal productivity and workflow tools

## Recent Changes

### EAS Deployment Implementation (Current Session)

- **First Category Expansion**: Successfully implemented first script beyond development category
- **EAS-Specific Naming**: Established `eas-*` prefix for EAS-specific deployment automation
- **Interactive Patterns**: Validated interactive CLI patterns work across different domains
- **Package.json Integration**: Added `eas:build` script following established naming convention
- **Architecture Validation**: Confirmed multi-domain architecture scales effectively

### EAS Deployment Strategy Implementation

- **EAS-Specific Naming**: Implemented `eas-*` prefix for EAS deployment tools (vs generic `deploy-*`)
- **Interactive CLI Patterns**: Successfully applied established patterns to new domain
- **Cross-Domain Caching**: Extended `.cache` file pattern to EAS deployment preferences
- **Command Construction**: Implemented sophisticated EAS CLI command building with conditional flags
- **User Experience Consistency**: Maintained visual feedback and confirmation patterns

## Next Steps

### Immediate (This Session)

1. ✅ Implement first EAS deployment script (`eas-build.mjs`)
2. ✅ Update package.json with new script and dependencies
3. 🔄 Update memory bank to reflect successful category expansion
4. 📝 Document EAS-specific patterns and architecture validation

### Short-term EAS Completion Opportunities

1. **Remaining EAS Scripts**: Add `eas-status.mjs` for build monitoring and reporting
2. **EAS Environment Validation**: Extend `dev-verify-software.sh` to include EAS CLI validation
3. **Enhanced Error Handling**: Add EAS CLI availability checks and better error messages
4. **Build Artifact Management**: Add scripts for managing and organizing build outputs
5. **README Documentation**: ✅ Created simple README with script and config registry

### Medium-term Multi-Domain Expansion

1. **Complete EAS Suite**: Full EAS deployment automation (build, submit, update, status)
2. **Media Management**: Scripts for library organization, format conversion, metadata handling
3. **System Administration**: Maintenance schedules, backup automation, monitoring tools
4. **Personal Productivity**: Data processing, workflow automation, task management
5. **Cross-Domain Integration**: Scripts that coordinate EAS builds with other automation

### Long-term Architecture Evolution

1. **Cross-Domain Integration**: Scripts that coordinate across multiple categories
2. **Plugin Architecture**: Extensible system for custom automation tools
3. **Configuration Profiles**: Domain-specific and cross-domain configuration management
4. **Team Collaboration**: Shared configurations and standardized automation patterns

## Active Decisions and Considerations

### Multi-Domain User Experience Priorities

- **Consistency**: Unified experience across all script categories and languages
- **Simplicity**: Keep scripts easy to understand regardless of implementation language
- **Reliability**: Ensure consistent behavior across different environments and domains
- **Feedback**: Provide clear, actionable feedback for all operations across all categories
- **Performance**: Maintain appropriate execution times for each domain type

### Cross-Domain Technical Architecture

- **Independence**: Each script should work standalone while supporting coordination
- **Consistency**: Shared patterns for error handling and user feedback across languages
- **Extensibility**: Design for easy addition of new categories without architectural changes
- **Language Choice**: Select optimal language for each specific automation need
- **Configuration**: Unified configuration approach accessible from all languages

### Multi-Domain Quality Standards

- **Code Quality**: All scripts follow domain-appropriate quality standards
- **Documentation**: Comprehensive documentation for maintenance across all categories
- **Testing**: Consider automated testing strategies for different script types
- **Security**: Safe execution patterns across all domains and languages
- **Cross-Language Consistency**: Maintain consistent patterns despite language differences

## Important Patterns and Preferences

### Cross-Domain Design Patterns

- **Prefix-Based Organization**: `category-action.extension` for file naming
- **Namespace Scripts**: `category:action` for package.json script naming
- **Language Selection**: Choose optimal language for each specific automation need
- **Flat Structure**: Avoid nested directories, use prefixes for organization
- **Consistent UX**: Unified visual feedback (✅/❌/⚠️) across all categories

### Multi-Language CLI Patterns

- **Interactive Selection**: Checkboxes for multi-option choices (JavaScript)
- **Progress Reporting**: Appropriate feedback for each domain (spinners, progress bars)
- **Smart Defaults**: Remember user preferences across categories
- **Batch Processing**: Efficient handling of large datasets (Python, shell)
- **Graceful Degradation**: Continue operation when individual operations fail

### Universal Error Handling Philosophy

- **Domain-Appropriate Handling**: Critical vs. recoverable errors vary by domain
- **Consistent Reporting**: Same visual indicators across all languages
- **Actionable Guidance**: Provide specific next steps for each domain
- **Cross-Language Standards**: Consistent exit codes and error formats

### Multi-Domain Configuration Management

- **Shared Configuration**: JSON-based config accessible from all languages
- **Category-Specific Sections**: Organized by script category with inheritance
- **Cross-Language Access**: JavaScript (fs), Python (json), Shell (jq)
- **Hierarchical Defaults**: Global → Category → Script → User preferences

## Learnings and Project Insights

### Multi-Domain Automation Strategy

- **Prefix-based organization** scales better than nested directories for mixed-language projects
- **Colon-separated namespacing** in package.json provides clear categorization
- **Language selection per domain** optimizes for specific automation needs
- **Flat structure** simplifies navigation and script discovery

### Cross-Language Integration Patterns

- **JSON configuration** provides universal access across JavaScript, Python, and shell
- **Consistent visual feedback** (✅/❌/⚠️) works across all implementation languages
- **Shared cache directory** enables cross-script preference management
- **Domain-specific tooling** allows optimization for each automation category

### Scalability Insights

- **Category expansion** is straightforward with established naming conventions
- **Multi-language coordination** requires careful attention to configuration sharing
- **User experience consistency** is achievable across different runtime environments
- **Performance optimization** strategies vary significantly by domain type

### Technology Evolution Understanding

- **Development tools** benefit from interactive, caching-enabled approaches
- **Media processing** requires batch operations with progress reporting
- **System administration** needs safe execution with comprehensive error handling
- **Deployment automation** demands validation, rollback, and monitoring capabilities

### Organizational Effectiveness

- **Flat structure with prefixes** provides better discoverability than nested hierarchies
- **Package.json script mapping** creates familiar interface regardless of implementation language
- **Cross-domain patterns** enable knowledge transfer between different automation categories
- **Documentation-driven development** becomes critical with multi-language, multi-domain scope
