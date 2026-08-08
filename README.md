# @yulolimum/toolkit

Personal development toolkit and source registry. Nothing here is published or installable. Copy the files you need into your own project and adapt them there.

Everything here is meant to be copied out. Much of it runs in this repository too, which is how it stays exercised: the shared configs lint this repo, and the living-docs skill maintains its documentation.

## Skills (`skills/`)

Agent skills, shared the same way as configs.

- [`living-docs`](skills/living-docs) - Scaffold, write, audit, and register living documentation for any project.
- [`llm-linter`](skills/llm-linter) - Match completed work to selected conventions, then apply the approved registry files.
  - [`new-prompt`](skills/llm-linter/new-prompt.md) - Workflow branch for creating a linter prompt.
  - [`commit`](skills/llm-linter/registry/commit.md) - Commit message and staging guidance.
  - [`comments`](skills/llm-linter/registry/comments.md) - Code comment conventions.
  - [`barrel-exports`](skills/llm-linter/registry/barrel-exports.md) - Direct-import conventions.
  - [`prefer-local-implementations`](skills/llm-linter/registry/prefer-local-implementations.md) - Guidance for preferring readable local code over premature extraction.
  - [`typescript-inference`](skills/llm-linter/registry/typescript-inference.md) - Return type inference guidance.
  - [`tanstack-query-data-fetching`](skills/llm-linter/registry/tanstack-query-data-fetching.md) - TanStack Query data-fetching and mutation guidance.
  - [`markdown`](skills/llm-linter/registry/markdown.md) - Markdown formatting guidance.
- [`link-global-skills`](skills/link-global-skills) - Link local skills individually into the global directories for Codex, Claude Code, and Cursor.
- [`create-linear-tickets`](skills/create-linear-tickets) - Create and update Linear tickets with workspace checks and a structured draft.
- [`humanizer`](skills/humanizer) - Apply the upstream Humanizer editorial guidance to prose.
- [`simplified-technical-english`](skills/simplified-technical-english) - Apply explicit Simplified Technical English rules to selected prose.
- [`typescript-script-pattern`](skills/typescript-script-pattern) - Build TypeScript automation scripts with consistent prompt, CLI, cache, and logging conventions.
- [`react-provider-pattern`](skills/react-provider-pattern) - Create React context providers with a data hook, thin provider, and guarded consumer hook.
- [`generate-pr-description`](skills/generate-pr-description) - Generate a concise pull-request description from the branch diff.
- [`dependency-catalog-upgrade`](skills/dependency-catalog-upgrade) - Consolidate monorepo dependency versions into a catalog, pin them, and upgrade them.

## Services (`services/`)

Stateful abstractions that own storage or network configuration. Adopt a storage class and its schema together.

**[`api-base.ts`](services/api-base.ts)** - Axios base class for API clients.

- `ApiBase` - Resettable Axios client with JSON defaults, base-URL and header setters, normalized API results, and an `unsafe` unwrapping helper.

**[`storage.ts`](services/storage.ts)** - Persistent storage built on MMKV.

- `Storage` - Typed store with `get`, `set`, `remove`, `clear`, and a reactive `useStorage` hook. Per-key defaults, JSON serialization for objects, and version-based clearing when a key's schema changes. Accepts a custom MMKV instance.

**[`secure-storage.ts`](services/secure-storage.ts)** - Asynchronous storage for small sensitive strings.

- `SecureStorage` - Typed Expo SecureStore wrapper with `get`, `set`, `remove`, and `clear`. Reads fall back to schema defaults, writes warn instead of throwing, and `clear` only removes keys the schema declares.

**[`tauri-storage.ts`](services/tauri-storage.ts)** - Asynchronous persistent storage for Tauri applications.

- `TauriStorage` - Schema-driven Tauri store wrapper with async updates and key-change listeners. It clears versioned keys when needed, returns defaults, and skips writes outside Tauri or when storage is unavailable.

## Components (`components/`)

Unstyled React Native components. Each solves one layout or state problem and leaves appearance to you.

