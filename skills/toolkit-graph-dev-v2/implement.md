# Graph Implementor

`schema.md` defines the bundle this workflow reads. Read it first.

Build the chunks in a research bundle. This workflow orchestrates: it spawns a subagent per chunk and owns the sequence, the branches, and the conversation. Subagents write the code.

**The bundle is authoritative.** The user may supply other material alongside it. That material is context: read it for framing and intent, then work from the bundle. Where the two disagree, the bundle wins and the conflict gets reported. Nothing outside the bundle is a requirement, however it arrived.

**Three structures, different jobs.** The surface graph in `spec.json`, and each unit's `surface_refs`, `decision_refs`, and `notes_refs`, are context: what to read to build a unit correctly. `depends_on` between units is ordering: unit B assumes unit A's output exists. `chunks` groups units into reviewable bodies of work, in order, each assuming the one before it is complete.

## Workflow

```
0. Intake       resolve the bundle and the reference
1. Brief        the chunks, once; confirmation sets scope
2. Orchestrate  chunk by chunk, each in its own subagent
3. Report       what ran
```

Chunk agents stay addressable after their chunk finishes. Refer to "Change requests" below.

---

## Stage 0: Intake

### Inputs

A bundle path is enough to start. Ask for one if the invocation does not give it or point at it.

**Supplied material does not set scope.** Whatever else arrives with the request was written for people, and its boundaries do not track chunk or unit boundaries. Set scope from the rules below instead.

### Read the bundle

Read `index.json`. It carries the units in dependency order and the chunks that group them. Every bundle has at least one chunk.

A unit with a `refines` field changes what an earlier unit built. Build it from its own criteria; the refined unit's criteria are a record, not a requirement.

Read `built/` if it exists. It records what a previous session did: which units are complete, on which branches, at which commits, and what was assumed while building them. This is how a new session resumes a stack it did not create.

### Drift

`base_commit` in `index.json` says which tree the surface map was read from. It will be old. That is normal and is not a blocker.

Compare the files named in the chain's `surface_refs` against what the surface entries describe. Drift is when a file the spec describes no longer matches the description. Record every instance; material drift goes in the brief. Code that simply moved is not drift, and neither are changes an earlier chunk made.

---

## Stage 1: Brief

One message. Then stop. This is the only gate that always waits, because scope gets set here.

**Chunks.** Each one in order: id, `covers`, its units, and what it leaves unfinished.

**What gets built.** Three or four sentences on the feature as a whole. What the user will be able to do that they cannot do now.

**Boundary.** The union of every unit's `non_goals`, deduplicated and compressed. This is the thing most worth reading.

**Decisions in force.** One line each, resolution only. Skip rationale unless it changes what gets built.

**Branches.** The branch each chunk will get, and what it stacks on.

**Drift.** Anything found in stage 0, or "none."

**Questions.** Usually none. See below.

### Confirmation sets the scope

A bare confirmation means run every incomplete chunk.

The user may narrow: a chunk, a range of chunks, or a single unit. Take whatever they say and run exactly that.

If the reply carries questions or pushback rather than a scope decision, answer, then ask what scope to run. Proceed only once that is settled.

If a chunk in the narrowed scope depends on an earlier chunk that is not complete, report that as a blocker. Do not absorb it.

### Question discipline

Two filters. Apply both. Cut anything that fails either.

1. **Can the bundle answer it?** If yes, cut it. The acceptance criteria, non-goals, decisions, and notes are the spec.
2. **Can the code answer it?** If yes, cut it. Go read the file.

What survives is narrow: a requirement the bundle does not cover, a conflict between the spec and the current code, or drift that changes what should be built.

Never ask which chunk to start with when order settles it. Never ask for confirmation of something the bundle states.

---

## Stage 2: Orchestrate

Begins on confirmation. Runs the scoped chunks to completion without further confirmation.

### Branches

With more than one chunk, each chunk gets its own branch and the branches stack. Chunk 1 branches from the current tip. Chunk 2 branches from chunk 1. And so on.

Create the branches. The project reference supplies the naming pattern; with none, use `<feature>/<chunk-id>`.

With one chunk, stay on the current branch.

The user may ask for a single branch instead. Honor it. Commits still land per unit.

### Per chunk

1. Create and check out the chunk's branch.
2. Spawn a subagent for the chunk. Give it the chunk's units in order, and nothing from any other chunk.
3. Wait for it to finish.
4. Verify the chunk. Refer to "Chunk verification" below.
5. Report three or four lines: chunk id, what it covers, units complete, branch and tip, anything outstanding.
6. Move to the next chunk immediately. Do not wait, do not ask, do not re-brief.

### What a subagent receives

Its chunk's units, in dependency order. For each unit, only that unit's own slice:

- The unit file
- Its `surface_refs` entries from `spec.json`
- Its `decision_refs` entries from `spec.json`
- Every file in `notes_refs`

It does not receive units from other chunks. It does not receive a later unit's slice before reaching it.

`links` on the index or on a unit is not part of any slice. Those are pointers for people. Do not follow them, and do not treat anything they lead to as a requirement.

### What a subagent does per unit

Set the unit's `status` to `in_progress` in `index.json`.

Read every file to be modified in full. Read the governing docs the reference names. Trace the patterns the unit's `surface_refs` point at, especially anything reached by a `precedent_for` edge, since those exist to be followed.

