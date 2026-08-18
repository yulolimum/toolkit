# toolkit-graph-dev-v2

Research, implement, and refine a durable plan bundle.

## Overview

- Research creates a specification from a feature objective.
- Implementation builds the specification in reviewable chunks.
- Refinement updates the plan after implementation reveals a needed change.

## What to expect

Research proposes chunks after decisions are resolved. Implementation can use stacked branches and one subagent per chunk.

## How to use

Give an agent a feature objective to research. Give it a bundle path or unit ID to implement. Describe built work to refine.

## Project references

Store project-specific references in `references/`. This repository ignores them. Keep only reusable templates in version control.

## Files

| File | Function |
|---|---|
| `SKILL.md` | Selects the workflow. Loads the reference. Holds the common rules. |
| `schema.md` | Defines the bundle. All three workflows read it. |
| `research.md` | The research workflow. |
| `implement.md` | The implement workflow. |
| `refine.md` | The refine workflow. |
| `references/` | One file for each project. |

The skill reads `schema.md` and one workflow file, not all of them.

## Selection

The skill selects research if no specification exists.

The skill selects refine if you do not like something that is already built. Refine changes the specification.

The skill selects implement in every other case.

The skill asks if the request is not clear. It does not guess.

## References

`references/` holds one file for each project. Each file has the name of its repository.

The skill finds the current repository. Then it reads the matching file.

A reference gives project data: the layout, the test commands, the branch names, the local rules. A reference cannot remove a gate or change the bundle format.

## Units and chunks

A unit is one job. It is small enough for one agent to build and check in one pass.

A chunk is a group of units. It is large enough for a person to review as one body of work.

These two sizes conflict. A hook, a route, and a screen are three good units. Together they are one good chunk. Alone, each is a bad chunk.

Chunks are sequential. Each chunk needs the chunk before it.

## Research

**Stage 0. Intake.** The skill asks for the objective if the request is not clear. It asks for nothing else.

**Stage 1. Surface pass.** Fast. Finds names. Does not examine behavior. Sends the target, the excluded areas, an inventory, and the questions. The questions are about scope and intent. This stage is a gate.

**Stage 2. Deep research.** Slow. You do not need to stay at the computer. The skill asks nothing. It records assumptions and continues. It writes to disk as it works. This stage finds the units. It does not group them.

**Stage 3. Finalization.** The skill sends the results, the risks, and the decisions. You resolve the decisions.

The skill then proposes the chunks. It does not ask how many. You accept the proposal, or you give a steer. A steer is enough: "two chunks, list work and detail work." The skill redraws and proposes again.

The skill then adds units for work that connects one chunk to the next. Last, it runs the checks and completes the bundle.

## Implement

This workflow orchestrates. It starts one subagent for each chunk. The subagents write the code.

**Stage 0. Intake.** Finds the bundle. Reads the index and the build records. Compares the code against the specification.

**Stage 1. Brief.** Describes the chunks, the branches, and the boundary. Always stops. You set the scope here: all chunks, a range, or one unit.

**Stage 2. Orchestrate.** For each chunk, in order:

1. Create the chunk branch. Each branch starts from the branch before it.
2. Start a subagent. Give it that chunk's units only.
3. Wait for the subagent.
4. Verify the chunk.
5. Report and continue.

The subagent builds one unit at a time. For each unit it reads that unit's data only, writes the code, runs the automated checks, commits, writes a build record, and marks the unit complete.

Checks that need a running application wait for the end of the chunk.

A serious problem stops the run. Completed units stay complete.

**Stage 3. Report.** The result, the branches, the checks, the assumptions, the remaining risks.

## Change requests

Ask for a change at any time. The skill sends the request to the subagent that owns that chunk.

That subagent changes the code and commits again. Then each later chunk rebases and adapts, in order.

A later chunk can fail to accept the change. The skill stops there and reports. It does not redesign a later chunk without telling you.

A new session has no live subagents. The skill reads the build records. Then it starts a new subagent for that chunk.

A change request does not change the specification. Use refine for that.

## Refine

Refine adds units. It does not edit or delete the units that came before. Those units are the record of what was built.

**Stage 0. Intake.** The complaint and the bundle path.

**Stage 1. Assess.** Read-only. The skill reads the bundle, the build records, and the code. It reports the current state, what it would add, which chunks are affected, and what the rebase will cost. This stage is a gate.

**Stage 2. Draft.** The skill adds a unit for each change. Each unit names the unit it refines. Each unit goes last in that unit's chunk. The skill also updates what that chunk covers.

**Stage 3. Finalize.** The skill runs the checks. It then names the earliest chunk that implement must start from.

A refinement unit states its acceptance criteria in full. It does not describe a change to another unit. The agent that builds it sees only its own data.

The chunk with the new unit is no longer complete. Implement then rebuilds that chunk and rebases the chunks after it. This is the normal implement run. No special command is needed.

## Gates

A gate is a point where the skill stops and asks.

You answer some questions. You can ask other questions. The skill answers yours. Then it asks again about the open items. This continues until nothing is open.

The skill then continues. It does not need your permission. It asks if it is not sure an item is closed.

The brief in the implement workflow is different. That gate always stops, because you set the scope there.

## The bundle

| File | Contents |
|---|---|
| `index.json` | The objective, the constraints, the units, the chunks. |
| `spec.json` | The surface map and the decisions. |
| `units/*.json` | One file for each unit. Research writes these. |
| `built/*.json` | One file for each finished unit. Implement writes these. |
| `notes/` | Data that JSON cannot hold. |

### Three structures

The surface graph shows what exists. It is context. It does not control the scope.

Unit order shows which unit needs another unit first. It is a condition to check. It does not add work.

Chunks group the units for review. Their order is their dependency.

### Records

Each unit has a status: `pending`, `in_progress`, or `done`. The implement workflow sets it.

Each finished unit has a build record in `built/`. The record holds the branch, the commits, the changed files, the assumptions, any criterion that was not possible as written, and any place the specification itself was wrong.

Building reveals things research cannot. The skill makes the judgment call and records the correction. Refine reads these records and can add units that bring the specification back in line.

A new session reads these records to continue the work.

## Limits

The skill does not write code during research.

The skill does not push or open a pull request without permission.

The skill does not change external systems.

The skill does not report success if a check fails.
