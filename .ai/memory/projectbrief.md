# Project Brief: @yulolimum/scripts

## Overview

`@yulolimum/scripts` is a personal development utilities package that provides essential scripts for maintaining code quality, cleaning project artifacts, and verifying development environments. This project serves as a centralized toolkit for common development workflow tasks.

## Core Purpose

- **Streamline Development Workflows**: Provide consistent, reusable scripts for common development tasks
- **Maintain Code Quality**: Automated tools for TypeScript checking, linting, and formatting
- **Environment Management**: Verification and cleanup utilities for development environments
- **Developer Experience**: Interactive, user-friendly command-line interfaces

## Key Components

### 1. Code Quality Management (`dev-check-code-quality.mjs`)
- Interactive TypeScript, ESLint, and Prettier runner
- User preference caching for workflow efficiency
- Selective tool execution based on user choice
- Comprehensive error reporting and success feedback

### 2. Project Cleanup (`dev-clean.sh`)
- Removes common development artifacts (.DS_Store, caches, node_modules)
- Cleans build outputs (dist, build, .next, .expo)
- Safe execution with error handling
- Cross-platform compatibility

### 3. Environment Verification (`dev-verify-software.sh`)
- Validates required development tools and versions
- Supports version range checking (min/max constraints)
- Comprehensive software detection (Node.js, Java, Xcode, Android tools)
- Clear success/failure reporting

## Target Users

- **Primary**: Personal development workflows
- **Secondary**: Team environments requiring consistent tooling
- **Scope**: JavaScript/TypeScript projects, mobile development, general software development

## Success Criteria

- Scripts execute reliably across different environments
- User experience is intuitive and efficient
- Maintenance overhead is minimal
- Scripts integrate well with existing development workflows
- Clear feedback and error handling for all operations

## Technical Constraints

- Must work on macOS (primary target)
- Compatible with modern Node.js versions (22.x)
- Minimal external dependencies
- Shell script compatibility for cleanup operations
- TypeScript/ESLint/Prettier integration requirements