- [`AspectImage.tsx`](components/AspectImage.tsx) - Expo Image wrapper that renders at the source's natural aspect ratio, with optional max width or height.
- [`CollapsibleView.tsx`](components/CollapsibleView.tsx) - View that measures its content and animates it open or closed.
- [`MeasuringView.tsx`](components/MeasuringView.tsx) - View that measures its own layout and passes the size to a render-prop child.
- [`PolymorphicView.tsx`](components/PolymorphicView.tsx) - View that can render another React Native component through an `as` prop.
- **[`QueryState.tsx`](components/QueryState.tsx)** - Composable TanStack Query state primitives. Include only the states a view needs.

  - `QueryStateProvider` - Shares one query's lifecycle flags and a caller-defined empty state.
  - `useQueryState` - Reads the shared state and throws outside its provider.
  - `QueryStatePending` - Renders while pending without an active request.
  - `QueryStateLoading` - Renders during the initial active request.
  - `QueryStateFetching` - Renders during a background request without replacing content.
  - `QueryStateError` - Renders for errors, with an optional retry action.
  - `QueryStateEmpty` - Renders when the caller reports successful empty data.
  - `QueryStateContent` - Renders successful non-empty content, with an override for stale data.

## Hooks (`hooks/`)

Reusable React and React Native hooks.

- [`useAppState.ts`](hooks/useAppState.ts) - Track foreground state with callbacks for the active and background transitions.
- [`useDebouncedValue.ts`](hooks/useDebouncedValue.ts) - Debounce a value, with leading mode, forced update, and cancel.
- [`useMultiCountPress.ts`](hooks/useMultiCountPress.ts) - Detect N presses within a time window, for debug menus and hidden features. Returns undefined when disabled.
- [`useQueryRefreshControlProp.ts`](hooks/useQueryRefreshControlProp.ts) - RefreshControl prop for exact query targets, with an optional reset for infinite lists.
- [`useRNDevTools.ts`](hooks/useRNDevTools.ts) - Development-only Rozenite panels for React Native network activity, TanStack Query, MMKV, and Expo SecureStore.
- [`useScreenPreventRemove.ts`](hooks/useScreenPreventRemove.ts) - Block navigation away from a screen while any condition holds, with functions to leave anyway.
- [`useTauriDevTools.ts`](hooks/useTauriDevTools.ts) - Enable the Cmd/Ctrl+R reload shortcut in a Tauri development build.
- [`useTauriStorage.ts`](hooks/useTauriStorage.ts) - React state for one Tauri storage key, with async updates, reset, and external change synchronization.

**[`useAuthorization.tsx`](hooks/useAuthorization.tsx)** - Role and permission gating. Replace the placeholder auth state with your own.

- `AuthorizationProvider` - Provides the authorization flags to the tree.
- `authorize` - Evaluate a request against authorization flags without React context.
- `useAuthorization` - Read all flags, or evaluate a request with AND or OR semantics. Throws without a provider.
- `Authorized` - Render children conditionally on the same request shape, with an optional fallback.

## Scripts (`scripts/`)

Interactive automation, one self-contained file per task. Every prompt has a flag that skips it, and each script remembers your last answers.

- [`dev:check-code-quality`](scripts/dev-check-code-quality.ts) - Pick and run any of TypeScript, ESLint, and Prettier. Remembers the selection.
- [`dev:clean`](scripts/dev-clean.sh) - Recursively delete `node_modules`, build output, and caches.
- [`dev:verify-software`](scripts/dev-verify-software.sh) - Check installed Node, pnpm, Java, Xcode, Android, and CocoaPods versions against the ranges set at the top of the script.
- [`eas:build`](scripts/eas-build.mts) - Interactive EAS build for development, shared preview, or production. Prompts for platform and profile, prints the assembled command, then runs it.
- [`eas:submit`](scripts/eas-submit.mts) - Submit a build to TestFlight or Play Store internal testing.
- [`eas:update`](scripts/eas-update.mts) - Publish an over-the-air update to a channel, with an optional message.
- [`linear:start-clockify-timer`](scripts/linear-start-clockify-timer.ts) - Start a Clockify timer from a Linear issue URL, or log a fixed duration retroactively.
- [`media:accelerate-video`](scripts/media-accelerate-video.mjs) - Speed up a video with FFmpeg, with or without audio.
- [`media:normalize-episode-names`](scripts/media-normalize-episode-names.mjs) - Rename TV episode files to `Show Name s01e01.ext` using an LLM, translating Russian titles when confident.
- [`media:play-twitch-stream`](scripts/media-play-twitch-stream.mjs) - Pick a live stream from your followed channels and launch it in streamlink.
- [`media:recursively-hardlink`](scripts/media-recursively-hardlink.sh) - Hardlink a file or flat directory of media into a new location.

