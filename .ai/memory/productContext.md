# Product context: @yulolimum/toolkit

## Why this project exists

This repository is a personal toolkit of reusable development automation, configuration, and source-level patterns. It is a practical registry rather than a published runtime library: consumers copy the pieces they need into their own projects and adapt them locally.

## What it provides

- Interactive scripts for code quality checks, environment verification, EAS builds, submissions, updates, Linear and Clockify time tracking, and media tasks.
- Shareable configuration for ESLint, Prettier, and Expo Application Services.
- Reusable TypeScript and React Native source files for arrays, objects, strings, colors, storage, hooks, components, and provider composition.
- General development documentation that explains the required environment and EAS workflows without assuming a client-specific application.

## Primary user experience

The toolkit should be quick to search, copy, and trust. Scripts are invoked through concise `category:action` package commands. Reusable modules have direct source paths, explicit exports, detailed examples, and a short README catalog entry explaining when to use them.

## Product principles

- Prefer standalone, composable source files over hidden framework layers.
- Keep public helpers type-safe and document behavior that is easy to misuse, especially edge cases and fallback behavior.
- Use current, pinned tooling so local development and CI run the same Node and pnpm versions.
- Keep dependency versions in one pnpm catalog so upgrades are deliberate and reviewable.
- Preserve compatibility with the React Native stack represented by the toolkit, including MMKV v4 storage patterns.

## Current scope

The active repository categories are development scripts, EAS deployment scripts, Linear integration, media scripts, shareable configuration, reusable code, and technical documentation. Future ideas are not treated as implemented features until source and README entries exist.
