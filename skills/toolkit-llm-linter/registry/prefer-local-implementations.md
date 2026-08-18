# Prefer local implementations

When you clean up or refactor code, prefer the simplest readable implementation.

- Keep simple logic used one time inline when a reader can understand it in context.
- Do not extract a helper only to name simple formatting, mapping, conditions, or list-rendering logic.
- Extract a helper when it clarifies real complexity, isolates a clear responsibility, or has meaningful reuse.
- If a helper used one time improves clarity, keep it in the same file near its consumer.
- Create a new file only when reuse, responsibility, size, testing, or established local patterns justify the cost of navigating to it.
- Do not split a component only to make it shorter. Consider the added props, prop drilling, and interrupted reading flow.
- If each option is clear, use this order: inline code, colocated abstraction, then a separate file.
- Follow comparable nearby code when it shows an established, suitable pattern.
- Do not rewrite working code only to inline every abstraction. This is a preference, not a strict rule.
- Ask for direction when reasonable choices remain unclear.

Before extracting code, consider these questions:

1. Can a reader understand the code from top to bottom without the extraction?
2. Does the abstraction have meaningful reuse or an independent responsibility?
3. Does the extraction reduce complexity more than it adds navigation, API, or prop costs?
