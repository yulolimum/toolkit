# System patterns: @yulolimum/toolkit

## Repository layout

```text
@yulolimum/toolkit/
├── configs/       Shareable ESLint, Prettier, and EAS configuration
├── docs/          Environment and delivery guidance
├── hooks/         Reusable React and React Native hooks
├── lib/           Configured third-party library instances
├── services/      Stateful, typed service abstractions
├── utils/         Standalone helper modules
├── workflows/     Reusable GitHub Actions workflows
├── scripts/       Interactive automation grouped by package-script prefix
├── pnpm-workspace.yaml
└── .tool-versions
```

## Dependency and tooling pattern

- `pnpm-workspace.yaml` defines the root workspace and a single catalog of exact direct dependency versions.
- `package.json` references every direct dependency with `catalog:` and pins the pnpm package manager version.
- `.tool-versions` pins the local Node.js and pnpm executables. CI reads the Node pin from that file rather than maintaining a second version value.
- Major upgrades are followed by targeted source compatibility changes, not broad rewrites.

## Reusable module pattern

- Each reusable module is a direct import target. Do not create internal barrel exports.
- Export public helpers and use TypeScript types that describe the consumer-facing contract.
- Keep detailed TSDoc on public utility functions, including examples and behavior that is not obvious from the signature.
- Keep inline comments only for constraints, workarounds, or surprising behavior.
- Favor non-mutating helpers when the input is an array or object, and accept readonly inputs when mutation is unnecessary.
- Add a concise README catalog entry for each new reusable module.

## Storage pattern

- `lib/mmkv.ts` owns the default MMKV v4 instance created with `createMMKV`.
- `Storage` accepts a schema and can accept another MMKV instance through its constructor for testing or specialized storage boundaries.
- Schema entries declare their persistence type, default value, and optional version. The service stores version metadata under `__storage_metadata` and removes stale values when a version changes.
- Imperative methods read, write, remove, and clear values. Object values are serialized; primitive values are stored natively.
- `useStorage` adapts MMKV's native reactive hooks to the configured storage instance and returns the default when a value is absent.

## Utility patterns

- Array helpers normalize values, avoid accidental source mutation, and use locale-aware comparison when sorting display strings.
- Object helpers preserve key and value relationships where TypeScript's built-in object methods would otherwise widen them.
- Date helpers format elapsed durations and make inclusive range-containment semantics explicit.
- Color helpers parse only supported hex and comma-separated RGB formats, calculate WCAG contrast, and return fallbacks for invalid or transparent colors.
- String helpers make their edge cases explicit: the truncation limit includes the ellipsis, list summaries use an item count, SemVer comparison supports only normalized core versions, and character filtering allows explicit preserved characters.
- Geo helpers that use React Native Maps should declare that dependency and make map-projection limitations explicit.

## Script pattern

- Package scripts use a `category:action` name and call a self-contained source file.
- Interactive scripts use Inquirer prompts, accept command-line overrides where appropriate, and cache preferences under `node_modules/.cache` or a script-local cache.
- Scripts should rely on TypeScript inference where it preserves the public behavior, while typing values whose union is not inferable from prompt choices.

## CI pattern

- The EAS preview workflow installs pnpm with `pnpm/action-setup@v6`, installs Node with `actions/setup-node@v6`, reads the Node pin from `.tool-versions`, and uses a frozen pnpm install.
