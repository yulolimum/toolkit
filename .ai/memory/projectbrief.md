# Project brief: @yulolimum/toolkit

## Overview

`@yulolimum/toolkit` is a private, source-first development toolkit. It combines interactive automation with reusable TypeScript and React Native patterns that can be copied into other projects.

## Core purpose

- Reduce repeated setup work for development, EAS delivery, media tasks, and time tracking.
- Keep shared implementation patterns in one searchable repository.
- Document code well enough that a consumer can adopt an individual file without reading the whole repository.
- Maintain a current local and CI toolchain through explicit version pins and catalog-managed dependencies.

## Current components

### Scripts

- `dev-*`: code quality checks, cleanup, and environment verification.
- `eas-*`: interactive EAS build, submission, and update workflows.
- `linear-*`: Linear issue to Clockify timer workflow.
- `media-*`: video acceleration, episode-name normalization, Twitch playback, and recursive hardlinking.

### Shareable configuration

- `configs/`: ESLint, Prettier, and EAS configuration templates.
- `workflows/`: reusable GitHub Actions workflow for EAS preview deployment.
- `docs/`: environment setup and EAS or push-notification guidance.

### Reusable source registry

- `utils/`: arrays, colors, dates, geo, images, objects, strings, timers, safe error handling, and React provider composition.
- `lib/`: a configured MMKV v4 instance.
- `services/`: typed MMKV storage with schema version migration and reactive access, plus secure string storage for credentials.
- `hooks/` and `components/`: reusable React and React Native patterns.

## Organization rules

- Use descriptive, direct file names and import source files directly rather than through barrel exports.
- Keep scripts flat and categorize them with package-script prefixes.
- Update the README catalog when adding a reusable module or workflow.
- Keep memory documents concise, current, and limited to actual repository behavior.

## Technical constraints

- The repository is an ESM pnpm workspace.
- Node.js `24.19.0` and pnpm `11.20.0` are pinned in `.tool-versions`.
- Direct package versions belong in the root pnpm catalog, not individual dependency declarations.
- React Native examples target the catalog's current stack, including MMKV v4.
