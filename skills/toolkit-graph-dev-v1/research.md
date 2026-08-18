# Graph Researcher

Produce a spec that a separate implementation agent can execute without access to this conversation.

The spec on disk is authoritative. Anything else, including tickets created later from this output, is a summary. When they disagree, the spec wins.

## Read-only

This skill never modifies application code, never runs git write commands, and never touches external systems. The only writes go to the output directory.

## Workflow

Four stages. Stages 1 and 3 are interactive and fast. Stage 2 runs unattended and may take a long time.

```
0. Intake        objective + project reference
1. Surface pass  fast, bounded, ends in questions
2. Deep research unattended, never asks, writes to disk
3. Finalization  resolve decisions, run gates, close out
```

---

## Stage 0: Intake

If the invocation states what is being built or researched, infer and proceed. Do not confirm. Do not ask for constraints, output location, depth, or scope. Those come later or are inferred.

If the invocation is too vague to identify a target, ask for the objective.

---

## Stage 1: Surface pass

Goal: verify aim before spending real effort. Should complete in a few minutes.

### Bound

**Name things. Do not explain them.**

Allowed:

- Locate entry points for the target
- Enumerate routes, screens, components, hooks, endpoints, and models in the immediate footprint
- Read route definitions, imports, exports, and type signatures
- Check whether a counterpart exists on another platform
- Read AGENTS.md, README, and equivalent governing files

Not allowed:

- Following call chains
- Reading function bodies
- Tracing state, data flow, or query behavior
- Reading tests
- Making any claim about how something behaves

If a sentence about to be written describes behavior, the bound has been broken. Stop and move to output.

### Questions

Two filters. Apply both. Cut anything that fails either.

1. **Could stage 2 answer this by reading code?** If yes, cut it. Stage 2 will.
2. **Can the user answer without opening the codebase?** If no, cut it. That is stage 2 work.

What survives is scope, intent, and preference. Maximum seven questions.

Good: is the adjacent archive screen in scope, should the existing detail view be linked to or rebuilt, is the source platform's multi-select worth porting.

Bad: how does the filter state persist, what does the API return, which component renders the row. All answerable by reading.

### Output

One message. Four blocks. Nothing written to disk yet.

**Target.** One or two sentences on what is about to be mapped.

**Not mapping.** What is being deliberately excluded, drawn from the objective and from adjacent surfaces found during the pass. Gives the user a chance to correct the boundary.

**Inventory.** Grouped flat list of what exists. Names and paths only.

**Questions.** Numbered. One line each stating what changes depending on the answer. Offer options where natural.

Then, in the same message, ask for:

- Constraints, if not already given
- Output directory, proposing the location the project reference sets. With no reference, propose `.context/<slug>/` at repo root.
- Confirmation of the proposed slug

Then stop. Deep research starts when every question above is resolved.

Expect back and forth. The user will often answer some questions and ask followups on others. That is the point of stopping here, and it is cheaper now than after thirty minutes of mapping. Answer their followups, then check what is still open and ask again. Proceed once nothing is.

A followup is not an answer. Do not start the deep pass because most of the list came back.

The slug is a stable kebab-case feature id, inferred from the target. Example: `reports-archive`.

### Aim failures

Report immediately, before anything else, if:

- The target does not exist
- The target exists but does not match its name or description
- Multiple plausible targets match and the objective does not disambiguate
- The target is far larger than the objective implies

---

## Stage 2: Deep research

Unattended. The user is away.

### Never ask

When something is ambiguous, record an assumption and continue. Every assumption becomes an open decision that stage 3 resolves. A question asked here stalls the entire unattended window.

The only exception is a hard stop: the output directory cannot be written, or the target turned out not to exist. Both should have been caught in stage 1.

### Write incrementally

Write to disk as findings land, not at the end. Order matters:

1. `index.json` first, with `phase: "deep"`, `repo_root` from `git rev-parse --show-toplevel`, and `base_commit` from `git rev-parse HEAD`
2. `spec.json` surface entries, appended as mapped
3. `spec.json` decisions, as assumptions accumulate
4. `units/*.json` last, once the surface is complete
5. `index.json` updated to `phase: "review"`

A partial directory then tells you where it stopped.

### What to map

For each surface entry, establish and record:

- What it does, in behavioral terms
- Its variants, where it renders differently under different conditions
- Its edges to other surface entries, typed
- Where the conclusion came from
- Its disposition in this piece of work

Every finding lands somewhere. A screen that will be reused without modification is still a surface entry, with disposition `reuse_as_is`. That record is what stops the implementation agent from rebuilding it.

### Parity work

When mapping one platform against another, hold two things apart:

**Functional parity is strict.** No missing capability, and no invented capability that the source does not have.

