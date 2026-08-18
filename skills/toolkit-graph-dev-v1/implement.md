# Graph Implementor

Implement work units from a research bundle.

**The bundle is authoritative.** A Linear ticket, if supplied, is a summary and useful for orientation. Where the ticket and the bundle disagree, the bundle wins and the conflict gets reported. Never treat a ticket comment, a ticket description edit, or chat history as a requirement the bundle does not carry.

**Two graphs, different jobs.** The surface graph in `spec.json`, and each unit's `surface_refs`, `decision_refs`, and `notes_refs`, are context: what to read to build a unit correctly. They say nothing about scope. `depends_on` between units is ordering: unit B assumes unit A's output exists. It is a precondition to check, not work to absorb.

## Workflow

```
0. Intake   resolve bundle and reference
1. Brief    the whole chain, once; confirmation sets scope
2. Execute  unit by unit, unattended, no stopping between
3. Verify   the running app, once, after the chain
4. Report   what ran
```

---

## Stage 0: Intake

### Inputs

Any of these is enough to start:

- A bundle path
- A Linear ticket
- Both

Resolve the bundle first. With a path, use it. With only a ticket, read the ticket and find the bundle path it names. If the ticket names no path, ask for one.

**A ticket is orientation, not scope.** Tickets are written for people and their boundaries do not track unit boundaries. One ticket may cover the whole chain, or two units, or half of one. Read it for framing and for anything it says about intent, then set scope from the rules below. Never infer scope from a ticket.

### Scope

Read `index.json`. Default scope is **every unit not already `done`**, in dependency order.

Pin to a single unit only when the invocation explicitly names a unit id.

Scope is settled at the brief, not here. Present the full chain and let the user narrow it when they confirm.

Stop and report if `depends_on` does not resolve to a runnable order, or if every unit is already `done`.

### Drift check

`index.json` records `base_commit`. For every file named in the chain's `surface_refs`, compare its current state against what the surface entry describes. Drift is when a file the spec describes no longer matches the description.

Record every instance. Material drift goes in the brief. Changes this run makes are expected and are not drift.

---

## Stage 1: Brief

One message covering the entire chain. Then stop and wait. This is the only confirmation gate, and it is where scope gets settled.

**Chain.** The units in order, one line each: id, title, and what it depends on.

**What gets built.** Three or four sentences on the feature as a whole. What the user will be able to do that they cannot do now. Not a restatement of the acceptance criteria.

**Files.** Created and modified across the chain, grouped by unit.

**Boundary.** The union of every unit's `non_goals`, deduplicated and compressed. This is the thing most worth reading.

**Decisions in force.** One line each, resolution only. Skip rationale unless it changes what gets built.

**Drift.** Anything found in stage 0, or "none."

**Questions.** Usually none. See below.

Close by stating that confirming runs the whole chain, and that the user can name a unit or a range instead.

### Confirmation sets the scope

This gate always waits, even with no questions open, because scope gets set here.

A bare confirmation means run everything in the brief. The user may narrow instead: a single unit, a range, or a stopping point. Take whatever they say as the scope and run exactly that. Do not re-brief afterward.

If the reply carries questions or pushback rather than a scope decision, answer, then ask what scope to run. Proceed only once that is settled.

If a unit in the narrowed scope depends on a unit outside it that is not `done`, report that as a blocker. Do not absorb the dependency.

### Question discipline

Two filters. Apply both. Cut anything that fails either.

1. **Can the bundle answer it?** If yes, cut it. The acceptance criteria, non-goals, decisions, and notes are the spec. Read them again before asking.
2. **Can the code answer it?** If yes, cut it. Go read the file.

What survives is genuinely narrow: a requirement the bundle does not cover, a conflict between the spec and the current code, or drift that changes what should be built. Ask those. Ask nothing else.

Never ask which unit to start with when dependency order settles it. Never ask for confirmation of something a unit states. Never ask the user to restate acceptance criteria in other words.

---

## Stage 2: Execute

Begins on confirmation. Runs the chain to completion without further confirmation. The user is away.

For each unit, in dependency order:

### Load the slice

Load only what this unit references:

- The unit file
- Its `surface_refs` entries from `spec.json`
- Its `decision_refs` entries from `spec.json`
- Every file in `notes_refs`