**Usage**

Package commands are the usual entry point. Each script can also be run directly:

```bash
# .mjs scripts can be run without dependencies
npx zx --install ./scripts/script-name.mjs

# .ts scripts can be run via tsx
npx tsx ./scripts/script-name.ts

# Shell scripts can be run directly
./scripts/script-name.sh
```

## Utils (`utils/`)

Standalone helpers, one file per subject. No cross-imports, so copying a single file is enough.

**[`arrays.ts`](utils/arrays.ts)** - Array normalization, selection, sorting, and search.

- `ensureArray` - Wrap a value, array, or nullish input into a new array.
- `toggleStringItem` - Add or remove an item, deduplicating the result.
- `shuffleArray` - Fisher-Yates copy. The source is never modified.
- `randomArrayItem` - One random item, or undefined when empty.
- `randomArrayItems` - N random items without reusing a source position.
- `dedupeByKey` - Drop duplicate objects by key, keeping the first occurrence.
- `localeSort` - Sort by an accessor, ignoring case and ordering embedded numbers naturally.
- `localeSortStrings` - Same comparison, for an array of strings.
- `localeSortByKey` - Same comparison, by object property. Nullish sorts as empty.
- `fuzzySearch` - Search object keys, returning direct substring matches before falling back to weighted fuzzy matching.

**[`objects.ts`](utils/objects.ts)** - Type-safe object access and reshaping.

- `getObjPath` - Read a nested value by dot or bracket path.
- `isObjEmpty` - True for null, undefined, or an object with no keys.
- `getObjectKeys` - `Object.keys` with the keys typed.
- `getObjectValues` - `Object.values` with the values typed.
- `getObjectEntries` - `Object.entries` with each key paired to its own value type.
- `pick` - New object containing only the given keys.
- `pickBy` - New object containing properties that pass a predicate.
- `omit` - New object without the given keys.
- `removeNullishValues` - New object without null or undefined values.
- `getRootLevelObject` - Only the primitive properties. Drops nested objects, arrays, and functions.

**[`strings.ts`](utils/strings.ts)** - Text formatting, escaping, and SemVer.

- `pluralize` - Choose singular or plural, optionally prefixed with the count.
- `escapeRegExp` - Escape text so it matches literally inside a RegExp.
- `truncateWithEllipsis` - Truncate to a maximum length. The ellipsis counts toward the limit.
- `joinArrayWithRemainingCount` - Join the first N values and append the hidden count.
- `semverString` - Assemble a version from core, prerelease, and build metadata. Performs no validation.
- `semverGT` - Compare two normalized `MAJOR.MINOR.PATCH` versions.
- `removeNonAlphaNumeric` - Strip everything except Unicode letters and numbers, with optional characters preserved.

**[`colors.ts`](utils/colors.ts)** - Color parsing and WCAG contrast.

- `parseHexColor` - Parse `#RGB` or `#RRGGBB`.
- `parseRgbColor` - Parse `rgb()` or `rgba()`.
- `parseColor` - Parse any supported format, ignoring surrounding whitespace.
- `toLinearSrgb` - Convert one 8-bit channel to its linear-light value.
- `getRelativeLuminance` - WCAG relative luminance of an opaque color.
- `getContrastRatio` - WCAG contrast ratio between two opaque colors.
- `getContrastingColor` - Black or white, whichever contrasts better. Returns the fallback for invalid or semi-transparent input.

