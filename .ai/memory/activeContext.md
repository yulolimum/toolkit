# Active context: @yulolimum/toolkit

## Current focus

This branch modernizes the toolkit's React Native storage support, dependency management, local tooling, CI setup, and reusable utility registry. The completed work is committed through `a7821aa`; current work adds a React Native Maps region helper.

## Completed on this branch

### MMKV v4 migration

- `lib/mmkv.ts` now creates the shared instance with MMKV v4's `createMMKV` API.
- `services/storage.ts` uses MMKV v4's `remove` API, keeps schema-version migration metadata, and continues to support an injected MMKV instance.
- Storage defaults are `unknown` instead of `any`, and functional updates are typed without widening through `any`.
- The reactive storage hook continues to choose the appropriate native MMKV hook and uses the instance configured for the storage service.

### Dependency and tooling refresh

- Every direct dependency now resolves through the root pnpm catalog in `pnpm-workspace.yaml`.
- `.tool-versions` pins Node.js `24.19.0` and pnpm `11.20.0`; `package.json` uses the same pnpm version.
- The catalog upgrades the React Native stack to React `19.2.8`, React Native `0.86.2`, Expo `57.0.10`, MMKV `4.3.2`, and the matching Nitro Modules package.
- The development environment guide documents installing pnpm through asdf and the repository's pinned versions.
- The EAS preview workflow uses current v6 setup actions and reads the Node version from `.tool-versions`.

### Compatibility cleanup

- EAS scripts use inferred cache return types, typed Inquirer selections, and typed choice lists that work with the upgraded packages.
- Media and quality-check scripts use the corresponding current Inquirer imports and a simpler cache read path.
- `useMultiCountPress` uses a portable timeout reference type instead of a Node-only timeout type.
- `useAuthorization` formatting was updated for the current TypeScript toolchain.

### Reusable utility registry

- `utils/arrays.ts` now covers scalar normalization, toggling, shuffling, random selection, deduplication, and locale-aware sorting.
- `utils/objects.ts` has more precise typed entries and adds `pick`.
- `utils/dates.ts` formats elapsed durations and checks inclusive date-range containment with optional bounds.
- `utils/colors.ts` parses supported color strings, calculates WCAG luminance and contrast, and selects readable black or white text. Transparent colors use the caller's fallback because the background is unknown.
- `utils/strings.ts` adds documented helpers for pluralization, regular-expression escaping, truncation, compact list summaries, SemVer-core comparison, and character filtering with preserved exclusions.
- `utils/geo.ts` calculates a `react-native-maps` region that contains a set of coordinates. Its dependency is development-only so the toolkit can type-check the source without imposing a runtime dependency on consumers.
- The README catalogs each utility module so consumers can discover copy-and-paste source files quickly.

## Working conventions

- Treat `pnpm-workspace.yaml` as the source of truth for direct dependency versions. Package manifests reference dependencies with `catalog:`.
- Keep Node and pnpm pins synchronized across `.tool-versions`, `package.json`, CI, and environment documentation.
- Utility modules are standalone source files with exported, typed helpers and detailed TSDoc examples. Update the README catalog when adding one.
- Import source files directly. Do not add barrel export files unless an explicit workspace-public entry point is approved.
- Preserve intentional verbose TSDoc on reusable public helpers. Inline comments should explain non-obvious reasoning only.

## Next steps

- Use the catalog upgrade flow for future dependency refreshes, checking breaking changes before major version bumps.
- Keep MMKV consumers on v4 APIs when adding storage examples or migration guidance.
