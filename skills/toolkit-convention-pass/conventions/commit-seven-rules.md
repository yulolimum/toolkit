# Seven-rule commits

Write each commit message by the seven rules below.

## The seven rules

1. **Separate the subject from the body with a blank line.**
2. **Limit the subject line to 50 characters.**
3. **Capitalize the subject line.**
4. **Do not end the subject line with a period.**
5. **Use the imperative mood in the subject line.** Write it as a command. Test it with this sentence: "If applied, this commit will _[subject]_." Write "Add password reset flow", not "Added" and not "Adds".
6. **Wrap the body at 72 characters.**
7. **Use the body to give _what_ and _why_, not _how_.**

Do not use Conventional Commits. This convention and Conventional Commits are alternatives, and a project that needs the other format registers that format as a convention of its own.

## Authorship

Commit as the author of the repository alone. Do not add a co-author, an attribution, or a trailer that credits Claude, an LLM, or an AI tool. Do not put a `Co-authored-by:` line, a "Generated with" note, or a "Co-authored with" note anywhere in the message.

## Granularity and batching

Commit history is a chronological record of the implementation. Commits exist for review, not for shippable states. Do not treat them as a set of release-ready snapshots.

Prefer several phase-level commits to one feature-level commit.

Report the batches as a plain list of what each batch contains. Do not justify the division, do not explain why a batch is separate, and do not describe what would not have made sense. The rules below are that reasoning, and a report that repeats them is noise.

Put tightly related files in one batch only when they implement the same conceptual layer, and when a reviewer reviews or reverts them together. A shared component and its state hook belong in one commit when they form one public abstraction.

Do not divide related files into separate commits only because they are separate files. Do not merge different implementation phases only because one depends on the other.

Dependency decides the order of the commits, not the membership of a batch. Commit a shared change before the feature that consumes it, and commit them separately.

Identify the batches and their order before you stage. For each batch:

- Group the files by conceptual phase and by intent.
- Include each related file that forms one reviewable unit.
- Keep later consumer work separate from the shared work that it needs.
- Stage the whole files of the current batch, and no other file.

Never partial stage. Do not stage a hunk, do not use `git add -p`, and do not edit a file to remove part of its changes so that the rest can be staged alone. A file is the smallest unit that a batch can hold. When one file holds work that belongs to two batches, put that file in one batch, and say nothing more about it.

An intermediate commit can break type checking, a build, or a downstream consumer, when that reflects the requested implementation sequence. Do not add a compatibility layer, and do not migrate an unrelated consumer, only to make an intermediate commit pass.

Do not use `git add -A` by default. Stage each batch deliberately.

Create one commit only when the user asks for an atomic commit, or when the work is one implementation phase.

## Keep it high level (non-negotiable)

A designer, a manager, and a new teammate must each understand the commit message without the code. Give the behavior and the intent. Never give the implementation.

Do NOT include:

- A code snippet, or inline code of any kind
- A file path, a file name, a function name, a class name, or a variable name
- Implementation jargon, such as a data structure, a library call, or a framework internal
- An account of the changed lines or files, step by step

Do give:

- What the change achieves for the user or the product
- Why the change was made: the problem that it solves, or the goal that it serves
- Each change that the user sees

### Examples

Good:

```
Speed up the dashboard for large accounts

Accounts with thousands of records were waiting several seconds for the
dashboard to load. This change makes it load quickly regardless of account
size, so the experience stays smooth as customers grow.
```

Bad, too technical, do not write this:

```
Refactor DashboardController#index to use eager loading

Replaced the N+1 query in app/controllers/dashboard_controller.rb by adding
.includes(:records) and memoizing the result in @records.
```

Keep the subject concrete and plain. When you cannot explain the change without a name from the code, the message is too technical. Write it again as what the user or the product gets.
