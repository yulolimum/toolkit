# No barrel exports

Do not use barrel files by default. A barrel file is an `index.ts` (or `index.js`) that only re-exports sibling modules, for example:

```ts
// index.ts
export * from './button'
export * from './input'
export { useForm } from './use-form'
```

When you create modules, components, or code in a directory, do not add an `index.ts` that re-exports sibling modules. Import directly from the source file:

```ts
// Banned
import { Button } from './components'

// Required
import { Button } from './components/button'
```

## Why

Barrel files hurt tree-shaking, slow bundlers and type-checking, create circular-import hazards, and hide a symbol's source. Direct imports keep the dependency graph explicit and fast.

## The only exception

The only allowed case is the **public entry point of a monorepo workspace** that other workspaces consume. Even then, do not create one unless I explicitly approve barrel exports for that workspace.

Context for the decision:

- In **JIT mode** (when workspaces consume `.ts`/`.tsx` source directly), barrel exports are not needed. Do not use them.
- In setups **without JIT mode** (for example, a Turborepo client project that builds each package), a workspace entry barrel can be the only practical way to expose the public API. This is the only case where a barrel can be justified.

In both cases, ask me first and wait for explicit approval. Never add a barrel by default, even at a workspace boundary.

## Applying this as a cleanup pass

For existing code, flag each `index.ts` that only re-exports modules. Remove barrels that are internal to a package. Update their importers to use the source files. For a barrel at a workspace's public entry point, do not remove it silently. Surface it and ask before making a change.
