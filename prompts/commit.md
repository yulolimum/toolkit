# Commit conventions

Write commit messages following the seven rules of a great commit message.

## The seven rules

1. **Separate subject from body with a blank line.**
2. **Limit the subject line to 50 characters.**
3. **Capitalize the subject line.**
4. **Do not end the subject line with a period.**
5. **Use the imperative mood in the subject line.** Write it as a command.
   Test: "If applied, this commit will _[subject]_." For example, "Add password reset flow", not "Added" or "Adds".
6. **Wrap the body at 72 characters.**
7. **Use the body to explain _what_ and _why_, not _how_.**

DO NOT USE Conventional Commits EVER!

## Authorship

Commit as the repository author only. Do NOT add any co-author, attribution, or trailer crediting Claude, an LLM, or any AI tool. That means no `Co-authored-by:` lines and no "Generated with" / "Co-authored with" notes anywhere in the message.

## Commit granularity and batching

Treat the commit history as a chronological implementation journal, not only as a collection of release-ready snapshots.

Prefer multiple phase-level commits over one feature-level commit.

Batch tightly related files together when they implement the same conceptual layer and would normally be reviewed or reverted together. A shared component and its state hook may belong in one commit when they form one public abstraction.

Do not split related files mechanically by file. However, do not merge different implementation phases merely because they are dependent.

Dependency determines commit order, not commit membership. A generic shared change should be committed separately from the feature consumer that depends on it.

Before staging, identify the implementation batches and their order. For each batch:

- group files by conceptual phase and intent;
- include related files that form one reviewable unit;
- keep later consumer work separate from prerequisite shared work;
- stage only files or hunks belonging to the current batch;
- use partial staging when a file contains multiple phases.

Intermediate commits may intentionally break typechecking, builds, or downstream consumers when that reflects the requested implementation sequence. Do not add compatibility layers or migrate unrelated consumers just to make an intermediate commit green.

Do not default to `git add -A`. Stage each batch deliberately.

Only create one commit when the user explicitly requests one atomic commit or the work genuinely represents one implementation phase.

## Keep it high level (non-negotiable)

The commit message must be understandable by anyone, whether a designer, a manager, or a new teammate, WITHOUT reading the code. Describe the change in terms of behavior and intent, never implementation.

Do NOT include:

- Code snippets or inline code of any kind
- File paths, file names, function names, class names, or variable names
- Technical jargon about the implementation (data structures, library calls,
  framework internals, etc.)
- A play-by-play of which lines or files changed

Do focus on:

- What the change accomplishes from a user's or product's perspective
- Why the change was made (the problem it solves or the goal it serves)
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

Keep the subject concrete but plain. If you cannot explain the change without naming code, you are being too technical. Restate it in terms of what the user or product gets.
