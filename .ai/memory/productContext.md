# Product Context: @yulolimum/scripts

## Why This Project Exists

### Problem Statement

Modern JavaScript/TypeScript development involves repetitive tasks that developers perform across multiple projects:

- **Code Quality Maintenance**: Running TypeScript checks, ESLint, and Prettier across different projects with varying configurations
- **Environment Cleanup**: Removing build artifacts, caches, and dependencies that accumulate during development
- **Development Environment Verification**: Ensuring required tools are installed and properly versioned before starting work

### Pain Points Addressed

1. **Workflow Inconsistency**: Different projects require different combinations of quality tools
2. **Manual Repetition**: Developers manually run the same commands repeatedly
3. **Environment Issues**: Time wasted debugging issues caused by incorrect tool versions
4. **Context Switching**: Remembering which tools to run for which projects

## How It Should Work

### User Experience Goals

#### Code Quality Script (`dev-check-code-quality.mjs`)
- **Interactive Selection**: Users choose which tools to run (TypeScript, ESLint, Prettier)
- **Smart Defaults**: Remember user preferences to reduce decision fatigue
- **Clear Feedback**: Immediate success/failure indication with actionable error messages
- **Flexible Targeting**: Support for running on specific files/paths or entire project

#### Cleanup Script (`dev-clean.sh`)
- **One-Command Cleanup**: Single command removes all common development artifacts
- **Safe Operation**: Never delete source code, only generated/cached files
- **Comprehensive Coverage**: Handle artifacts from multiple frameworks (React, Expo, etc.)
- **Silent Success**: Clean execution without unnecessary output

#### Environment Verification (`dev-verify-software.sh`)
- **Comprehensive Checking**: Verify all required development tools in one run
- **Version Validation**: Ensure tools meet minimum/maximum version requirements
- **Clear Reporting**: Easy-to-read success/failure status for each tool
- **Early Detection**: Catch environment issues before they cause development problems

### Integration Patterns

#### Package.json Scripts
- Provide npm/pnpm script aliases for easy execution
- Follow consistent naming conventions (`dev:*`)
- Enable integration with existing development workflows

#### Cross-Project Usage
- Scripts should work regardless of project structure
- Minimal assumptions about project configuration
- Graceful handling of missing tools or configurations

## Value Proposition

### For Individual Developers
- **Time Savings**: Reduce repetitive command execution
- **Consistency**: Same quality checks across all projects
- **Confidence**: Know environment is properly configured before starting work
- **Focus**: Spend time on development, not tooling setup

### For Development Teams
- **Standardization**: Consistent quality processes across team members
- **Onboarding**: New team members can quickly verify their environment
- **Maintenance**: Simplified project cleanup and maintenance tasks
- **Quality Assurance**: Automated enforcement of code quality standards

## Success Metrics

### User Experience
- Scripts complete successfully on first run
- Users remember and prefer using these scripts over manual commands
- Minimal learning curve for new users
- Clear, actionable feedback when issues occur

### Technical Performance
- Fast execution times (< 30 seconds for most operations)
- Reliable operation across different project types
- Minimal resource consumption
- Graceful handling of edge cases and errors

### Adoption Indicators
- Regular usage across multiple projects
- Integration into daily development workflows
- Positive feedback on developer experience
- Reduced time spent on manual tooling tasks
