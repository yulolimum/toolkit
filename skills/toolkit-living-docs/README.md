# toolkit-living-docs

This skill maintains the agent-facing living documentation in `.agents/docs`. It is for a developer who wants that system created, refreshed, or audited after the project changes.

## When to use it

Use this skill when completed work can affect the `.agents/docs` briefs or their registry. Use it to audit the system, or to scaffold it in a repository that does not have it.

The skill works on the `.agents/docs` system only. Do not use it for README files, changelogs, inline comments, or one-off documentation edits.

## How to use it

Ask your agent to run the skill after a change is complete:

> Use the toolkit-living-docs skill to review the living documentation for this feature. Update it only where needed.

To create the system in a new repository, request the scaffold explicitly:

> Use the toolkit-living-docs skill to scaffold living docs in this repository.

The skill scaffolds only on an explicit request. It does not create documents or a registry on its own initiative.

## What it produces

The skill checks whether changed information belongs in living docs and which brief owns it. It updates content only within that brief's intended scope. Information already owned by source documentation stays there. A review can finish without edits.

If a distinct domain needs a brief but has none, the skill reports the gap. It does not put that domain's details in a broader brief. Existing misplaced content does not justify further additions.

The skill updates the registry when a brief is created, renamed, deleted, or materially re-scoped. Registry tags identify the main subjects or workflows that each brief covers. The skill removes tags for incidental mentions, supporting details, and prerequisites when it updates an entry.

On a scaffold request, it creates the registry, the agent entry points, and their symlinks. Before it finishes, it applies the Simplified Technical English flavor of the `toolkit-editorial-pass` skill to the changed prose.

## Notes

The skill treats `.agents/docs/index.md` as the scaffold marker. When that file is absent, the skill reports the missing scaffold and stops instead of updating documentation. For the full rules the agent follows, read [SKILL.md](./SKILL.md).
