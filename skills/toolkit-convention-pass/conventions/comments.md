# Code comments

Do not add a comment by default. Each comment has a maintenance cost. Remove a comment that only repeats behavior that the code makes clear.

A language model comments far more than a developer does. It explains each step, and it writes a documentation block for a function that needs none. This convention exists to remove that habit, so it starts from removal and not from improvement.

One question decides every comment: does it explain something that a senior engineer reads wrong without it? If yes, the comment stays. If no, the comment goes.

## Remove a comment that repeats the code

Delete each comment that a senior engineer gets from the code itself. The code shows the behavior, the comment adds nothing, and the reader must still read both.

Bad, delete each of these:

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

When the removal of a comment loses no information, remove it. Do not write a comment to help an LLM, because an LLM reads the code. Write a comment only for a **human** who is confused without it.

## Keep a comment that gives what the code cannot

Keep or add a comment only when it gives information that the code cannot show:

- A reason that the reader cannot infer.
- A workaround.
- A subtle edge case.
- A constraint.
- A trap.
- An intent that the implementation hides.

Good, keep each of these:

```ts
// Stripe rounds half-to-even, so we match that here to avoid reconciliation drift
const cents = bankersRound(amount * 100)

// Safari fires resize before layout settles; defer one frame or we read stale dimensions
requestAnimationFrame(measure)

// Upstream API caps page size at 100 despite documenting 500
const pageSize = 100
```

Use this test. Keep a comment that gives a reason or warns about a surprise. Delete a comment that gives what the code already shows.

## Which form the comment takes

Answer the survival question first. Only then choose the form. The form never decides survival.

A `/** */` block exists to feed the tooltip that an editor shows at a call site. That tooltip is the whole reason to prefer the block, so the block earns its place only where a call site can see it. Use it for a symbol that other code reaches, such as an exported function, a component, or a hook, and write documentation for the symbol: what it does, and when to use it.

Use `//` everywhere else. A helper inside a component body, a closure, and a local that no other module reaches each take `//`, because no tooltip renders for any of them. Such a comment is not worth less. It has no tooltip to feed. Keep it short, and put it where the surprising behavior occurs.

## Documentation comments

- Start with a short description of what the symbol does and when to use it.
- Omit `@param`, `@returns`, and each other tag when the types and the names make them clear. Do not add a tag that repeats them.
- Add a tag only when it gives useful information: the meaning of a parameter that the reader cannot infer, a unit, a side effect, a thrown error, or an example.

```ts
/**
 * Debounces a value, deferring updates until input settles.
 * Useful for search fields where you don't want to query on every keystroke.
 */
function useDebouncedValue<T>(value: T, delayMs: number) { ... }
```

## Form never justifies existence

Never change the form of a comment to justify keeping it. A comment that reads as noise in `//` is the same noise in `/** */`, and the block only carries it past the pass.

Watch for this in yourself. A weak comment looks more legitimate as documentation, so a block is the natural place to reach when the survival question has a bad answer. When you reach for `/** */` to make a weak comment look official, delete the comment instead.

The reverse is not a rule. A comment that survives on its own merit takes the form that its call sites decide, and a change of form is correct there.

## Apply this as a cleanup pass

For code that exists, remove each comment that explains itself, and keep each comment that gives needed information.

Answer the survival question for every comment before you consider the form of any comment. Then give each comment that survives the form that the previous section decides.