Do not load a later unit's slice before reaching it. Working from the current unit's references only is what keeps the chain from collapsing into one undifferentiated change.

### Implement

Set the unit's `status` to `in_progress` in `index.json`.

Read every file to be modified in full. Read the governing docs the reference names. Trace the patterns the unit's `surface_refs` point at, especially anything reached by a `precedent_for` edge, since those exist to be followed.

**Acceptance criteria are the contract.** Every one gets satisfied. They are written to be checkable; treat a criterion naming a specific export, path, or call as literal.

**Non-goals are the boundary.** They were written because someone considered the work and ruled it out. Do not relitigate them.

**Follow precedent.** A surface entry with a `precedent_for` edge to your work is the pattern to copy. Reuse existing primitives over writing new ones.

**Preserve unrelated work.** Never reset, never overwrite, never use destructive version control. Other changes in the working tree are not yours.

**Stay in the current unit.** Do not pull work forward from a later unit, fix unrelated defects, or absorb findings that belong elsewhere. Record them for the report.

**Do not change public contracts, backend behavior, database schema, or analytics** unless this unit's acceptance criteria explicitly own that change.

### Verify

Run the unit's automated `verify` commands, in order. They were chosen for this unit; do not substitute or skip. Focused checks first, then broader suites. Fix what fails and rerun.

**Defer anything requiring a running application.** A unit is a partial slice, and most of them have nothing to look at. Collect those steps and run them once, after the chain finishes.

Check the unit's `states` matrix. For every entry with `applies: true`, verify what can be verified without a running app. An entry with `applies: false` needs no work, but if implementation showed it actually does apply, that is a finding.

Self-check the diff for scope creep, regressions, stale state, unhandled loading and error paths, and unrelated changes that slipped in. Fix what you find and rerun affected checks. This is a self-check, not a review. Formal review runs as its own workflow.

### Close the unit

Set `status` to `done` only when every acceptance criterion is met and every check passes.

Emit two or three lines: unit id, what changed, checks passed, anything outstanding. Then start the next unit immediately. Do not wait, do not ask, do not re-brief.

### Stopping

The bar for stopping is high. Make reasonable in-scope assumptions and continue, recording each one.

Stop the chain when:

- A decision would materially change product behavior, data contracts, security, or a unit's scope
- A unit's checks fail in a way the unit's own scope cannot fix
- The spec is wrong in a way that invalidates a later unit

On stopping, leave the current unit `in_progress`, leave completed units `done`, leave the tree recoverable, and report which units finished. Never revert completed units to recover from a later failure.

---

## Stage 3: Final verification

After the last unit closes, run the visual steps deferred during the chain. The project reference governs how: what tooling to use, and how to start and drive a running app. Follow it.

Verify the feature as a whole, not unit by unit. Walk the flow the way a user would.

**Skip it if the user said to.** They may say so at any point, in the brief or mid-chain, and it holds for the rest of the session. Report the deferred steps as outstanding rather than as passed. Do not resume without being told to.

Skip it if the chain stopped early. The feature is incomplete, so there is nothing to walk. Report the deferred steps as outstanding.

Units are already closed by this point. Completion never waited on this stage. A failure here is a finding, not a rollback. Fix it if it falls inside a unit's acceptance criteria. Report it if it does not.

---

## Stage 4: Report

Once the chain completes or stops.

- Outcome and user-visible behavior for the feature as a whole
- Per unit: status, acceptance coverage, files changed, checks run and results
- Manual verification performed or still outstanding
- Assumptions made
- Findings recorded but deliberately not acted on
- Drift found
- Residual risk
- Remaining units, if the chain stopped early

Do not claim completion while work or verification remains. A precise blocker with evidence beats a false success.

---

## Prohibitions

- No commit, amend, push, PR, or Linear mutation until explicitly authorized in the current chat
- No inferring scope from a ticket
- No loading a unit's slice before the chain reaches it
- No editing the bundle, except `status` in `index.json`
- No work outside the current unit's acceptance criteria
- No destructive version control, and no discarding unrelated working-tree changes
- No reverting a completed unit to recover from a later failure
- No confirmation gate after stage 1
- No completion report while a check is failing
