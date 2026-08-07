# Technical brief

## Operating model

Nothing here is built or published. Scripts run directly from source, and registry code is copied by hand into other projects. There is no bundle step, no output directory, and no artifact anyone installs.

That changes what dependencies are for. Packages in this repository exist so the source can be type-checked and so the scripts can run. They are not runtime dependencies of anything the toolkit ships, because the toolkit does not ship anything.

The repository is ESM throughout and is a single-package pnpm workspace.

## Dependency versions

The workspace catalog is the only place exact versions are written. Package manifests point at the catalog instead of literal version strings, so an upgrade is one edit in one file and reviews as one. Adding a direct dependency means adding it to the catalog first.

Major upgrades are handled as a version change followed by whatever source changes it forces, kept separate from each other.

## Toolchain

Node and pnpm are pinned for local development, and CI reads the same pin rather than declaring its own. Java 17 is required for React Native tooling. An environment verification script checks installed versions against the ranges the toolkit expects, covering the iOS and Android toolchains alongside Node and pnpm.

The setup guide, the version pins, and the verification ranges all describe the same environment and are kept in agreement.

## Script execution

Nothing compiles before it runs. Every script is executed straight from source through a package command named for its category and action, and the file extension determines how.

Shell scripts run directly. TypeScript scripts run through tsx, resolving imports and types from the installed workspace. Plain ESM scripts run through zx with on-demand installation, so their imports are fetched at run time instead of coming from the workspace.

That split is a real fork rather than an accident. A zx script is portable and will run on a machine that has never installed this repository, which suits automation used away from a development setup. A TypeScript script gives that up and gets type checking in return, since the root compilation program covers the scripts directory while excluding plain ESM files. Each script trades portability against checking, and its extension is the record of which way the trade went.

Because everything is ESM, top-level await is available and scripts read straight down the file without a wrapper function.

Scripts that reach external services read credentials from a local environment file that is never committed. The accompanying example file is the record of which variables exist and where each one comes from.

## TypeScript

The project extends the strictest shared base configuration, with bundler module resolution and the automatic JSX runtime.

The root compilation program covers only the scripts and the shareable configuration. Registry source sits outside it. Those files are written for the applications that will host them, against React Native, Expo, and Tauri types this repository declares but never runs, so check them in a consuming project or in isolation rather than expecting the root program to cover them.

## Registry conventions

Every module is a direct import target. There are no barrel files, and names are descriptive rather than generic, because search is how anything here gets found.

Public helpers carry TSDoc with worked examples, and behavior that is easy to get wrong is spelled out instead of left for the reader to discover. Inline comments are reserved for constraints and surprises. Helpers avoid mutating their inputs and accept readonly arguments when they do not need to write.

New registry modules get an entry in the README catalog, which is the discovery surface for the whole repository.

## Lint and formatting

The shared ESLint and Prettier configuration is meant for other projects, and the root configuration re-exports it rather than defining its own rules. The repository is governed by the same rules it hands out, so they get exercised here before anyone else copies them.

## Agent setup

Agent-facing material lives in shareable skills, separate from the documentation this repository distributes to people. The linter keeps its convention files beside its workflow so a copied skill retains its rules.

The entry point is the documentation registry rather than a single large instruction file. The root agent instruction file does nothing but point at that registry, and each registry entry describes its brief well enough for an agent to judge whether the task at hand needs it. The intent is that an agent reads the map first and then only the briefs that apply, so the cost of orienting stays roughly flat as the documentation grows.

Competing tool conventions are handled with relative symlinks instead of duplicate files. The vendor-specific root instruction file and directory both resolve to the shared ones, and the agent directory reaches the shareable skills at the repository root the same way. There is one copy of everything, and relative links keep the arrangement intact in any clone.

Responsibilities are split. Briefs describe the project, and agent instruction files describe how to work in it. Documentation states what a domain is for and what governs it; it does not tell an agent what to do.
