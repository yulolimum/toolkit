# Graph Refiner

`schema.md` defines the bundle this workflow appends to. Read it first.

Change what a bundle says should exist, after some of it is already built.

Refinement is additive. It appends units. It does not edit or delete the units that came before, because those are the record of what was built and why.

**Refinement versus a change request.** A change request says the code does not match the spec, or asks for a small deviation from it. That is handled inside the implement workflow and leaves no record. Refinement says the spec itself is wrong: you want something different from what was planned. That needs acceptance criteria, so it needs units.

## Workflow

```
0. Intake   the complaint, the bundle, the reference
1. Assess   read-only; what changes and what it costs
2. Draft    append units, assign them, update the chunks
3. Finalize gates, close, name what to run
```

---

## Stage 0: Intake

Two things: what the user wants different, and the bundle path.

Ask for the bundle if the invocation does not give it or point at it. Ask what they want different only if the request is too vague to identify a target.

---

## Stage 1: Assess

Read-only. Nothing gets written in this stage.

No surface pass is needed. The map already exists. What is needed is the difference between the map and the working code.

Read `index.json`, `spec.json`, the units the request touches, their `built/` records, and the code as it stands now.

`built/` matters most here. It records what was assumed while building, which criteria turned out to be unimplementable as written, and where the bundle itself was wrong. A request that runs into the same wall a previous session already hit should say so rather than rediscover it.

Read every `spec_corrections` entry, including ones the current request does not touch. Those are places the spec and the shipped code already disagree, and nothing else will ever reconcile them. Surface them, and offer to append units that fix the spec alongside whatever the user asked for.

### Present

**Request.** What the user wants, in their terms.

**Current state.** What exists now, and which units built it.

**Change.** What would be added. Which chunk each addition lands in.

**Cascade cost.** Which chunks come after the affected ones, and therefore what has to rebase and re-verify. Refining the first chunk of five is expensive; refining the last is not. The user should know which they are asking for before agreeing.

**Superseded work.** Any acceptance criterion whose effect this refinement overrides. State it plainly. The criterion is not being edited, but the user should know their earlier decision is being reversed.

**Already tried.** Anything in `built/` showing a previous session hit this same problem.

**Questions.** Whatever cannot be answered from the bundle or the code.

This is a gate. It clears when the questions resolve.

### Target not yet built

If a unit the request targets is not `done`, there is nothing to refine. Say so, and offer to amend that unit directly instead.

Amending an unbuilt unit is the one case where editing an existing unit is correct, because no code and no `built/` record depend on it yet. Do it only with the user's agreement, and never to a unit whose status is `done` or `in_progress`.

---

## Stage 2: Draft

Set `phase: "refining"` in `index.json` before writing anything else. A bundle left in that phase says a refine pass did not finish.

### Units

Append refinement units to `units/`. Each one carries `refines`, naming the unit whose work it changes.

Same sizing rule as any unit: one job each. If the title needs "and" to be accurate, split it. One request may produce several refinement units.

**Acceptance criteria must be self-contained.** The agent that builds a refinement loads only that unit's own slice, so it will not see the criteria of the unit being refined. Describe the end state in full, as though nothing preceded it. A criterion phrased as a delta is unbuildable.

The same applies to `states` and `non_goals`. Write them fresh. Do not point at another unit's.

### Placement

A refinement unit goes **last in its target's chunk**, not in a new chunk at the end. That is what makes the existing implement workflow pick it up: the chunk has a `pending` unit again, so it is no longer complete, and its agent runs it and cascades.

`depends_on` includes the unit being refined, and anything else in that chunk it now needs.

Several refinements to one chunk stack in order at the end of it.

### Chunks

Update the affected chunk's `covers` to account for what it now does, and confirm the chunk still satisfies the three-part boundary test in `schema.md`. A stale `covers` is the only thing that can silently break a chunk edge.

Add to `incomplete_after` if the refinement leaves something for a later chunk to connect.

Do not create a chunk. Do not reorder chunks. Do not move a unit between chunks.

### Surface and decisions

Append surface entries for anything new the refinement touches. These are different from research-time entries: the code exists, so evidence is what is there rather than what is planned. Update the disposition of any existing entry whose fate this changes.

Record the request itself as a resolved decision, with the user's reasoning. Six months later the bundle should explain why the feature turned out the way it did.

### What is never touched

- An existing unit's `acceptance`, `states`, `non_goals`, or `verify`
- Any `built/` record
- Any unit's `status`
- The set or order of chunks
- Any completed code

---

## Stage 3: Finalize

Run the integrity gates in `schema.md`, then any the project reference adds. They apply unchanged: appended units and surface entries face the same checks as the originals.

Then these:

| Gate | Check |
|---|---|
| Refinement target | Every `refines` value names an existing unit |
| Target built | Every refined unit has status `done` |
| Placement | Every refinement unit sits in its target's chunk, after it |
| Self-contained | No acceptance criterion is phrased as a change to another unit's criteria |
| Covers freshness | Every affected chunk's `covers` accounts for the refinement |
| No edits | No pre-existing unit file changed except through an agreed amendment |

Set `phase: "final"`. Report what was added, which chunks are affected, and the earliest chunk implement will need to start from. Where refinements land in more than one chunk, that is the earliest of them, because the cascade carries through the rest anyway.

---

## Prohibitions

- No writes during stage 1
- No editing an existing unit's acceptance criteria, states, non-goals, or verify commands
- No deleting a unit, a surface entry, or a decision
- No writing to `built/`
- No changing any unit's `status`
- No leaving `phase` as `refining` on a completed pass
- No creating, reordering, or re-scoping chunks
- No code changes, no git writes, no external-system writes
- No acceptance criterion that depends on reading another unit to understand
- No completion report while a gate is failing
