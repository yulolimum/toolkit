# Commit conventions

Write commit messages that follow the seven rules below.

## The seven rules

1. **Separate subject from body with a blank line.**
2. **Limit the subject line to 50 characters.**
3. **Capitalize the subject line.**
4. **Do not end the subject line with a period.**
5. **Use the imperative mood for the subject line.** Write it as a command.
   Test it: "If applied, this commit will _[subject]_." For example, use "Add password reset flow", not "Added" or "Adds".
6. **Wrap the body at 72 characters.**
7. **Use the body to explain _what_ and _why_, not _how_.**

Never use Conventional Commits.

## Authorship

Commit only as the repository author. Do not add co-author, attribution, or trailer credit for Claude, an LLM, or an AI tool. Do not include `Co-authored-by:` lines or "Generated with" / "Co-authored with" notes anywhere in the message.

## Commit granularity and batching

Treat commit history as a chronological record of implementation. Do not treat it only as a collection of release-ready snapshots.

Prefer multiple phase-level commits over one feature-level commit.

Batch tightly related files together only when they implement the same conceptual layer and reviewers would normally review or revert them together. A shared component and its state hook can belong in one commit when they form one public abstraction.

Do not split related files into separate commits only because they are separate files. Do not merge different implementation phases only because they are dependent.

Dependency determines commit order, not commit membership. A generic shared change should be committed separately from the feature consumer that depends on it.

Before staging, identify the implementation batches and their order. For each batch:

- Group files by conceptual phase and intent.
- Include related files that form one reviewable unit.
- Keep later consumer work separate from prerequisite shared work.
- Stage only the files or hunks for the current batch.
- Use partial staging when a file contains multiple phases.

Intermediate commits can intentionally break typechecking, builds, or downstream consumers when this reflects the requested implementation sequence. Do not add compatibility layers or migrate unrelated consumers only to make an intermediate commit green.

Do not default to `git add -A`. Stage each batch deliberately.

Create one commit only when the user explicitly requests an atomic commit or the work represents one implementation phase.

## Keep it high level (non-negotiable)

Anyone must be able to understand the commit message without reading the code, including a designer, a manager, or a new teammate. Describe behavior and intent, never implementation.

Do NOT include:

- Code snippets or inline code of any kind
- File paths, file names, function names, class names, or variable names
- Technical implementation jargon, such as data structures, library calls, or framework internals
- A step-by-step account of the changed lines or files

Do focus on:

- What the change accomplishes for the user or product
- Why the change was made: the problem it solves or the goal it serves
- Any user-visible impact or behavior change

### Examples

Good:

```
Speed up the dashboard for large accounts

Accounts with thousands of records were waiting several seconds for the
dashboard to load. This change makes it load quickly regardless of account
size, so the experience stays smooth as customers grow.
```

Bad (too technical, avoid this):

```
Refactor DashboardController#index to use eager loading

Replaced the N+1 query in app/controllers/dashboard_controller.rb by adding
.includes(:records) and memoizing the result in @records.
```

Keep the subject concrete and plain. If you cannot explain the change without naming code, it is too technical. Restate it in terms of what the user or product gets.