**[`dates.ts`](utils/dates.ts)** - Elapsed time and range containment.

- `formatElapsed` - Compact `1h 1m 1s` label from a millisecond duration.
- `isDateRangeContainedBy` - Whether one range fits inside another. Endpoints are inclusive and either bound may be omitted.

**[`timers.ts`](utils/timers.ts)** - Delays and controllable intervals.

- `delay` - Promise that resolves after a duration. Throws on a negative or non-finite input.
- `createInterval` - Interval built on recursive timeouts, with `run` and `stop`. Calling `run` while active will not double-schedule.

**[`geo.ts`](utils/geo.ts)** - Map region calculation for React Native Maps.

- `getRegionForCoordinates` - Smallest region containing a set of coordinates, with optional padding. Returns undefined for an empty list.

**[`images.ts`](utils/images.ts)** - Placeholder image URLs.

- `generatePlaceholderImageUrl` - Build a placehold.co URL with configurable size, colors, format, and label.

**[`safe-try-catch.ts`](utils/safe-try-catch.ts)** - Error handling without try/catch at the call site.

- `safeResolve` - Await a promise and get `{ ok, value }` with a fallback instead of a throw.
- `safeExec` - Same, for a synchronous function.

**[`provider-registry.tsx`](utils/provider-registry.tsx)** - Flat React provider composition.

- `ProviderRegistry` - Compose providers from a registry and an ordered list, with typed per-provider props and conditional entries.

## Configs (`configs/`)

Shareable config files. The root `eslint.config.mjs` and `prettier.config.mjs` re-export these, so this repo runs on what it hands out.

- [`eslint.config.mjs`](configs/eslint.config.mjs) - Flat ESLint config covering TypeScript, React, hooks, import sorting, and Prettier.
- [`prettier.config.mjs`](configs/prettier.config.mjs) - Prettier with package.json, shell, and Tailwind plugins.
- [`eas.json`](configs/eas.json) - EAS build and submit profiles for development, PR previews, shared previews, and production releases.

## Workflows (`workflows/`)

Reusable GitHub Actions workflows. Copy into `.github/workflows/` and replace the placeholders.

- [`mobile-ci.yml`](workflows/mobile-ci.yml) - Runs mobile tests for non-draft pull requests.
- [`mobile-pr-preview.yml`](workflows/mobile-pr-preview.yml) - Label-gated PR preview builds that reuse compatible native builds and publish PR OTA updates.
- [`mobile-preview.yml`](workflows/mobile-preview.yml) - Builds shared previews after `main` merges, submits iOS to TestFlight, and distributes Android through Firebase App Distribution.
- [`mobile-production.yml`](workflows/mobile-production.yml) - Manually builds and submits production iOS and Android releases.

## Docs (`docs/`)

Guides written for people, with no application-specific details.

- [`dev-ai-setup.md`](docs/dev-ai-setup.md) - Preferred AI development setup: repository context, living documentation, and reusable skills shared globally.
- [`dev-environment-setup.md`](docs/dev-environment-setup.md) - macOS React Native environment setup: brew, asdf, Node, pnpm, Java, CocoaPods, Xcode, and Android Studio.
- [`dev-eas.md`](docs/dev-eas.md) - EAS profiles, fingerprints, PR previews, Firebase tester distribution, store releases, and OTA updates.
- [`dev-push-notifications.md`](docs/dev-push-notifications.md) - Push notification architecture, with Expo and Firebase options for both the server and client halves.

## Lib (`lib/`)

Pre-configured library instances. Configure one here and everything downstream picks it up as a default.

- [`mmkv.ts`](lib/mmkv.ts) - Shared MMKV v4 instance for React Native persistent storage. Used by `services/storage.ts` unless another instance is injected.
- [`secure-storage.ts`](lib/secure-storage.ts) - Shared typed Expo SecureStore instance for access and refresh tokens. Used by `useRNDevTools.ts`; adapt its schema for each app.
