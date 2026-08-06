# Tech context: @yulolimum/toolkit

## Runtime and package management

- Node.js: `24.19.0`, pinned in `.tool-versions`.
- pnpm: `11.20.0`, pinned in `.tool-versions` and `package.json`.
- Java: version 17 is required by the environment verification script for React Native tooling.
- The repository is an ESM pnpm workspace with the root package listed in `pnpm-workspace.yaml`.
- Direct dependency versions live only in the root pnpm catalog. Use the catalog upgrade flow instead of editing `package.json` version strings.

## Key current packages

- React `19.2.8`, React Native `0.86.2`, Expo `57.0.10`, and Expo Image `57.0.2`.
- React Native MMKV `4.3.2` with React Native Nitro Modules `0.36.5`.
- React Native Maps `1.29.0` supplies the `utils/geo.ts` type contract and follows the toolkit's direct-dependency convention.
- Expo SecureStore `57.0.1` supports typed asynchronous storage for small sensitive strings.
- TypeScript is catalog-managed alongside TypeScript Native; strict project settings extend `@tsconfig/strictest`.
- ESLint `10.8.0`, Prettier `3.9.6`, tsx `4.23.8`, tsup `8.5.1`, and zx `8.8.5` support development and script execution.
- Inquirer packages are catalog-managed at their v5 and v6 releases, so callers should use their current generic prompt APIs where inference needs help.

## TypeScript configuration

- `tsconfig.json` extends `@tsconfig/strictest/tsconfig.json`.
- The project uses `module: esnext`, `target: esnext`, `moduleResolution: bundler`, and `jsx: react-jsx`.
- The root config includes scripts and configs. Validate standalone source snippets directly when necessary instead of assuming they are part of the root compilation program.

## React Native storage

- Use `createMMKV` to construct MMKV v4 instances.
- Use `remove` instead of the removed v3 deletion API.
- The storage service supports strings, booleans, numbers, and JSON objects, configurable MMKV instances, version-based clearing, and native reactive hooks.
- Use the secure-storage service for credentials and other small sensitive strings. It is asynchronous and offers no reactive hook.
- Default schema values are `unknown` at the base boundary and become specific through the supplied schema.

## Local setup and verification

- Install Node and pnpm through asdf, then run `asdf install` from the repository root.
- `scripts/dev-verify-software.sh` checks Node, pnpm, Java, Xcode, Android tooling, and CocoaPods. Its current ranges require Node 24.19.x, pnpm 11.20.x, Java 17.x, CocoaPods 1.16+, and Xcode 26.4+.
- `docs/dev-environment-setup.md` is the user-facing source for setup commands and must stay synchronized with the pins.

## CI

- The reusable EAS preview workflow uses GitHub Actions v6 setup actions.
- Node is selected from `.tool-versions`; pnpm dependency installation uses `pnpm install --frozen-lockfile`.
