# Prefer inferred return types

Do not add an explicit return type to a function or a hook when TypeScript infers the return shape clearly. An object return type beside the implementation repeats that implementation. Write one only when it protects a real boundary.

Bad:

```ts
export function useDefaultService(): Readonly<{
  service: Service
  isResolving: boolean
}> {
  return {
    service,
    isResolving,
  }
}
```

Good:

```ts
export function useDefaultService() {
  return {
    service,
    isResolving,
  }
}
```

## When an explicit return type is correct

Keep or add an explicit return type only when it has real value:

- It gives the public API of a package, and callers depend on a stable contract.
- It prevents an unsafe or too broad inferred type from leaking.
- It records a union, a branded type, a generator, an async boundary, or a signature that a framework requires. The reader cannot see that fact otherwise.
- It hides implementation detail behind a narrower return type, and it does so deliberately.
- An established local pattern or a lint rule requires it.

## Apply this as a cleanup pass

When you review TypeScript, remove an explicit return type that only repeats an obvious inferred shape.

When the consumer needs context, give the value a clear name at the consumer. Rename a field of a hook while you destructure it, and do not change the public return type of the hook for one call site.
