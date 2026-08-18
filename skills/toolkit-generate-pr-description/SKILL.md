---
name: toolkit-generate-pr-description
description: Generate concise, human-readable pull request descriptions from the diff between a base branch and the current branch. Use when creating a pull request, preparing release notes, or summarizing branch work for review.
---

# Generate PR Description

## Overview

Use this skill to create concise PR descriptions from changes between branches. Read commits, diffs, and change patterns. Write an overview, changelog-style tasks, optional notes, and optional diagrams.

## When to Use This Skill

Use this skill when you need to:

- Create a pull request description.
- Document work before creating a pull request.
- Summarize branch changes for review.
- Generate release notes.
- Understand what changed in a branch.

## Output Format

Generate Markdown in this format. Always include Overview. Omit Notes when there is no useful reviewer context.

```markdown
## Overview

[One short paragraph that summarizes the PR. Do not include code, file, function, command, or implementation details.]

## Tasks

- [Action verb] [Human-readable high-level change]
- [Action verb] [Another top-level change]
- [Action verb] [Change with sub-items for a large scope]
  - [Sub-item for the parent change]
  - [Another sub-item for the same parent change]

## Notes

- **[Topic Category]**: [One sentence about reviewer context, risk, or required action]

<!-- Include Proofs only for the standard or mobile format. Omit it for none. -->

## Proofs

| Description | Video                 |
| ----------- | --------------------- |
| _______     | <video src="______"/> |
```

Before generating the description, collect both choices unless the user already gave them. Present this exact prompt with no added framing, defaults, reply instructions, or extra bullets:

```text
Editorial Pass:
- Simplified Technical English (ste)
- Humanizer

Proofs:
- none
- standard
- mobile
```

Use Simplified Technical English when the user omits the editorial pass. Accept ste as the choice for Simplified Technical English. Use none when the user omits the Proofs format.

When the user explicitly asks for a diagram, put Diagram after Proofs when Proofs is present. Otherwise, put it after Tasks or Notes.

**Action verbs:** Add, Update, Fix, Remove, Refactor, Migrate, Deprecate
**Topic categories:** Breaking Change, Migration Required, Configuration, Dependencies, Performance, Security, Testing, and similar categories

## Workflow

### Step 0: Choose the editorial pass

Collect the editorial pass and Proofs format with the prompt above unless the user already specified them. Use Simplified Technical English by default.

After drafting, apply the selected skill:

- ste: Apply toolkit-simplified-technical-english.
- humanizer: Apply toolkit-humanizer.

Use the skill name. Do not use a filesystem path or external URL.

### Step 1: Detect and validate branches

1. Identify the current branch.
2. Detect the base branch:
   - Check the origin/HEAD default branch.
   - Check common branches: main, master, and develop.
   - Ask the user when the base branch is ambiguous.
3. Validate that both branches exist.

**Git commands:**

```bash
# Current branch
git branch --show-current

# Default base
git symbolic-ref refs/remotes/origin/HEAD 2> /dev/null | sed 's@^refs/remotes/origin/@@'

# Available branches
git branch -r | grep -E 'origin/(main|master|develop)'
```

### Step 2: Gather change information

Collect this information in parallel.

**Commit history:**

```bash
git log [base]..HEAD --format="%h %s%n%b%n---"
```

**Change statistics:**

```bash
git diff [base]...HEAD --stat
git diff [base]...HEAD --name-status
```

**Full diff:**

Read the full diff only when it has fewer than 10,000 lines.

```bash
git diff [base]...HEAD
```

For a larger diff, inspect relevant files. Summarize large refactors. Focus on public API and behavior changes. Skip cosmetic changes in the summary.

### Step 3: Analyze changes

**Overview extraction:**

- Identify the highest-level purpose of the PR in plain language.
- Translate technical changes into the outcome or workflow change they create.
- Do not include code references, file paths, function names, commands, branch names, or implementation details.

**Task categorization:**

