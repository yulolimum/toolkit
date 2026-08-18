# Project name

Copy this file. Name it after the repository. Delete this line and write the rest. Remove any section that does not apply.

Give the skill what it cannot find on its own. Point at the repository docs. Do not copy them. A reference cannot remove a gate. A reference cannot change the bundle schema.

## Layout

Where things are. Key paths only. Enough to start the surface pass.

> | Path | Contents |
> |---|---|
> | `cli/` | Entry point, commands, shared code |
> | `docs/` | Project documentation |

## Governing docs

The docs that decide conventions. Give the order to read them. State that they win over this file.

> Read `docs/index.md` first. It is a registry. Read a listed document only when its description matches the work.
>
> Where it and this file disagree, it wins. Report the conflict.

## Output (research)

Where the bundle goes.

> ```
> ~/Documents/<project>/<slug>/
> ```

## Conventions that constrain a plan

Rules that permit or forbid work. State decisions, not descriptions.

> **pnpm owns the lockfile.** Never npm or yarn.
>
> **No build step.** The working copy is the version that runs. A unit that adds a build artifact contradicts this.

## Project gates (research)

Extra checks the bundle must pass. One row for each check. Write each one so someone can verify it. These run after the schema gates.

> | Gate | Check |
> |---|---|
> | pnpm only | No `verify` command calls npm or yarn |
> | Docs registry | A unit that adds or renames a doc updates `docs/index.md` in its criteria |

## Verification commands

The commands that go in a unit's `verify` array. Automated only. They run per unit, after that unit's code is complete. Note anything unusual about how they behave. Remove this section if the project has none.

> - everything: `pnpm validate`
> - typecheck only: `pnpm validate:typecheck`
>
> Validation rewrites files. A pass can leave a dirty tree. This is expected.

## Chunk verification

What proves a chunk works when static checks cannot. Name the tooling. Say how to start it. State plainly if this is off.

> Exercise the CLI against a sandboxed home: install, then update, then remove. Static checks cannot reach the lockfile.

## Branches

How to name a branch for each chunk. What each branch starts from.

> Name them `<user>/<chunk-id>`. Chunk 1 starts from the current tip. Each later chunk starts from the one before it.