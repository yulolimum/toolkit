# No barrel exports

Do not use a barrel file by default. A barrel file is an `index.ts` or an `index.js` that only re-exports the modules beside it:

```ts
// index.ts
export * from './button'
export * from './input'
export { useForm } from './use-form'
```

When you create a module, a component, or code in a directory, do not add an `index.ts` that re-exports the modules beside it. Import from the source file:

```ts
// Banned
import { Button } from './components'

// Required
import { Button } from './components/button'
```

## Why

A barrel file has four costs:

- It prevents tree-shaking.
- It makes the bundler and the type checker slower.
- It causes a circular import.
- It hides the source of a symbol.

A direct import keeps the dependency graph explicit and fast.

## The one exception

The only permitted case is the public entry point of a workspace in a monorepo that other workspaces use. Even in that case, do not create a barrel file until the developer approves one for that workspace.

Two conditions decide whether the case applies:

- In JIT mode, a workspace uses the `.ts` and `.tsx` source of another workspace directly. A barrel export gives nothing there. Do not use one.
- Without JIT mode, each package builds. A Turborepo project is such a setup. A barrel file at the entry of a workspace can then be the only practical way to give the public API. This is the one case that can justify a barrel file.

In both conditions, ask the developer first, and wait for approval. Never add a barrel file by default, even at the boundary of a workspace.

## Apply this as a cleanup pass

For code that exists, report each `index.ts` that only re-exports modules. Remove a barrel file that is internal to a package, and change its importers to use the source files.

Do not remove a barrel file at the public entry point of a workspace. Report it, and ask the developer before you change it.
