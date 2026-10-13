# toolkit-convention-pass

This skill applies code and writing conventions to work that is already implemented. It is for a developer who wants an agent to build a feature freely, and then align the result to a known set of rules.

The skill holds a registry of conventions. It reads only the conventions that the task selects, so an unrelated rule costs nothing.

## When to use it

Use this skill after implementation, when the work must follow one of the registered conventions:

- `barrel-exports`: import from the source file, and add a barrel file only at the entry point of a workspace.
- `comments`: keep a comment that gives what the code cannot show, and remove a comment that repeats the code.
- `commit-seven-rules`: write a commit message by the seven rules, keep it free of implementation detail, and commit in phase-level batches.
- `component-style-slots`: use named class and style slots when a reusable component exposes multiple styling targets.
- `humanizer`: edit prose to remove the patterns of AI writing.
- `jsx-truthiness`: simplify the truth checks that decide whether JSX renders.
- `markdown`: keep each paragraph of a Markdown document on one line.
- `prefer-local-implementations`: keep simple code in place, and extract a helper only when the extraction earns its cost.
- `react-hook-form`: keep React Hook Form inference, form access, and submit handlers consistent.
- `simplified-technical-english`: edit prose into controlled technical English.
- `tanstack-query-data-fetching`: keep a query function to one endpoint, derive data in the consumer, and put each side effect in a mutation callback.
- `typescript-inference`: let TypeScript infer a return type, and write one only where it protects a boundary.
- `zod-schema-naming`: name a Zod schema in PascalCase, and give an inferred type the same name.

Your project can register more conventions of its own.

Do not use this skill while you implement a feature. Do not use it in place of a formatter or a lint tool that your project runs itself.

## How to use it

Name the skill. The pass does not run on an ordinary instruction, so an everyday "commit these changes" leaves it alone.

When you name a convention as well, the skill applies it and asks nothing first:

> Use the Toolkit conventions commit convention on these changes.

> Run the convention pass over the comments in this file.

When you name the skill alone, it gives a numbered list of the conventions that match your session, and it waits for your choice. The last item is always "Read all of the above."

The skill acts on an unclear signal instead of asking. You can stop a pass that you did not want, and that costs one interruption. A question costs a turn on every run.

### Add a convention for your project

This skill is extendable. Your project can carry a convention that is too specific for the shared collection.

To add a convention:

1. Copy [conventions/extensions/template.md](./conventions/extensions/template.md) to a new name in the same directory.
2. Write your rules in the copy.
3. Add an entry for the copy to the Registry in [SKILL.md](./SKILL.md).

Your agent can do this for you. Ask it to add a convention, and it follows [references/new-convention.md](./references/new-convention.md).

Some subjects carry more than one convention, and the file name gives the variant. `commit-seven-rules` is such a name. When your project needs a different commit format, add your own variant beside it. Do not edit the shared file. The skill asks which variant to apply when it finds two.

## What it produces

The skill returns your code, your commit, or your prose, changed to the rules of the conventions that you selected. It reports what it changed and which conventions it applied.

## Notes

The rules of each convention live in [conventions/](./conventions). Each convention has one file. A convention that belongs to your project lives in [conventions/extensions/](./conventions/extensions). To learn what a convention does before you select it, read its file.

A registry entry that you add to [SKILL.md](./SKILL.md) is a change to a file that MAACS owns, so the CLI reports your copy as edited. The update command keeps your own convention files, and it reconciles the registry entry with you.
