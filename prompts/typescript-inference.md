# Prefer inferred return types

Do not add explicit return types to functions or hooks when TypeScript already infers the return shape clearly. A repeated object return type beside the implementation is noise unless it protects a real boundary.

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

## When explicit return types are justified

Keep or add an explicit return type only when it carries real value:

- It defines a public package API where callers depend on a stable contract.
- It prevents an unsafe or overly broad inferred type from leaking.
- It documents a non-obvious union, branded type, generator, async boundary, or
  framework-required signature.
- It intentionally hides implementation details behind a narrower return type.
- It is required by an existing local pattern or lint rule.

## Applying this as a cleanup pass

When reviewing TypeScript, remove explicit function and hook return types that only restate an obvious inferred shape. Prefer naming values clearly at the consumer when context is needed, such as aliasing a hook field during destructuring, instead of changing the hook's public response type for one callsite.
