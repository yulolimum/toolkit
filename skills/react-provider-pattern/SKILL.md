---
name: react-provider-pattern
description: Create React context providers following a strict four-part pattern — a private data hook, type-inference from its return, a thin provider component, and a consumer hook that either throws when used outside its provider or falls back to running the data hook directly. Use whenever asked to create, scaffold, or refactor a React context provider, a "*Provider" component, or a "use*" context consumer hook.
---

# React Provider Creator

You create React context providers using ONE canonical pattern. Do not invent variations. Follow the four parts below exactly, in order, in a single file.

## When to Use This Skill

Invoke when the user asks to:

- Create or scaffold a new context provider (`FooProvider`)
- Add a consumer hook (`useFoo`) backed by context
- Refactor screen/component state into a shared provider
- Wrap data-fetching (React Query) + local state into a reusable context

## Core Philosophy

- **The data hook holds all logic. The provider is a dumb 3-line wrapper.**
- **The context type is inferred from the data hook's return — never hand-written.**
- **The consumer hook guards access:** throw when there is no provider, UNLESS the provider is explicitly designed with a fallback path.

## The Four Parts

Author every provider file in this exact order.

### 1. Data Hook (private, holds all logic)

A private hook — NOT exported — that owns everything: queries, local state, memos, effects, derived values, and action callbacks. Its return value becomes the context value.

- Name it `useFooData`. Do NOT name it `useFooDataContext` or `useFooContext` — this hook does not touch context (`useContext`/`createContext`). It *produces* the value that will be placed into context. Reserve the word `Context` for the two things that actually are the context (the `type` and the `const` in part 2).
- Accept the same arguments the provider will accept (e.g. `customerId?: string`).
- Section the returned object with comments in this order: `// data`, `// actions`, `// queries`, `// miscellaneous`. Nest all React Query results under a single `queries` key.

```tsx
function useFooData(fooId?: string) {
  const [selected, setSelected] = useState<string | undefined>(undefined)

  const fooQuery = useQuery(trpc.foo.getFoo.queryOptions({ id: fooId ?? "" }, { enabled: !!fooId }))
  const foo = useMemo(() => fooQuery.data, [fooQuery.data])

  return {
    // data
    fooId,
    foo,
    selected,
    // actions
    setSelected,
    // queries
    queries: {
      fooQuery,
    },
    // miscellaneous
  }
}
```

### 2. Context + Type Inference

Derive the context type from the data hook's return with `ReturnType`. Never write the shape by hand — it drifts. Give the `type` and the `const` context the **same name** (TypeScript keeps types and values in separate namespaces, so `FooContext` can be both). This gives you one symbol to reference everywhere.

Choose the initial value based on whether the consumer will guard (see part 4):

```tsx
type FooContext = ReturnType<typeof useFooData>

// Guarded consumer (default): seed with null and type it nullable so the guard is real.
const FooContext = createContext<FooContext | null>(null)

// Fallback consumer (opt-in only): seed with a lie so the falsy check can fall through.
// const FooContext = createContext<FooContext>(undefined as any)
```

Place this block wherever reads best — top of file or bottom next to the consumer. Keep the `type` and `const` adjacent.

### 3. Provider Component (thin wrapper)

Exported. Three lines of body. Call the data hook, feed the result into `.Provider`. No logic here — if you are tempted to add logic, it belongs in the data hook.

```tsx
export function FooProvider(props: PropsWithChildren<{ fooId?: string }>) {
  const data = useFooData(props.fooId)

  return <FooContext.Provider value={data}>{props.children}</FooContext.Provider>
}
```

Rules (per project conventions):
- Named function declaration, exported inline. Never an arrow function or default export.
- Never destructure props in the signature. Read `props.fooId` directly, or destructure at the top of the body.
- Props type is `PropsWithChildren<{ ... }>`.

### 4. Consumer Hook (the guard lives here)

Exported. Reads the context. **This is where access is guarded — never in the provider.** Two variants:

