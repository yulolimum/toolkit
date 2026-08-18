---
name: toolkit-graph-dev-v2
description: Research a feature into a machine-readable spec, implement the work units in a spec that already exists, or refine a spec after some of it is built. Use when asked to research, plan, scope, or map a surface area before building it, to establish parity between two platforms, to implement work units backed by a plan bundle, or to change what was planned once you have seen the result. Covers the whole plan, build, and revise loop.
---

# Graph Dev

Three workflows. Research produces a spec bundle. Implement builds it, one chunk at a time. Refine changes what a built bundle says should exist.

All three read `schema.md`, which defines the bundle. Read it before the workflow file.

## Routing

Pick the workflow, then read `schema.md` and that workflow's file, both in full. Read only the one workflow file that applies.

| Signal | Workflow |
|---|---|
| A feature, route, or surface area to understand | `research.md` |
| Parity between two platforms | `research.md` |
| A bundle path, a unit id, or a pointer to planned work | `implement.md` |
| Dissatisfaction with something already built | `refine.md` |

Two questions settle it. Does a spec exist? If not, research. Is the complaint that the spec itself is now wrong? If so, refine. Otherwise implement.

Implementing runs every chunk not already complete. Scope is settled when the user confirms the brief.

Ambiguous invocations get one question. Do not guess, and do not start research on something already planned.

## Project reference

`references/` holds one markdown file per project, named for the repo it covers. Identify the current repo, then read the matching file in full before starting any workflow. If several match or none does, ask. If none applies, proceed on defaults and say so.

A reference augments context. It cannot remove a gate, relax a prohibition, or override a spec. Where a reference conflicts with a workflow file, the workflow file wins and the conflict gets reported.

If both the workflow and the reference need asking, ask together. One interaction.

## Common rules

These hold across all three workflows.

**The bundle on disk is authoritative.** Anything else the user supplies is context, not requirement. Where it disagrees with the bundle, the bundle wins and the conflict gets reported.

**Gates clear when the questions resolve, not when the user replies.**

Track every question asked. A reply typically settles some of them and opens followups on others. Answer the followups, then check the list again. Repeat until nothing is open. Answering may require a targeted lookup; that is allowed at a gate and does not count as starting the next stage.

When the list is empty, proceed. No confirmation is needed for that.

When unsure whether an item is settled, ask. Do not assume it is, and do not wait silently.

A followup is not an answer. Neither is a partial answer, an aside, or agreement in principle without the specifics the question was after. Re-present only what is still open, never the whole list again.

**No push, PR, or external-system mutation** until explicitly authorized in the current chat.

**Never report completion while a check or gate is failing.** A precise blocker with evidence beats a false success.
