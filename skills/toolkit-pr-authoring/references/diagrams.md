# Diagrams

A description carries no diagram by default. The user's request starts an assessment, and the assessment can answer no. The request is not the decision, because most changes hold no structure that a picture carries better than a sentence.

## Tests

Apply these tests in order. Stop at the first test that answers.

1. **The sentence test.** State the change in one sentence. When the reader loses nothing, use the sentence and no diagram. A diagram is not a summary of the pull request.
2. **The edge test.** Name the edges before you name the nodes. When the only edges read as _holds_, _contains_, or _was added to_, there is no relation to draw. Such a diagram shows a list of items in boxes, and a list belongs in the Tasks section.
3. **The change test.** At least one edge must have changed in this pull request. A diagram of unchanged structure documents the system, and this pull request did not change the system.
4. **The count test.** More than approximately 15 nodes means that the pull request is too large for one picture. Draw the one relation that carries the change, or draw nothing.

## Changes that fail

These need no assessment:

- A value change: a dependency version, a configuration key, an environment variable, a feature flag, or copy.
- A change in one place: a fix inside a function, a rename, or a formatting pass.
- An inventory: files added, endpoints added, or components added.
- A change to tests alone.

## Changes that pass, and the type that fits

The reason that a change needs a diagram also selects the type.

| What changed                                              | Type              |
| --------------------------------------------------------- | ----------------- |
| A sequence between two or more participants, or its order | `sequenceDiagram` |
| A branch or a decision point in a flow                    | `flowchart TD`    |
| A set of states and the transitions between them          | `stateDiagram-v2` |
| A structural relation between modules or types            | `classDiagram`    |

## Drawing

- Use Mermaid, in a fenced `mermaid` block.
- Show the changed relation. When the relation is not clear alone, add one step of unchanged context on each side.
- Label each node and each edge with a term that the description already uses.
- Put the diagram last.

## A declined diagram

Report the decline. Name what the diagram would have shown. Give the sentence that carries the same fact, and put that sentence in the description.

When the user asks a second time, draw the diagram. A repeated instruction is the user's decision, and you already reported the reason for the decline.
