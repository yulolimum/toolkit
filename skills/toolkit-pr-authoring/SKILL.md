---
name: toolkit-pr-authoring
description: Write a pull request description from the commits and diff between a base branch and the current branch, with an outline, proof tables, and optional diagrams that a project can extend. Use when the user asks for a PR description, a pull request summary, release notes for a branch, or a summary of the work on a branch. Do not use it to open, update, or merge a pull request, and do not use it to review the code in the diff.
metadata:
  version: 1
---

# PR authoring

The outline of the description is in [templates/pr-description.md](./templates/pr-description.md). That file states each section and the rules for each section. A project that installs this skill can replace that file.

This file holds the workflow. Follow the steps in order.

## 1. Resolve the outline

Read [templates/pr-description.md](./templates/pr-description.md). Then read the `extensions/` directory.

- `extensions/pr-description.md` is the project's own outline. When that file exists, that file decides which sections appear and in what order. The result does not carry a section that the project outline omits, because an omission is a choice and not a gap.
- The MAACS outline still supplies the rules for a section that the project outline names without rules. A project outline that lists `## Notes` with no rules takes the rules of the MAACS Notes section. Fall back on a rule. Do not fall back on wording.
- Every other Markdown file in `extensions/` is an additional requirement. Apply each requirement on every run. A requirement adds a section, adds a constraint, or sets the proof targets.
- When a requirement conflicts with the MAACS outline, the requirement applies. When a requirement conflicts with the project outline, ask the user which one applies.

A directory that holds `template.md` alone means that the project added nothing. Use the MAACS outline without a change.

## 2. Settle the editorial flavor and the proof targets

Ask for both in one message. Skip a question that the user answered already.

**Editorial flavor.** Read the Registry section of the `toolkit-editorial-pass` instruction file, which is installed in the same skills directory as this skill. Offer the registered flavors that suit a pull request description. Also offer an option to skip the pass. Do not read a flavor file, because `toolkit-editorial-pass` reads the file that the user selects. There is no default flavor. A project can register a tone of its own, and a fixed default hides that tone.

When `toolkit-editorial-pass` is not installed, report that one time. Then continue with no editorial pass.

**Proof targets.** A proof target is one thing that a reviewer sees evidence for. Examples are a platform, a device, or the state before and after the change. Ask which targets the description carries. The answer can be none. MAACS ships no default, because the evidence that a pull request carries belongs to the project. When the project outline or a requirement file sets the targets, do not ask.

When the answer is not none, read [references/proofs.md](./references/proofs.md).

## 3. Find the branches

```bash
git branch --show-current
git symbolic-ref refs/remotes/origin/HEAD 2> /dev/null | sed 's@^refs/remotes/origin/@@'
git branch -r | grep -E 'origin/(main|master|develop)'
```

Find the base branch in this order:

1. Use the branch that the second command reports.
2. When the second command reports nothing and the third command finds one branch, use that branch.
3. When the third command finds more than one branch, ask the user which branch is the base. Do not choose one yourself. A list of local branches does not settle the question, because the base branch can be a remote branch that this checkout does not hold. A project that keeps both `main` and `develop` merges to each one for a different reason, and the wrong base produces the wrong diff.

Confirm that both branches exist before you read a diff.

## 4. Gather the changes

Set `BASE` to the base branch from step 3. Then run these commands together.

```bash
git log "$BASE"..HEAD --format="%h %s%n%b%n---"
git diff "$BASE"...HEAD --stat
git diff "$BASE"...HEAD --name-status
```

When the diff holds fewer than 10,000 lines, read the full diff.

```bash
git diff "$BASE"...HEAD
```

For a larger diff, read the files that carry behavior. Summarize a large refactor. Do not read all of the diff. Read every commit in the range, because the last commit does not carry the intent of the branch.

## 5. Write the description

Follow the resolved outline. The outline states each section and the rules for that section.

**Diagrams.** A description carries no diagram unless the user asks for one. When the user asks, read [references/diagrams.md](./references/diagrams.md) and apply the tests in that file. The tests can answer no. When you decline a diagram, report the reason and give the sentence that replaces the diagram. When the user asks a second time, draw the diagram, because a repeated instruction is the user's decision.

## 6. Apply the editorial pass, then present

- Invoke `toolkit-editorial-pass` with the selected flavor. When the user chose to skip the pass, or when the skill is not installed, skip this step.
- The pass covers prose. The pass preserves each heading, each table, each placeholder, the list structure, and each diagram.
- Print the result as raw Markdown inside a fenced block labelled `markdown`, so that the user can copy the result into the pull request. Do not print rendered Markdown.
- When the result holds a fenced block, such as a diagram, open the outer block with more backticks than the inner block uses. Four backticks contain a block of three. An outer block of three backticks ends at the inner block, and the rest of the description escapes the block.
- State each fact that the diff did not settle. Ask the user to confirm each one.

## References

Read a reference file when its condition applies. Do not read it before.

#### [proofs.md](./references/proofs.md)

- Read it when the description carries proofs. The file holds the table form, the placeholder rules, and the placement.

#### [diagrams.md](./references/diagrams.md)

- Read it when the user asks for a diagram. The file holds the tests that decide if the change needs one, and the rules for drawing it.

#### [examples.md](./references/examples.md)

- Read it before you draft when the branch changes more than approximately ten files for one purpose, or when the commit count is much higher than the number of changes that a reader needs. Both shapes push a draft toward an inventory of the implementation. The file holds three worked descriptions.