- Group files by module or directory.
- Identify functional areas such as auth, API, UI, database, and tests.
- Detect features, updates, fixes, and refactors.
- Use commit messages to confirm intent.
- Create a hierarchical task list.

**Note extraction:**

- Notes are optional. Omit them when nothing needs explanation.
- Scan commits for breaking, deprecated, migration, security, performance, gotcha, configuration, environment, and setup keywords.
- Identify breaking changes from removed exports, changed function signatures, and API changes.
- Detect dependencies from package changes and new imports.
- Detect configuration needs from environment and configuration file changes.

**Diagram assessment:**

- Skip diagrams by default.
- Assess and include a diagram only when the user explicitly asks.
- When requested, detect new component interactions, data flows, API changes, and state-management updates.
- Choose a useful diagram type for the requested change.

### Step 4: Generate Markdown

**Overview section:**

- Put Overview before Tasks.
- Write prose, not bullets.
- Use one short paragraph, usually one to three sentences.
- Explain the work at the highest useful level.
- Write for project managers and teammates who need to know what the PR changes.
- Do not include code references, file paths, function names, endpoint names, component names, commands, branch names, implementation details, or test details.
- For internal work, describe the operational, product, or workflow outcome.

**Tasks section:**

- Use concise bullet points.
- Group related changes.
- Indent sub-items for large scopes.
- Start each item with Add, Update, Fix, Remove, or Refactor.
- Use human-readable product or release language.
- Write a concise changelog, not an implementation inventory.
- Keep tasks at feature or module level. Do not list every detail.
  - Bad: Implement GammaApi client with 17 endpoints (status, teams, sports, tags, events, markets...).
  - Good: Implement GammaApi client.
  - Do not list functions, endpoints, components, file paths, or implementation details unless the name is a user-facing feature.
  - Describe the change, not every part of its implementation.
- Avoid code references in Tasks. Put a necessary file path, function name, or command in Notes only when it affects the reviewer or developer.

**Notes section:**

- Use bold topic headings and one-sentence descriptions.
- Omit Notes when there is no confusing, risky, or actionable context.
- Include only information that affects reviewer understanding, integration, or follow-up action:
  - Breaking changes.
  - Required migrations.
  - Configuration needs, including environment variables and configuration files.
  - New dependencies.
  - Required manual instructions or workflow changes.
  - Non-obvious behavior changes, risks, gotchas, or rollout limits.
  - Performance implications that affect use.
  - Security considerations.
- Do not add a note only because a fact is true. Omit facts that are obvious from Tasks or the diff and need no action.
- Do not add a Testing note only to list normal passing checks.
- Add a Testing note only when testing changes what a reviewer needs to do or know:
  - A required validation could not run.
  - A check is flaky or partial.
  - A risky area has no practical automated coverage.
  - A manual check is required before merge.
- Omit Notes when all requested validations passed normally.
- Exclude implementation details that reviewers can see in code:
  - Bad: Architecture: Uses a result type pattern ({ ok: true, data } | { ok: false, error }).
  - Bad: Implementation: Uses a factory pattern for service creation.
  - Bad: Code structure: Separates concerns into modules.
  - Bad: Configuration: Existing settings are unchanged, unless the reviewer needs that assurance to avoid a likely misunderstanding.
- Focus on required action or context a reviewer could otherwise misread.

**Proofs section:**

- Include Proofs only for the standard or mobile format.
- Omit Proofs for none.
- Put Proofs after Tasks, or after Notes when Notes is present.
- Ask for the Proofs format with the editorial pass when it is unspecified.
- For standard, use this exact table:

  ```markdown
  | Description | Video                 |
  | ----------- | --------------------- |
  | _______     | <video src="______"/> |
  ```

- For mobile, use this exact table:

  ```markdown
  | Description | iOS                   | Android               |
  | ----------- | --------------------- | --------------------- |
  | _______     | <video src="______"/> | <video src="______"/> |
  ```

- Keep placeholders unless the user provides proof descriptions or video URLs.

