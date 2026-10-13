# toolkit-pr-authoring

This skill writes a pull request description from the difference between your branch and its base branch. It is for a developer who wants a description that a teammate can read, and not a list of the code that changed.

## When to use it

Use this skill when you need one of these:

- a pull request description
- a summary of the work on a branch, for a review
- release notes for a branch

Do not use it to open, update, or merge a pull request. Do not use it to review the code in the diff.

## How to use it

Ask your agent to run the skill:

> Use the toolkit-pr-authoring skill for this branch against main.

The skill finds the base branch, reads the commits and the diff, and asks two questions:

- Which editorial flavor to apply. The options come from the flavors that `toolkit-editorial-pass` has registered, so a flavor that your project added appears here. You can also skip the pass.
- Which proof targets the description carries, or none. There is no default, because the evidence that your pull request carries belongs to your project.

A diagram is off by default. Ask for one, and the skill first tests if the change holds a structure that a picture carries better than a sentence. It tells you when it declines, and it draws the diagram if you ask a second time.

### Add your project's requirements

This skill is extendable. Your project can carry rules that are too specific for the shared collection.

To add a requirement:

1. Copy [extensions/template.md](./extensions/template.md) to a new name in the same directory.
2. Write your rules in the copy.

The skill reads every requirement file on each run. A requirement can add a section, add a constraint, or pin your proof targets.

### Replace the outline

To replace the outline:

1. Copy [templates/pr-description.md](./templates/pr-description.md) to `pr-description.md` in the extensions directory.
2. Edit the copy. Keep the sections that you want, in the order that you want.

Your outline then decides which sections appear. A section that you remove stays out of the result. A section that you name but leave without rules takes the rules of the shared outline.

## What it produces

The skill prints raw Markdown in a code block, ready to paste into a pull request. The result holds an overview, a task list, optional notes, an optional proof table, and an optional diagram.

## Notes

Your files in the extensions directory survive an update of the skill. A removal of the skill deletes the whole skill directory, and the deletion includes your files.
