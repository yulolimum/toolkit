# toolkit-editorial-pass

This skill applies a registered editorial flavor to prose. It is for a developer who wants documentation, pull request descriptions, or other human-facing text edited in a controlled style.

## When to use it

Use this skill when prose must follow one of the registered flavors:

- `humanizer`: natural, fact-preserving prose that removes common AI-writing patterns.
- `simplified-technical-english`: controlled technical prose based on a practical subset of ASD-STE100.

Your project can register more flavors of its own.

Do not use this skill for code changes. Do not use it for agent-facing briefs in `.agents/docs`; the `toolkit-living-docs` skill applies this skill to those briefs itself.

## How to use it

Ask your agent to run the skill, and name a flavor:

> Use the toolkit-editorial-pass skill with the humanizer flavor on this pull request description.

The skill accepts one argument: a flavor name or tag, matched case-insensitively. When you do not name a flavor, the skill presents a numbered list of the registered flavors and waits for your choice.

### Add a flavor for your project

This skill is extendable. Your project can carry a flavor that is too specific for the shared collection.

To add a flavor:

1. Copy [references/extensions/template.md](./references/extensions/template.md) to a new name in the same directory.
2. Write your rules in the copy.
3. Add an entry for the copy to the Registry in [SKILL.md](./SKILL.md).

## What it produces

The skill returns the same prose, edited to the rules of the selected flavor. It preserves your facts, your intent, and the requested format.

## Notes

The rules of each flavor live in [references/](./references). Each flavor has one file. A flavor that belongs to your project lives in [references/extensions/](./references/extensions). To learn what a flavor does before you select it, read its file.
