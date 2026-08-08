---
name: llm-linter
description: Apply selected conventions after implementation by matching the task to focused registry files and asking which to read. Use when the user asks to lint, align, clean up, apply conventions, write a commit message, polish completed work, or create a linter prompt.
---

# LLM Linter

An alignment step that runs **after** implementation is complete. The agent implements features freely first; this skill applies the user's personal stylistic and process rules afterward.

This file is a **registry**, not the rules. The convention files live in [registry/](./registry). Pick the relevant entries, get the user's approval, then read and apply them.

## New prompt

Use this branch when the user invokes `llm-linter new prompt`, asks to create or register a linter prompt, or asks to prevent a recurring problem in future work. Read [new-prompt.md](./new-prompt.md) and follow it. Do not run the selection workflow in this branch.

## Workflow (follow this exactly)

1. **Determine scope.**
   - If the user explicitly named a target (e.g. "fix the commit message", "strip comments"), match against that.
   - Otherwise, infer from what was just worked on in this session: languages, frameworks, file types, and the kind of action about to happen (committing, refactoring, writing docs). Match those signals against each entry's **tags** and **description**.

2. **Propose, do NOT read yet.** Present a **numbered list** of the registry entries you think are relevant. For each: its name and a one-line reason it applies. Do not read the convention files at this stage.
   - The **last numbered item is always "Read all of the above."**
   - Keep the list focused to only genuinely relevant entries.
   - If nothing is clearly relevant, say so plainly ("Nothing directly relevant to this work, but these might apply loosely:") and still offer a short list. Even a single item is fine.

3. **Wait for approval.** The user replies with the numbers they want (or picks the "Read all of the above" number). Read **only** the approved convention files.

4. **Apply.** Follow each convention file's instructions against the relevant code, commit, or artifact. Then briefly report what you changed and which conventions you applied.

## Registry

Each entry: **name**, `path`, **tags**, and a short description. Add new convention files by appending another `---`-delimited block in the same shape.

---

**commit**
`./registry/commit.md`
tags: commit, git, vcs, message, changelog
Conventions for writing commit messages. Apply when committing or revising commit messages.

---

**comments**
`./registry/comments.md`
tags: comments, inline-comments, jsdoc, tsdoc, cleanup, javascript, typescript, readability
Conventions for inline and documentation comments in code. Apply when writing or cleaning up comments in JavaScript/TypeScript.

---

**humanizer**
`../humanizer/SKILL.md`
tags: prose, writing, documentation, docs, guides, readme, markdown, pull-request, pr, slack, email, linear, tickets, client-communication, comms
Points at the humanizer skill (read and apply that SKILL.md directly; no need to invoke the skill machinery). Apply to anything with prose: documentation, markdown files, guides, READMEs, pull request descriptions, Linear tickets, Slack messages, and replies to clients or coworkers.

---

**barrel-exports**
`./registry/barrel-exports.md`
tags: barrel, index.ts, exports, re-export, modules, imports, monorepo, workspace, turborepo, jit, structure, typescript, javascript
Conventions for barrel files and module export/import structure. Apply when creating new modules or directories, or cleaning up import structure.

---

**prefer-local-implementations**
`./registry/prefer-local-implementations.md`
tags: abstractions, helpers, components, refactoring, cleanup, colocation, react, typescript
Prefer readable local code over premature helper, component, and file extraction during cleanup.

---

**typescript-inference**
`./registry/typescript-inference.md`
tags: typescript, javascript, inference, return-types, hooks, functions, cleanup, readability
Conventions for when to rely on TypeScript return type inference.

---

**tanstack-query-data-fetching**
`./registry/tanstack-query-data-fetching.md`
tags: tanstack-query, react-query, usequery, usemutation, mutation, mutations, query-keys, api, fetch, data-fetching, frontend, react, typescript, javascript
Conventions for frontend data fetching and mutations with TanStack Query. Apply when reviewing query functions, mutation functions, mutation callbacks, query keys, API client usage, or code that composes provider endpoint reads/writes.

---

**markdown**
`./registry/markdown.md`
tags: markdown, md, docs, documentation, guides, readme, prose, formatting, word-wrap, hard-wrap, unwrap
General conventions for writing and editing markdown documents. Apply when authoring or editing any `.md` file.