**Diagram section:**

- Skip Diagram by default.
- Include it only when the user explicitly asks for a diagram.
- Use Mermaid syntax.
- Choose the diagram type:
  - flowchart TD for flows.
  - sequenceDiagram for interactions.
  - classDiagram for structure.
  - stateDiagram-v2 for state changes.
- Keep it concise, with fewer than 15 nodes.
- Label it clearly.
- Show only PR changes, not the full system.

### Step 5: Present and refine

- Before presenting, apply the selected editorial skill. Preserve headings, checklist syntax, tables, placeholders, and any requested diagram.
- Output raw Markdown in a fenced code block labelled markdown.
- Do not output rendered Markdown.
- Verify accuracy with the user.
- Offer refinements when needed.
- Make the result ready to paste into a GitHub PR.

## Examples

### Example 1: Feature addition

**User request:** "Generate PR description for my feature branch"

**Process:**

1. Detect branches: feature/user-auth to main.
2. Find eight commits about authentication.
3. Analyze auth/, api/auth.ts, and components/LoginForm.tsx.
4. Generate:
   - Overview: Adds sign-in and route protection so users can access authenticated product areas securely.
   - Tasks: Add user authentication, Add login form, Add auth middleware.
   - Notes: Requires AUTH_SECRET environment variable. Breaking change: the /login endpoint moved.
   - Choices: Use Simplified Technical English and no Proofs by default. Accept a combined reply such as ste none or humanizer standard.
   - Proofs: Omit Proofs for none. Otherwise, include the selected placeholder table.
   - Diagram: Omit unless requested.

### Example 2: Bug fix

**User request:** "/toolkit-generate-pr-description"

**Process:**

1. Detect branches: fix/memory-leak to develop.
2. Find two commits that fix a memory issue.
3. Analyze utils/cache.ts and tests/cache.test.ts.
4. Generate:
   - Overview: Fixes a cache cleanup problem that caused memory usage to grow over time.
   - Tasks: Fix memory leak in cache. Add cache cleanup tests.
   - Notes: Omit when there is no confusing context, developer action, or risk.
   - Choices: Use Simplified Technical English and no Proofs by default. Accept a combined reply such as ste none or humanizer standard.
   - Proofs: Omit Proofs for none. Otherwise, include the selected placeholder table.
   - Diagram: Omit unless requested.

### Example 3: Refactor

**User request:** "Generate description comparing to main"

**Process:**

1. Detect branches: refactor/api-layer to main.
2. Find 15 commits that restructure the API layer.
3. Analyze api/_, services/_, types/_, and tests/_.
4. Generate:
   - Overview: Reorganizes the API layer so request handling and service logic are easier to maintain.
   - Tasks: Refactor API layer, including service extraction, type updates, and test updates.
   - Notes: Breaking change: import paths changed. Migration: update imports from api/_ to services/_.
   - Choices: Use Simplified Technical English and no Proofs by default. Accept a combined reply such as ste none or humanizer standard.
   - Proofs: Omit Proofs for none. Otherwise, include the selected placeholder table.
   - Diagram: Omit unless requested.

## Best Practices

### Analysis quality

- Read all commits in the range, not only the latest commit.
- Consider file locations for context.
- Check for implicit breaking changes.
- Verify test coverage changes.
- Note dependency updates.

### Description conciseness

- Use one overview paragraph.
- Target five to ten task items.
- Add Notes only when needed.
- Use one sentence per item.
- Write for human reviewers. Skip implementation inventory and filler.
- Use action-oriented language.

### Diagram guidelines

- Add a diagram only when the user explicitly asks.
- Focus on new or changed parts.
- Keep it under 15 nodes.
- Use standard Mermaid syntax.
- Label it clearly.
- Show relationships, not every detail.

### Token efficiency

- Do not fetch a full diff with more than 10,000 lines.
- Summarize large refactors.
- Focus on public API changes.
- Skip cosmetic changes in the summary.