**(a) Guarded (DEFAULT — use unless there's a clear reason not to)**

Throw when consumed outside a provider. This turns a silent class of bugs (context default returned as if real, every field `undefined`) into a loud, immediate error.

```tsx
export function useFoo() {
  const context = useContext(FooContext)
  if (!context) throw new Error("useFoo must be used within a FooProvider")
  return context
}
```

**(b) Context-or-fallback (opt-in — only when the hook is legitimately called both inside and outside a provider)**

If callers sometimes mount inside `<FooProvider>` and sometimes call the hook standalone, fall through to running the data hook directly. This REQUIRES the `undefined as any` context default from part 2, because the falsy check drives the branch. Do NOT add a throw here — it would break the escape hatch.

```tsx
export function useFoo(fooId?: string) {
  const context = useContext(FooContext)

  if (context) {
    return context
  } else {
    // Context-or-fallback: callers either mount inside <FooProvider> (context
    // branch) or call this hook directly (fallback branch). The branch taken is
    // stable for the component's lifetime because provider position never changes
    // mid-route, so the conditional hook call is safe.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useFooData(fooId)
  }
}
```

**Deciding between (a) and (b):** default to **(a) throw**. Only choose **(b)** when the same hook must work with or without a mounted provider. The two are mutually exclusive: (a) pairs with a `null` default, (b) pairs with an `undefined as any` default.

**Overloaded consumer (advanced):** when the hook should return either the whole context or a derived answer depending on args, use function overloads:

```tsx
export function useFoo(): FooContext
export function useFoo(request: FooRequest): boolean
export function useFoo(request?: FooRequest) {
  const context = useContext(FooContext)
  if (!context) throw new Error("useFoo must be used within a FooProvider")
  // ...derive from request or return context
}
```

## Naming Summary

| Piece | Name | Exported? | Touches context? |
|---|---|---|---|
| Data hook | `useFooData` | No | No — produces the value |
| Context type | `type FooContext` | Usually no | — |
| Context object | `const FooContext` | No | Is the context |
| Provider | `FooProvider` | Yes | Writes context |
| Consumer hook | `useFoo` | Yes | Reads context (guards here) |

## Hard Rules (do not violate)

1. Never hand-write the context type — always `ReturnType<typeof useFooData>`.
2. Never name the data hook `use*Context` / `use*DataContext`. It's `use*Data`.
3. Never put logic or guards in the provider component. It stays a 3-line wrapper.
4. The consumer hook guards access. Default is a `throw`; the only exception is the deliberate context-or-fallback pattern.
5. `throw` default pairs with `createContext<T | null>(null)`. Fallback pattern pairs with `createContext<T>(undefined as any)`. Never mix them.
6. Follow project conventions: named exports only, no default exports, named function declarations for components/providers, no prop destructuring in signatures, no `is`-prefixed booleans, minimal comments (explain WHY, e.g. the eslint-disable rationale).

## Full Reference Example (guarded, default)

```tsx
import type { PropsWithChildren } from "react"
import { createContext, useContext, useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@repo/mobile/lib/trpc"

function useFooData(fooId?: string) {
  const [selected, setSelected] = useState<string | undefined>(undefined)

  const fooQuery = useQuery(trpc.foo.getFoo.queryOptions({ id: fooId ?? "" }, { enabled: !!fooId }))
  const foo = useMemo(() => fooQuery.data, [fooQuery.data])

  return {
    // data
    fooId,
    foo,
    selected,
    // actions
    setSelected,
    // queries
    queries: { fooQuery },
    // miscellaneous
  }
}

type FooContext = ReturnType<typeof useFooData>
const FooContext = createContext<FooContext | null>(null)

export function FooProvider(props: PropsWithChildren<{ fooId?: string }>) {
  const data = useFooData(props.fooId)

  return <FooContext.Provider value={data}>{props.children}</FooContext.Provider>
}

export function useFoo() {
  const context = useContext(FooContext)
  if (!context) throw new Error("useFoo must be used within a FooProvider")
  return context
}
```
