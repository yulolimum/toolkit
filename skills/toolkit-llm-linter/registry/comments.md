# Code comment conventions

By default, do not add comments. Comments add maintenance cost. Remove comments that only restate behavior the code makes clear.

One question decides every comment: does it explain something a human would otherwise misread? If yes it stays. If no it goes.

## Remove comments that restate the code

Delete any comment that a competent reader can understand from the code itself. The code shows the behavior. The comment adds no information. It is noise. Remove it.

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

If removing a comment loses no information, remove it. Do not write comments to help an LLM; it can infer the code. Write comments only for a **human** who would otherwise be confused.

## Keep comments that explain what the code cannot

Keep or add a comment only when it gives information that the code cannot show: a non-obvious _why_, a workaround, a subtle edge case, a constraint, a gotcha, or intent that the implementation does not reveal.

Good (keep these):

```ts
// Stripe rounds half-to-even, so we match that here to avoid reconciliation drift
const cents = bankersRound(amount * 100)

// Safari fires resize before layout settles; defer one frame or we read stale dimensions
requestAnimationFrame(measure)

// Upstream API caps page size at 100 despite documenting 500
const pageSize = 100
```

Use this test: keep a comment if it explains _why_ or warns about something surprising. Delete it if it explains _what_ the code already shows.

## Inline comments

Use `//` for inline comments in JavaScript/TypeScript. Keep them short. Put them where the surprising behavior occurs.

## Documentation comments

For a function, component, hook, or exported declaration, use **TSDoc/JSDoc** block style (`/** ... */`). This lets VS Code show the documentation on hover.

- Start with a concise description of what it does and when to use it.
- Omit `@param`, `@returns`, and other tags when the types and names already make them clear. Do not add redundant tags only to fill the block.
- Add tags only when they give useful information: a non-obvious parameter meaning, units, side effects, a thrown error, or an example.

```ts
/**
 * Debounces a value, deferring updates until input settles.
 * Useful for search fields where you don't want to query on every keystroke.
 */
function useDebouncedValue<T>(value: T, delayMs: number) { ... }
```

## Form never justifies existence

`//` is for inline comments. `/** */` is for TSDoc on a declaration, where the editor surfaces it on hover. Pick the form from what the comment attaches to, never from wanting to keep the text.

Do not promote a `//` comment to `/** */` during a cleanup pass. A comment that cannot survive as `//` is a comment to delete, and dressing it as documentation only launders it past the pass. Do not wrap a non-exported local in a block comment to give it the same cover.

## Applying this as a cleanup pass

For existing code, remove every self-explanatory comment. Keep comments that give needed information. Decide whether a comment survives before considering its form; only then, if a surviving comment documents an exported declaration, write it as TSDoc.