**Acceptance criteria are the contract.** Every one gets satisfied. They are written to be checkable; treat a criterion naming a specific export, path, or call as literal.

**Non-goals are the boundary.** They were written because someone considered the work and ruled it out. Do not relitigate them.

**Follow precedent.** A surface entry with a `precedent_for` edge to your work is the pattern to copy. Reuse existing primitives over writing new ones.

**Preserve unrelated work.** Never reset, never overwrite, never use destructive version control. Other changes in the working tree are not yours.

**Stay in the current unit.** Do not pull work forward from a later unit, fix unrelated defects, or absorb findings that belong elsewhere. Record them.

**Do not change public contracts, backend behavior, database schema, or analytics** unless this unit's acceptance criteria explicitly own that change.

Then run the unit's automated `verify` commands, in order. Do not substitute or skip. An empty array means there is nothing to run; do not invent commands to fill it. Focused checks first, then broader suites. Fix what fails and rerun.

**Defer anything requiring a running application** to chunk verification. A unit is a partial slice and most have nothing to look at.

Check the unit's `states` matrix. For every entry with `applies: true`, verify what can be verified without a running app. An entry with `applies: false` needs no work, but if implementation showed it actually does apply, that is a finding.

Self-check the diff for scope creep, regressions, stale state, unhandled loading and error paths, and unrelated changes that slipped in. Fix what you find and rerun affected checks. This is a self-check, not a review.

### Closing a unit

Commit the unit's changes. One commit per unit, naming the unit id.

Write `built/<unit-id>.json`, per the schema. Record the branch, the commits, the files touched, every assumption made, every criterion that could not be implemented as written, anything left unverified, and anything noticed but deliberately not acted on.

**Record where the bundle was wrong.** Building reveals things research could not. A schema that needed a field nobody planned, a notes file describing a shape that turned out insufficient, a criterion resting on a stale premise. Make the judgment call, build the right thing, and put the correction in `spec_corrections`. Do not edit research output to match, and do not suppress the judgment to stay literal. The refine workflow reads these and can append units that bring the spec back in line.

Then set `status` to `done` in `index.json`, but only when every acceptance criterion is met and every check passes. A unit with outstanding work stays `in_progress`.

### Chunk verification

Run after the chunk's last unit closes, not between units.

A chunk passes the boundary test by construction: its checks pass standalone and someone can judge it without reading a later chunk. So there is something to look at, and the deferred visual steps run here.

The project reference governs how: what tooling to use, and how to start and drive a running app. Follow it.

Skip it if the user said to. They may say so at any point, and it holds for the rest of the session. Report the deferred steps as outstanding rather than as passed, and do not resume without being told to.

Units are already closed by this point. Completion never waited on chunk verification. A failure here is a finding, not a rollback. Fix it if it falls inside a unit's acceptance criteria. Report it if it does not.

The last chunk holds the wiring, so its verification is the whole feature's verification.

### Stopping

The bar for stopping is high. Make reasonable in-scope assumptions and continue, recording each one.

Stop when:

- A decision would materially change product behavior, data contracts, security, or a unit's scope
- A unit's checks fail in a way its own scope cannot fix
- The spec is wrong in a way that invalidates a later unit or chunk

On stopping, leave the current unit `in_progress`, leave completed units `done`, leave every branch in place, and report what finished. Never revert or rebuild completed work to recover from a later failure.

---

## Change requests

The user may ask for a change to work already done, in this session or a later one.

Route the request to the chunk that owns the affected unit. That chunk's agent makes the change, re-runs the affected unit's checks, and commits it as a new commit naming the unit. Amending rewrites history that later chunks are stacked on; treat it as a project decision, not a default.

Then cascade. Every chunk after the changed one rebases onto the new tip, in order, and adapts its own work. Each one re-runs its checks. Report each as it lands.

A downstream chunk that cannot absorb the change is a blocker. Stop the cascade there, leave the chunks before it intact, and report which chunk broke and why. Do not redesign a downstream chunk to accommodate an upstream change without saying so.

In a new session there are no live agents. Read `built/` to recover what each unit did and assumed, then spawn a fresh agent for the affected chunk and cascade from there.

---

## Stage 3: Report

Once the scoped chunks complete or the run stops.

- Outcome and user-visible behavior for the feature as a whole
- Per chunk: what it covers, its branch and tip, units complete, verification performed
- Per unit: acceptance coverage, files changed, checks run and results
- Criteria that could not be implemented as written, and what was done instead
- Assumptions made
- Findings recorded but deliberately not acted on
- Drift found
- Residual risk
- Remaining chunks, if the run stopped early

Do not claim completion while work or verification remains. A precise blocker with evidence beats a false success.

---

## Prohibitions

- No push, PR, or external-system mutation until explicitly authorized in the current chat
- No inferring scope from anything outside the bundle
- No following a `links` entry, and no work derived from one
- No giving a subagent units from another chunk
- No loading a unit's slice before reaching it
- No editing the bundle, except `status` in `index.json` and files under `built/`
- No work outside the current unit's acceptance criteria
- No destructive version control, and no discarding unrelated working-tree changes
- No reverting or rebuilding completed work to recover from a later failure
- No confirmation gate after stage 1, except a change request the user initiates
- No completion report while a check is failing