**Pattern parity is not.** The target platform's established conventions win over the source platform's layout. A source affordance with no target equivalent gets disposition `no_target_equivalent` and an open decision, not an invented component.

### Units

**A unit does one job.** If a unit's title needs "and" to be accurate, split it. Building a formatter, its tests, a navigation map, and a component is four jobs, not one.

Splitting never removes detail. The acceptance criteria that would have lived in one oversized unit are distributed across the smaller ones, with `depends_on` carrying the ordering that was previously implicit.

Units carry no paths. They reference surface entries by id. This is what makes blast radius queryable and keeps a path change from requiring edits in two places.

### Notes

Write a markdown file under `notes/` when a finding has a shape JSON cannot hold. Exact copy tables, long formatting rules, and reference matrices are the usual cases.

Every notes file must be referenced by at least one unit through `notes_refs`. A notes file no unit points at will never be read, because the implementation agent loads only its own unit's references.

Notes are not a place for narrative summary. Nothing a gate depends on lives there.

---

## Stage 3: Finalization

Interactive. The user is back.

### Present

**Summary.** What was mapped, how many surface entries, how many units, the critical path through `depends_on`.

**Red flags.** Anything found that changes scope, cost, or risk. Missing platform patterns, work that turned out to be larger than expected, constraint violations, low-confidence conclusions.

**Decisions.** Every open decision, numbered. State the assumption made, the reasoning, and what changes if it is wrong. These are the questions.

### Resolve

Nothing gets written and no gate runs until every decision is settled.

Expect back and forth. The user will often resolve some decisions and ask followups on others, or question a red flag. Answer their followups, then check what is still open and ask again. Close out once nothing is.

A followup is not a resolution. Do not start writing because most of the decisions came back.

Once everything is settled, each answer writes into its decision entry: `status: "resolved"`, plus `resolution` and `rationale`. Then update any affected surface entries and units.

Do not discard the assumption. The record of what was assumed and why it was overridden is useful later.

### Gates

Run before closing out. Report any failure. Do not close with a failing gate.

The project reference may add gates. Run those too, after the core set.

| Gate                 | Check                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| Disposition coverage | Every surface entry has a disposition                                                                  |
| Claim coverage       | Every `modify` and `build_new` entry is referenced by exactly one unit                                 |
| Reuse reachability   | Every `reuse_as_is` entry is referenced by at least one unit                                           |
| Unit grounding       | Every unit references at least one surface entry                                                       |
| Unit scope           | No unit title requires "and" to be accurate                                                            |
| Reference integrity  | Every `surface_refs`, `decision_refs`, `notes_refs`, `depends_on`, and `states[].source` target exists |
| Notes reachability   | Every file in `notes/` is referenced by at least one unit                                              |
| Acyclicity           | `depends_on` forms a DAG                                                                               |
| Evidence grounding   | Every surface entry has at least one evidence record                                                   |
| Decision closure     | No decision left `open`                                                                                |
| Constraint check     | Every constraint has a stated verdict, with violations listed                                          |
| Commit pin           | `base_commit` is set and the tree is unchanged since it was recorded                                   |

Unclaimed `modify` means a change was researched and never planned. An unreferenced `reuse_as_is` entry means a "do not rebuild this" finding will never reach the implementation agent, since it only loads its own unit's references. A unit with no surface refs means work was invented with no grounding. All three are silent failures otherwise.

### Close

Set `phase: "final"`. Report the output path and the entry point for implementation.

---

## Output

```
<output-dir>/
  index.json          feature, objective, constraints, phase, unit status
  spec.json           surface[], decisions[]
  units/<unit-id>.json
  notes/              optional supporting markdown
```

The implementation agent loads `index.json`, resolves one unit, and pulls only the surface entries and decisions that unit references. It never sees sibling units.

### index.json

```json
{
  "feature": "reports-archive",
  "objective": "",
  "reference": "acmecorp",
  "repo_root": "",
  "base_commit": "",
  "created": "",
  "phase": "final",
  "constraints": [],
  "constraint_verdicts": [{ "constraint": "", "verdict": "satisfied", "detail": "" }],
  "deviations": [{ "id": "", "detail": "", "authorized": true }],
  "units": [{ "id": "archive-list", "status": "pending", "depends_on": [] }]
}
```

`reference` records which project reference was loaded, or `null` if none applied. A consumer reading this bundle needs to know which vocabulary and conventions were in force.

`base_commit` pins the tree the surface map was true of. Without it there is no way to tell whether the spec has gone stale. Record it at the start of stage 2 and verify it at stage 3.

`repo_root` is recorded because paths in `spec.json` are repo-relative. The bundle may live outside the repository, so the root has to travel with it.

`constraint_verdicts` gives every stated constraint a verdict: `satisfied`, `violated`, or `satisfied_with_reframe`. A reframe is for when research showed the constraint's premise was slightly wrong. State the correction.

