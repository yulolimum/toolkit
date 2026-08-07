# No barrel exports

Barrel files are banned by default. A barrel file is an `index.ts` (or `index.js`) whose only job is to re-export from sibling modules, for example:

```ts
// index.ts
export * from './button'
export * from './input'
export { useForm } from './use-form'
```

When creating new modules, components, or any code inside a directory, do not add an `index.ts` that re-exports its siblings. Import from the source file directly instead:

```ts
// Banned
import { Button } from './components'

// Required
import { Button } from './components/button'
```

## Why

Barrel files hurt tree-shaking, slow down bundlers and type-checking, create circular-import hazards, and obscure where a symbol actually lives. Direct imports keep the dependency graph explicit and fast.

## The only exception

The single allowed case is the **public entry point of a monorepo workspace** that other workspaces consume. Even then, it is not automatic. Do not create one unless I have explicitly said barrel exports are okay for that workspace.

Context for the decision:

- In **JIT mode** (consuming `.ts`/`.tsx` source directly across workspaces), barrel exports are not needed. Default to banning them.
- In setups **without JIT mode** (e.g. a Turborepo client project that builds each package), a workspace entry barrel may be the only practical way to expose the public API. This is the one case where a barrel can be justified.

In both situations, raise it with me first and wait for my explicit go-ahead. Never add a barrel by default, even at a workspace boundary.

## Applying this as a cleanup pass

When run over existing code, flag every re-export-only `index.ts`. Remove the ones that are internal to a package and rewrite their importers to point at the source files. For any barrel that sits at a workspace's public entry point, do not remove it silently; surface it and ask before changing anything.
