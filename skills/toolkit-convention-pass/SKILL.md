---
name: toolkit-convention-pass
description: Apply selected code and writing conventions to work that is already implemented. Match the task to a registry of convention files, then apply the conventions that the task selects. Use when the user asks for the convention pass, for Toolkit conventions, or for a named convention such as the commit convention. Use when the user asks to lint, align, clean up, polish, or apply conventions, and when the user asks to add or register a convention. When the user names a convention, apply it without asking first. Propose a numbered list only when the user names none. Do not use during implementation, and do not use in place of a formatter or a lint tool that the project runs itself.
metadata:
  version: 1
---

# Convention pass

This file is a registry and a selection rule. It holds no conventions. The conventions live in [conventions/](./conventions), and the selection chooses from that directory alone. Read a convention file only after the selection resolves to it.

The pass runs after implementation. Build the feature first, without these rules. Then align the result.

## Selection

Read the user's request and the work in the session. Then take one of two paths.

### The user named a convention, or named the artifact that a convention owns

Apply the matching conventions. Ask nothing first. "Commit these changes", "clean up the comments", and "read commit-seven-rules" each name a convention, and the first two name it through the artifact.

Resolve an unclear signal toward acting. A pass that the user did not want costs one interruption, because the user stops it. A question costs a turn on every run.

### The user named no convention

Match the session against the description and the tags of each entry. Use the languages, the frameworks, the file types, and the action that comes next.

Present the matches as a numbered list. Give each entry its name and one line that says why it applies. The last item is always "Read all of the above." Read no convention file until the user answers.

Keep the list short. When no entry is a clear match, say so, then offer the entries that apply loosely. A list of one entry is sufficient.

## Two conventions for one subject

Some subjects have more than one convention, and the file name gives the variant. `commit-seven-rules` is such a name. A project registers a variant of its own in [conventions/extensions/](./conventions/extensions).

When the registry holds one variant of a subject, apply it. When the registry holds two or more variants of the subject that the task selects, ask which variant to apply. The selection rule cannot decide between two conventions that contradict each other for one artifact.

## New convention

Use this branch when the user asks to add a convention, to register a rule, or to prevent a problem from occurring again. Read [new-convention.md](./references/new-convention.md), then follow it. Do not run the selection in this branch.

## Registry

Each entry gives its reference, its purpose, and its selection tags.

#### [barrel-exports.md](./conventions/barrel-exports.md)

- Description: Import from the source file, and add a barrel file only at the entry point of a workspace.
- Tags: `barrel`, `index.ts`, `exports`, `re-export`, `modules`, `imports`, `monorepo`, `workspace`, `turborepo`, `jit`, `structure`, `typescript`, `javascript`

#### [comments.md](./conventions/comments.md)

- Description: Keep a comment that gives what the code cannot show, and remove a comment that repeats the code.
- Tags: `comments`, `inline-comments`, `jsdoc`, `tsdoc`, `cleanup`, `javascript`, `typescript`, `readability`

#### [commit-seven-rules.md](./conventions/commit-seven-rules.md)

- Description: Write a commit message by the seven rules, keep it free of implementation detail, and commit in phase-level batches.
- Tags: `commit`, `git`, `vcs`, `message`, `staging`, `batching`, `changelog`

#### [component-style-slots.md](./conventions/component-style-slots.md)

- Description: Use named class and style slots when a reusable component exposes multiple styling targets.
- Tags: `react`, `react-native`, `components`, `props`, `styling`, `classnames`, `styles`, `slots`, `typescript`

#### [humanizer.md](./conventions/humanizer.md)

- Description: Edit prose to remove the patterns of AI writing.
- Tags: `prose`, `writing`, `documentation`, `docs`, `guides`, `readme`, `markdown`, `pull-request`, `pr`, `slack`, `email`, `linear`, `tickets`, `client-communication`, `comms`, `humanizer`

#### [jsx-truthiness.md](./conventions/jsx-truthiness.md)

- Description: Simplify the truth checks that decide whether JSX renders.
- Tags: `jsx`, `react`, `react-native`, `conditional-rendering`, `readability`

#### [markdown.md](./conventions/markdown.md)

- Description: Keep each paragraph of a Markdown document on one line.
- Tags: `markdown`, `md`, `docs`, `documentation`, `guides`, `readme`, `prose`, `formatting`, `word-wrap`, `hard-wrap`, `unwrap`

#### [prefer-local-implementations.md](./conventions/prefer-local-implementations.md)

- Description: Keep simple code in place, and extract a helper only when the extraction earns its cost.
- Tags: `abstractions`, `helpers`, `components`, `refactoring`, `cleanup`, `colocation`, `react`, `typescript`

#### [react-hook-form.md](./conventions/react-hook-form.md)

- Description: Keep React Hook Form inference, form access, and submit handlers consistent.
- Tags: `react-hook-form`, `forms`, `react`, `typescript`, `useform`, `resolver`, `schema`, `validation`

#### [simplified-technical-english.md](./conventions/simplified-technical-english.md)

- Description: Edit prose into controlled technical English.
- Tags: `prose`, `writing`, `documentation`, `docs`, `guides`, `readme`, `markdown`, `pull-request`, `pr`, `slack`, `email`, `linear`, `tickets`, `client-communication`, `comms`, `simplified-technical-english`, `ste`, `asd-ste100`, `technical-writing`

#### [tanstack-query-data-fetching.md](./conventions/tanstack-query-data-fetching.md)

- Description: Keep a query function to one endpoint, derive data in the consumer, and put each side effect in a mutation callback.
- Tags: `tanstack-query`, `react-query`, `usequery`, `usemutation`, `mutation`, `mutations`, `query-keys`, `api`, `fetch`, `data-fetching`, `frontend`, `react`, `react-native`, `typescript`, `javascript`

#### [typescript-inference.md](./conventions/typescript-inference.md)

- Description: Let TypeScript infer a return type, and write one only where it protects a boundary.
- Tags: `typescript`, `javascript`, `inference`, `return-types`, `hooks`, `functions`, `cleanup`, `readability`

#### [zod-schema-naming.md](./conventions/zod-schema-naming.md)

- Description: Name a Zod schema in PascalCase, and give an inferred type the same name.
- Tags: `zod`, `schema`, `typescript`, `inference`, `naming`, `pascal-case`
