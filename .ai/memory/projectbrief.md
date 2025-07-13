# Project Brief: @yulolimum/scripts

## Overview

`@yulolimum/scripts` is a comprehensive personal automation and utility collection that provides essential scripts for development workflows, build automation, deployment, media library management, system administration, and personal productivity tasks. This project serves as a centralized toolkit for all technical automation needs.

## Core Purpose

- **Comprehensive Automation**: Provide consistent, reusable scripts for all aspects of technical workflows
- **Multi-Domain Coverage**: Support development, media management, deployment, system administration, and personal productivity
- **Streamlined Execution**: Interactive and automated tools with consistent user experience
- **Personal Efficiency**: Reduce manual repetition across all technical tasks

## Key Components

### Current Implementation (Development Category)

#### 1. Code Quality Management (`dev-check-code-quality.mjs`)
- Interactive TypeScript, ESLint, and Prettier runner
- User preference caching for workflow efficiency
- Selective tool execution based on user choice
- Comprehensive error reporting and success feedback

#### 2. Project Cleanup (`dev-clean.sh`)
- Removes common development artifacts (.DS_Store, caches, node_modules)
- Cleans build outputs (dist, build, .next, .expo)
- Safe execution with error handling
- Cross-platform compatibility

#### 3. Environment Verification (`dev-verify-software.sh`)
- Validates required development tools and versions
- Supports version range checking (min/max constraints)
- Comprehensive software detection (Node.js, Java, Xcode, Android tools)
- Clear success/failure reporting

### Planned Expansion Categories

#### Media Management (`media-*`)
- Media library organization and metadata management
- File format conversion and optimization
- Duplicate detection and cleanup
- Automated sorting and cataloging

#### Deployment Automation (`deploy-*`)
- Server deployment and configuration
- Build and release automation
- Environment synchronization
- Rollback and recovery procedures

#### System Administration (`system-*`)
- System maintenance and cleanup
- Backup and synchronization
- Performance monitoring and optimization
- Security and update management

#### Personal Productivity (`personal-*`)
- Task automation and scheduling
- Data processing and analysis
- File organization and management
- Workflow optimization tools

## Target Users

- **Primary**: Personal automation across all technical domains
- **Secondary**: Team environments requiring consistent tooling and processes
- **Scope**: Development workflows, media management, deployment automation, system administration, personal productivity

## Organizational Strategy

### Naming Convention
- **File Naming**: Prefix-based organization (`category-action.extension`)
  - `dev-check-code-quality.mjs`
  - `media-organize-library.py`
  - `deploy-to-server.sh`
  - `system-cleanup-logs.sh`

- **Package.json Scripts**: Colon-separated namespacing (`category:action`)
  - `dev:check-code-quality`
  - `media:organize-library`
  - `deploy:to-server`
  - `system:cleanup-logs`

### Multi-Language Support
- **JavaScript/Node.js**: Interactive tools, development automation
- **Python**: Data processing, media management, analysis
- **Shell Scripts**: System operations, deployment, maintenance
- **Mixed Approach**: Choose the best tool for each specific task

## Success Criteria

- Scripts execute reliably across different environments and domains
- User experience is intuitive and efficient across all categories
- Maintenance overhead is minimal despite multi-domain scope
- Scripts integrate well with existing workflows (development, media, deployment, etc.)
- Clear feedback and error handling for all operations
- Consistent patterns across different script categories

## Technical Constraints

- Must work on macOS (primary target)
- Support for multiple runtime environments (Node.js, Python, shell)
- Minimal external dependencies per script category
- Consistent user experience patterns across different languages
- Scalable organization without complex folder structures
