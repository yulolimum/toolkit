# Code comment conventions

The default state of code is **no comments**. Comments are a cost, not a virtue. Most comments agents leave restate what the code plainly says and must be removed.

## Remove comments that restate the code

Delete any comment that a competent reader would already understand from the code itself. The code is self-documenting; the comment adds nothing. These are noise and must go.

Bad (delete these):

```ts
// Filter through the data
const active = users.filter((u) => u.isActive)

// Loop over items
for (const item of items) { ... }

// Set the count to zero
let count = 0

// Return the result
return result
```

If removing the comment loses no information, remove it. Do not write comments for the LLM's benefit; the LLM can figure it out. Comments exist only for a **human** who would otherwise be confused.

## Keep comments that explain what the code cannot

Keep (or add) a comment only when it captures something not recoverable from the code: a non-obvious _why_, a workaround, a subtle edge case, a constraint, a gotcha, or intent that the implementation alone doesn't reveal.

Good (keep these):

```ts
// Stripe rounds half-to-even, so we match that here to avoid reconciliation drift
const cents = bankersRound(amount * 100)

// Safari fires resize before layout settles; defer one frame or we read stale dimensions
requestAnimationFrame(measure)

// Upstream API caps page size at 100 despite documenting 500
const pageSize = 100
```

The test: if a comment explains _why_ or warns of something surprising, keep it. If it explains _what_ the code already shows, delete it.

## Inline comments

Use `//` for inline comments in JavaScript/TypeScript. Keep them short and place them where the surprise lives.

## Documentation comments

When documenting a function, component, hook, or exported declaration, use **TSDoc/JSDoc** block style (`/** ... */`) so the docs surface on hover in VS Code.

- Lead with a concise description of what it does and why you'd reach for it.
- It is fine to omit `@param`/`@returns` and other tags when the types and names already make them obvious. Do not pad the block with redundant tags just to fill it out.
- Add tags only when they carry real information (a non-obvious parameter meaning, units, side effects, a thrown error, an example).

```ts
/**
 * Debounces a value, deferring updates until input settles.
 * Useful for search fields where you don't want to query on every keystroke.
 */
function useDebouncedValue<T>(value: T, delayMs: number) { ... }
```

## Applying this as a cleanup pass

When run over existing code, strip every self-explanatory comment, keep the genuinely necessary ones, and convert function/component documentation to TSDoc style where it isn't already.
