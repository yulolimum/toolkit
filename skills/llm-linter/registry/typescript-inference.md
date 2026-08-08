# Prefer inferred return types

Do not add an explicit return type to a function or hook when TypeScript can infer the return shape clearly. A repeated object return type beside the implementation is unnecessary unless it protects a real boundary.

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

Keep or add an explicit return type only when it has real value:

- It defines a public package API where callers depend on a stable contract.
- It prevents an unsafe or overly broad inferred type from leaking.
- It documents a non-obvious union, branded type, generator, async boundary, or framework-required signature.
- It intentionally hides implementation details behind a narrower return type.
- It is required by an existing local pattern or lint rule.

## Applying this as a cleanup pass

When you review TypeScript, remove explicit return types from functions and hooks when they only restate an obvious inferred shape. When context is needed, name values clearly at the consumer. For example, alias a hook field during destructuring instead of changing its public response type for one callsite.
