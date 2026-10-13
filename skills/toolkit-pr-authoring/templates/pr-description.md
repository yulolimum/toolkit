# PR description outline

This file states the shape of the description and the rules for each section. This file is not output. Emit the sections below. Do not emit this file.

## Shape

```markdown
## Overview

[One short paragraph.]

## Tasks

- [Action verb] [High-level change]
  - [Sub-item, for a change with a large scope]

## Notes

- **[Topic]**: [One sentence of reviewer context, risk, or required action]

## Proofs

[Table. See references/proofs.md.]

## Diagram

[Mermaid block. See references/diagrams.md.]
```

Overview and Tasks always appear. Notes appears when a reviewer needs context. Proofs appears when the run has proof targets. Diagram appears only when the user asks for one and the change passes the tests.

## Overview

- Write one paragraph of prose, usually one to three sentences. Do not write bullets.
- State the outcome that the branch creates, at the highest useful level.
- Write for a teammate or a project manager who reads no code.
- Carry no code reference: no file path, no function name, no endpoint, no component name, no command, no branch name, and no test detail.
- For internal work, state the operational or workflow outcome.

## Tasks

- Start each item with an action verb: Add, Update, Fix, Remove, Refactor, Migrate, or Deprecate.
- Keep each item at the level of a feature or a module. Aim for five to ten items.
- Group related changes. Indent a sub-item only when one change has a large scope.
- Write a changelog. Do not write an inventory of the implementation.
  - Bad: `Add the pricing client with 17 endpoints (status, teams, events, markets, and more)`
  - Good: `Add the pricing client`
- Name a function, a file, or an endpoint only when that name is the user-facing feature.
- Put a code reference in Notes only when the reference changes what the reviewer does.

## Notes

Notes is optional. When the Tasks and the diff leave nothing to explain, omit the section.

Include an item only when it changes what a reviewer understands or does:

- a breaking change
- a required migration
- a configuration need, such as an environment variable or a configuration file
- a new dependency
- a manual step or a workflow change
- a behavior change, a risk, or a rollout limit that the diff does not show
- a performance result that affects use
- a security consideration

Write each item as a bold topic and one sentence. Common topics are Breaking Change, Migration Required, Configuration, Dependencies, Performance, Security, and Testing.

Do not add an item because a fact is true. Omit a fact that the Tasks already carry and that needs no action.

Do not describe the implementation, because a reviewer reads the code.

- Bad: `**Architecture**: Uses a result type of { ok: true, data } or { ok: false, error }.`
- Bad: `**Code structure**: Separates concerns into modules.`

Add a testing item only when testing changes the reviewer's work:

- a required check could not run
- a check is partial or unreliable
- a risky area has no practical automated coverage
- a manual check is necessary before the merge

When every requested check passed, omit the testing item.

## Proofs

- Put Proofs after Tasks, or after Notes when Notes appears.
- [references/proofs.md](../references/proofs.md) holds the table form and the placeholder rules.

## Diagram

- Put Diagram last.
- [references/diagrams.md](../references/diagrams.md) holds the tests and the drawing rules.
