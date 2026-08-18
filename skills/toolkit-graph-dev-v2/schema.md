# Bundle schema

The shared contract. All three workflows read this file.

A bundle is the specification for one feature, on disk, complete enough that an agent with no access to the conversation that produced it can build the thing.

## Layout

```
<bundle>/
  index.json          feature, objective, constraints, units, chunks
  spec.json           surface[], decisions[]
  units/<unit-id>.json
  built/<unit-id>.json
  notes/              data JSON cannot hold
```

## Ownership

| Path | research | implement | refine |
|---|---|---|---|
| `index.json` | creates | `status` only | appends units, updates chunks |
| `spec.json` | creates | reads | appends |
| `units/` | creates | reads | appends |
| `notes/` | creates | reads | may append |
| `built/` | never | creates | reads |

No workflow deletes anything. Ids are stable once written.

## index.json

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
  "constraint_verdicts": [
    { "constraint": "", "verdict": "satisfied", "detail": "" }
  ],
  "deviations": [
    { "id": "", "detail": "", "authorized": true }
  ],
  "links": [],
  "units": [
    { "id": "archive-list", "status": "pending", "depends_on": [] }
  ],
  "chunks": [
    {
      "id": "list-surface",
      "title": "",
      "covers": "",
      "units": [],
      "incomplete_after": [
        { "detail": "", "resolved_by": "" }
      ]
    }
  ]
}
```

`phase` is `deep`, `review`, `refining`, or `final`. It tracks the spec's own lifecycle, not build progress; build progress is unit `status`. A workflow sets its working phase on entry and `final` on close, so a bundle left mid-phase says a run did not finish.

`reference` names the project reference that was loaded, or `null` if none applied. A consumer needs to know which vocabulary and conventions were in force.

`repo_root` travels with the bundle because paths in `spec.json` are repo-relative and the bundle may live outside the repository.

`base_commit` records the tree the surface map was read from. Advisory only. The tree will have moved by the time anyone builds, and that is normal. It exists so a consumer can see how old the map is, not to gate anything.

`constraint_verdicts` gives every stated constraint a verdict: `satisfied`, `violated`, or `satisfied_with_reframe`. A reframe is for when research showed the constraint's premise was slightly wrong; state the correction.

`deviations` records every place the result differs from the reference behavior, whether the reference is another platform or a prior implementation. `authorized` distinguishes what the user approved from what the target platform's conventions forced.

`links` holds pointers to related material: an issue, a document, a page, a local file. Entries are `{ "label": "", "target": "" }`, where `target` is a URL or a path.

**Links are pointers, not sources.** No workflow populates them, because the material usually does not exist yet. Something else writes them afterward. An entry carries no requirements, and nothing it leads to overrides the bundle. Do not follow one.

`units` lists every unit in dependency order. `status` is `pending`, `in_progress`, or `done`, and only the implement workflow sets it. A unit whose dependencies are not `done` is not ready to start.

`chunks` groups units into reviewable bodies of work. Array order is the dependency, so there is no `depends_on`. There is no `status` either: a chunk is complete when its units are. Every bundle has at least one chunk, holding every unit if there are no seams worth splitting on.

`covers` is one sentence naming what the chunk accounts for. If it cannot be written without pointing at a later chunk, the boundary is wrong.

`incomplete_after` declares what a chunk leaves unfinished, each entry naming the later chunk that resolves it. Two cases belong there and they are the same thing from a reviewer's side: functionality built but not connected, and a surface this chunk creates that a later chunk modifies.

## spec.json

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
      "edges": [
        { "to": "source-archive-table", "type": "renders" }
      ],
      "evidence": [
        { "source": "", "detail": "" }
      ],
      "disposition": "reference_only"
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

### decisions

`question` states what was unresolved. `status` is `open` or `resolved`.

`assumption` records what was assumed in order to keep going, and `rationale` records why. `resolution` records what the user decided once asked.

**A resolved assumption is never deleted.** The record of what was assumed, and that the user overrode it, is the reason a later reader can tell a deliberate choice from an accident.

`affects` lists the unit or surface ids the decision bears on.

### surface

`path` is repo-relative, resolved against `repo_root`. Never absolute.

`variants` is a free-form list of render or behavior states an entry can be in. Distinct from a unit's `states`, which is a fixed matrix.

`kind` defaults to `route`, `screen`, `component`, `hook`, `endpoint`, `model`, `test`, `config`. The project reference extends this. Use the reference's vocabulary where it has one.

`platform` is optional. Populate it when the project has more than one surface, using the values the reference defines. Omit it entirely in a single-surface project.

### Edge types

| Type | Meaning | Direction |
|---|---|---|
| `renders` | Draws it | Directed |
| `calls` | Invokes it | Directed |
| `navigates_to` | Routes to it | Directed |
| `imports` | Depends on its module | Directed |
| `reads` / `writes` | Touches its data | Directed |
| `mirrors` | Cross-platform counterpart | **Symmetric** |
| `precedent_for` | Existing pattern the target should follow | Directed |

`mirrors` is symmetric. Record it once, on the source-platform entry. Writing both directions doubles the graph without adding information.

`mirrors` is only for entries on different platforms. A same-platform relationship where one thing is the model for another is `precedent_for`. That is a different claim: not "these correspond" but "copy this one's approach."

### Disposition

`reuse_as_is`, `modify`, `build_new`, `reference_only`, `no_target_equivalent`, `out_of_scope`

`reference_only` is for source-platform entries mapped for parity. They are evidence, not work.

### Evidence

Every surface entry carries at least one evidence record. `source` locates the claim: a path with a line range, a URL, or an observed behavior. `detail` says what was found there.

Evidence is where certainty lives. A reader can see whether a claim came from the file that defines it, from a sibling pattern, or from a vendor's documentation, and weigh it accordingly. Uncertainty that needs a person's attention belongs in a decision, which can hold it at the granularity that matters.

## units/&lt;unit-id&gt;.json

```json
{
  "id": "archive-list",
  "title": "",
  "refines": null,
  "depends_on": [],
  "surface_refs": [],
  "decision_refs": [],
  "notes_refs": [],
  "acceptance": [],
  "states": [
    { "state": "empty", "applies": true, "expected": "", "source": "" }
  ],
  "verify": [],
  "non_goals": [],
  "links": [],
  "side_effects": "none"
}
```

A unit is one job, sized so a single agent can build and check it in one pass. If the title needs "and" to be accurate, it is more than one unit.

Units carry no paths. They reference surface entries by id.

`refines` names the unit whose work this one changes, or `null`. Only refinement units set it.

**A refinement's criteria are self-contained.** Its `acceptance`, `states`, and `non_goals` describe the end state in full, never a delta from the unit being refined. The agent that builds it loads only its own slice and will not see the other unit's criteria. The refined unit's criteria stay in place as the record of what that unit built; they are not a requirement once a refinement supersedes them.

`acceptance` entries are checkable statements, not prose. When a criterion depends on a notes file, that file must appear in `notes_refs`. A prose mention is not a reference.

`notes_refs` holds paths relative to the bundle root, such as `notes/copy.md`.

`states` defaults to `loading`, `empty`, `error`, `permission`, `retry`, `offline`, `pagination`. The project reference may extend or replace this list. Include every state with `applies` set either way. An explicit `false` says the state was considered and ruled out, which is different from silence.

`source` on a state records where the expected behavior came from. For parity work this is usually the mirrored surface entry.

`verify` holds literal commands, run after the unit's code changes are complete. Commands come from the project reference. If the reference supplies none, or no reference applies, leave it empty. Do not derive commands from the repository, and do not invent them. An empty array is the correct answer for a project that has not specified any. Only the implement workflow runs them.

`links` works as it does at the index level: pointers, written by something else, carrying no requirements.

`side_effects` is `none`, `repo`, or `external`. Anything `external` gets surfaced to the user regardless of stated constraints.

## built/&lt;unit-id&gt;.json

Written by the implement workflow when a unit closes. One file per unit.

```json
{
  "id": "archive-list",
  "chunk": "list-surface",
  "branch": "",
  "commits": [],
  "files": [],
  "assumptions": [{ "detail": "", "reason": "" }],
  "criteria_deviations": [{ "criterion": "", "why": "", "instead": "" }],
  "spec_corrections": [{ "target": "", "says": "", "reality": "" }],
  "outstanding": [],
  "findings": []
}
```

This is the record of what happened, not a place for pending instructions. Work still to be done lives in `units/`.

`criteria_deviations` is the load-bearing field. When a criterion turns out to be unimplementable as written, record what it asked for, why it could not be done, and what was done instead. Without it, a later session re-reading the spec hits the same wall and may solve it differently.

`spec_corrections` records where the bundle itself turned out to be wrong, as opposed to a criterion that could not be met. `target` names the file or field, `says` what the bundle claims, `reality` what building it revealed. Implement cannot edit research output, so this is the channel: the refine workflow reads these and can append units that fix the spec.

Use it when a judgment call during building invalidated something written down. A schema that needed a field nobody planned, a notes file describing a shape that turned out insufficient. Do not use it for a criterion that was simply hard; that is `criteria_deviations`.

`assumptions` covers every in-scope judgment made without asking. `outstanding` covers work that could not be verified. `findings` covers problems noticed and deliberately not acted on.

`branch` and `commits` are what let a new session find the tip of a stacked chunk. Every unit in a chunk shares one branch.

## Integrity gates

A valid bundle passes all of these. The research and refine workflows run them before closing. They describe the format, not a process, so a failure is a defect in the bundle rather than a step someone skipped.

| Gate | Check |
|---|---|
| Disposition coverage | Every surface entry has a disposition |
| Claim coverage | Every `modify` and `build_new` entry is referenced by at least one unit |
| Claim overlap | Where several units reference one entry, no two claim the same change, and each declares in `non_goals` what it leaves to the others |
| Reuse reachability | Every `reuse_as_is` entry is referenced by at least one unit |
| Unit grounding | Every unit references at least one surface entry |
| Unit scope | No unit title requires "and" to be accurate |
| Reference integrity | Every `surface_refs`, `decision_refs`, `notes_refs`, `depends_on`, `refines`, and `states[].source` target exists |
| Notes reachability | Every file in `notes/` is referenced by at least one unit |
| Acyclicity | `depends_on` forms a DAG |
| Chunk coverage | At least one chunk exists, and every unit belongs to exactly one |
| Chunk order | No unit sits in a chunk earlier than a unit it depends on |
| Chunk boundary | Every chunk has a `covers` statement |
| Loose ends | Every `incomplete_after` entry names a `resolved_by` chunk that comes later |
| Evidence grounding | Every surface entry has at least one evidence record |
| Decision closure | No decision left `open` |
| Constraint check | Every constraint has a stated verdict, with violations listed |
| Prose references | Every unit id named in an `acceptance`, `non_goals`, or `behavior` string exists |
| Prose agreement | No count, name, or claim in an acceptance criterion contradicts a notes file, a constraint verdict, or a resolved decision |

Unclaimed `modify` means a change was researched and never planned. An unreferenced `reuse_as_is` entry means a "do not rebuild this" finding will never reach the agent that builds, since it loads only its own unit's references. A unit with no surface refs means work was invented with no grounding. All three are silent failures otherwise.

The project reference may add gates. Run those after these.

## Chunk boundaries

A chunk is valid when all three hold:

- The repository's own checks pass with this chunk's units complete and nothing after it.
- Someone can judge this chunk's correctness without reading a later chunk.
- Anything left unwired or unreachable is declared in `incomplete_after`, not discovered.

`covers` is the test in practice. If it cannot be written without pointing at a later chunk, the boundary is wrong.

## Three structures

They are separate and get confused for each other.

**The surface graph** is `spec.json` surface entries and their edges, plus each unit's `surface_refs`, `decision_refs`, and `notes_refs`. It says what exists and what to read. It is context. It does not control scope.

**Unit order** is `depends_on`. It says unit B assumes unit A's output exists. It is a precondition to check, not work to absorb.

**Chunks** group units for review. Their array order is their dependency.
