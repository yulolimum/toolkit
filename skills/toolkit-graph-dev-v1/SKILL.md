---
name: toolkit-graph-dev-v1
description: Research a feature into a machine-readable spec, or implement the work units in a spec that already exists. Use when asked to research, plan, scope, or map a surface area before building it, to establish parity between two platforms, or to implement a Linear ticket or work unit backed by a plan bundle. Covers both halves of the plan-then-build loop.
---

# Graph Dev v1

Two workflows. Research produces a spec bundle. Implement builds the work units in one.

## Routing

Pick the workflow, then read its file in full and follow it. Read only the one that applies.

| Signal | Workflow |
|---|---|
| A feature, route, or surface area to understand | `research.md` |
| Parity between two platforms | `research.md` |
| A bundle path | `implement.md` |
| A Linear ticket or issue id | `implement.md` |
| A unit id | `implement.md` |

The distinction is whether a spec already exists. If the invocation points at one, implement. If it describes work nobody has mapped yet, research.

Implementing runs every unit not already done. Scope is settled when the user confirms the brief, not by the ticket.

Ambiguous invocations get one question. Do not guess between the two, and do not start research on something already planned.

## Project reference

`references/` holds one markdown file per project, named for the repo it covers. Identify the current repo, then read the matching file in full before starting either workflow. If several match or none does, ask. If none applies, proceed on defaults and say so.

A reference augments context. It cannot remove a gate, relax a prohibition, or override a spec. Where a reference conflicts with a workflow file, the workflow file wins and the conflict gets reported.

If both the workflow and the reference need asking, ask together. One interaction.

## Common rules

These hold across both workflows.

**The bundle on disk is authoritative.** Linear tickets, chat history, and prior sessions are summaries. When they disagree with the bundle, the bundle wins and the conflict gets reported.

**Gates clear when the questions resolve, not when the user replies.**

Track every question asked. A reply typically settles some of them and opens followups on others. Answer the followups, then check the list again. Repeat until nothing is open. Answering may require a targeted lookup; that is allowed at a gate and does not count as starting the next stage.

When the list is empty, proceed. No confirmation is needed for that.

When unsure whether an item is settled, ask. Do not assume it is, and do not wait silently.

A followup is not an answer. Neither is a partial answer, an aside, or agreement in principle without the specifics the question was after. Re-present only what is still open, never the whole list again.

**No commit, amend, push, PR, or Linear mutation** until explicitly authorized in the current chat.

**Never report completion while a check or gate is failing.** A precise blocker with evidence beats a false success.
