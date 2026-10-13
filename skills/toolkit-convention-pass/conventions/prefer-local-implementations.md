# Prefer local implementations

When you clean up or refactor code, use the simplest implementation that a reader can follow.

- Keep simple logic in place when it occurs one time and a reader can understand it in context.
- Do not extract a helper only to give a name to simple formatting, mapping, conditions, or list rendering.
- Extract a helper when it makes real complexity clear, when it isolates one responsibility, or when it has meaningful reuse.
- When a helper that occurs one time makes the code clearer, keep it in the same file, near its consumer.
- Create a new file only when reuse, responsibility, size, tests, or an established local pattern justifies the cost to navigate to it.
- Do not divide a component only to make it shorter. Count the added props, the prop drilling, and the interrupted reading flow.
- When each option is clear, use this order: code in place, then a colocated abstraction, then a separate file.
- Follow comparable code nearby when it shows an established pattern that fits.
- Do not rewrite working code only to remove every abstraction. This is a preference, not a strict rule.
- Ask the user for direction when the reasonable choices stay unclear.

Answer these questions before you extract code:

1. Can a reader understand the code from top to bottom without the extraction?
2. Does the abstraction have meaningful reuse or an independent responsibility?
3. Does the extraction remove more complexity than the navigation, the API, and the prop costs that it adds?