`deviations` records every place the result differs from the reference behavior, whether the reference is another platform or the prior implementation. `authorized` distinguishes what the user approved from what the target platform's conventions forced.

`status` is `pending`, `in_progress`, or `done`. The implementation agent stamps it. A unit whose dependencies are not `done` is not ready to start.

### spec.json

```json
{
  "surface": [
    {
      "id": "source-archive-route",
      "kind": "route",
      "platform": "web",
      "path": "src/routes/reports/archive/index.tsx",
      "behavior": "",
      "variants": [],
      "edges": [{ "to": "source-archive-table", "type": "renders" }],
      "evidence": [{ "source": "", "detail": "" }],
      "disposition": "reference_only",
      "confidence": "high"
    }
  ],
  "decisions": [
    {
      "id": "multi-select-pattern",
      "question": "",
      "status": "resolved",
      "assumption": "",
      "rationale": "",
      "resolution": "",
      "affects": ["archive-list"]
    }
  ]
}
```

`variants` is a free-form list of render or behavior states this entry can be in. Distinct from a unit's `states`, which is a fixed matrix.

`kind` defaults to `route`, `screen`, `component`, `hook`, `endpoint`, `model`, `test`, `config`. The project reference extends this. Use the reference's vocabulary where it has one.

`platform` is optional. Populate it when the project has more than one surface, using the values the reference defines. Omit it entirely in a single-surface project.

**Edge types**

| Type               | Meaning                                   | Direction     |
| ------------------ | ----------------------------------------- | ------------- |
| `renders`          | Draws it                                  | Directed      |
| `calls`            | Invokes it                                | Directed      |
| `navigates_to`     | Routes to it                              | Directed      |
| `imports`          | Depends on its module                     | Directed      |
| `reads` / `writes` | Touches its data                          | Directed      |
| `mirrors`          | Cross-platform counterpart                | **Symmetric** |
| `precedent_for`    | Existing pattern the target should follow | Directed      |

`mirrors` is symmetric. Record it once, on the source-platform entry. Writing both directions doubles the graph without adding information.

`mirrors` is only for entries on different platforms. A same-platform relationship where one thing is the model for another is `precedent_for`. That is a different claim: not "these correspond" but "copy this one's approach."

**Disposition**

`reuse_as_is`, `modify`, `build_new`, `reference_only`, `no_target_equivalent`, `out_of_scope`

`reference_only` is for source-platform entries mapped for parity. They are evidence, not work.

**Confidence**

Grounded in how the conclusion was reached, not in how sure it feels.

| Level    | Basis                                                          |
| -------- | -------------------------------------------------------------- |
| `high`   | Read directly in the file that defines it                      |
| `medium` | Inferred from a sibling pattern, a type signature, or a caller |
| `low`    | Not verified in code                                           |

Anything below `high` needs a decision entry. If nearly every entry is `high`, the field is not being applied.

### units/&lt;unit-id&gt;.json

```json
{
  "id": "archive-list",
  "title": "",
  "depends_on": [],
  "surface_refs": [],
  "decision_refs": [],
  "notes_refs": [],
  "acceptance": [],
  "states": [{ "state": "empty", "applies": true, "expected": "", "source": "" }],
  "verify": [],
  "non_goals": [],
  "side_effects": "none"
}
```

`acceptance` entries are checkable statements, not prose. When an acceptance criterion depends on a notes file, that file must appear in `notes_refs`. A prose mention is not a reference.

`notes_refs` holds paths relative to the bundle root, such as `notes/copy.md`.

`states` defaults to `loading`, `empty`, `error`, `permission`, `retry`, `offline`, `pagination`. The project reference may extend or replace this list. Include every state in the applicable matrix with `applies` set either way. An explicit `false` tells the implementation agent the state was considered and ruled out, which is different from silence.

`source` on a state records where the expected behavior came from. For parity work this is usually the mirrored surface entry.

`verify` holds literal commands for the implementation agent to run after its changes are complete. **The researcher never runs them.** Take them from the project reference. With no reference, derive them from the repository's own tooling and mark the unit `medium` confidence on that basis.

`side_effects`: `none`, `repo`, `external`. Anything `external` gets flagged in stage 3 regardless of constraints.

---

## Prohibitions

- No code changes, no git writes, no external system writes
- No questions during stage 2
- No behavioral claims during stage 1
- No surface entry without evidence
- No unit carrying a raw path instead of a surface reference
- No absolute paths in `spec.json` or unit files; paths are repo-relative and resolve against `repo_root`
- No `mirrors` edge written in both directions
- No notes file that no unit references
- No running a unit's `verify` commands; those belong to the implementation agent
- No completion report while a gate is failing
- No proceeding past intake without either a loaded reference or an explicit statement that none applies
