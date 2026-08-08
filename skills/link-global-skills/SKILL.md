---
name: link-global-skills
description: Link a project's local skills into the user-level skill directories for Codex, Claude Code, and Cursor. Use when installing, synchronizing, repairing, or cleaning global skill symlinks.
---

# Link Global Skills

Run the bundled script from the repository root that owns the local skills. It installs one directory symlink per skill, never a symlink for the whole `skills/` folder.

## Find the source

The script uses only `./skills` in the active repository root. It blocks before changing global paths when that directory is absent or has no eligible child directories with `SKILL.md` files. Do not search parent or unrelated locations.

If it blocks, run it from the intended repository root. Do not pass another repository's path as a substitute.

## Run

Resolve the directory containing this `SKILL.md`, then run its sibling script from the active repository root:

```sh
node /path/to/link-global-skills/scripts/link-global-skills.mjs
```

## Behavior

- Clean only broken direct-child symlinks in `~/.agents/skills`, `~/.claude/skills`, and `~/.cursor/skills`.
- Link every direct child of the local source that contains a `SKILL.md` file.
- Skip names in the script's skill blacklist, including `link-global-skills` itself.
- Leave a matching symlink unchanged.
- Never replace a file, directory, provider root, or symlink that points elsewhere. Report those entries as conflicts.
- Create a missing provider directory as needed.

## Report

Return the script's terse sections for removed links, new links, and conflicts. Do not list unchanged links unless no changes were needed. Ask the user before resolving a conflict.
