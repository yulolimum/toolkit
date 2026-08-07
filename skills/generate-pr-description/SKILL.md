---
name: generate-pr-description
description: Generate concise, human-readable pull request descriptions from the diff between a base branch and the current branch. Use when creating a pull request, preparing release notes, or summarizing branch work for review.
---

# Generate PR Description

## Overview

This skill analyzes git changes between branches to generate professional, concise PR descriptions following a standardized format. It examines commits, diffs, and change patterns to produce an overview, changelog-style tasks, and notes only when something needs extra explanation, with optional architectural diagrams.

## When to Use This Skill

Invoke this skill when:

- Creating a pull request and need a description
- Want to document changes before creating PR
- Need to summarize branch work for review
- Generating release notes from changes
- Understanding what changed in a branch

## Output Format

The skill generates markdown in this format. Always include `## Overview`. Omit `## Notes` when there are no useful notes.

```markdown
## Overview

[One short prose paragraph summarizing what this PR is about. No code references, file references, function names, commands, or implementation details.]

## Tasks

- [Action verb] [human-readable high-level change]
- [Action verb] [another top-level change]
- [Action verb] [change with sub-items if scope is large]
  - [Sub-item describing specific aspect of parent change]
  - [Another sub-item for the same parent change]

## Notes

- **[Topic Category]**: [One-sentence explanation of confusing context, reviewer risk, or required developer action]

<!-- Include Proofs only when the selected Proofs format is `default` or `mobile`. Omit this section for `none`. -->

## Proofs

| Description | Video                 |
| ----------- | --------------------- |
| _______     | <video src="______"/> |
```

Before generating the description, ask the user which Proofs format to use:

- `none`: omit the Proofs section entirely
- `default`: 2 columns, `Description` and `Video`
- `mobile`: 3 columns, `Description`, `iOS`, and `Android`

If the user explicitly asks for a diagram, append a `## Diagram` section after Proofs when Proofs are included; otherwise append it after Tasks or Notes.

**Action verbs**: Add, Update, Fix, Remove, Refactor, Migrate, Deprecate
**Topic categories**: Breaking Change, Migration Required, Configuration, Dependencies, Performance, Security, Testing, etc.

## Workflow

### Step 0: Load Humanizer

Before drafting the PR description, read and apply the upstream Humanizer instructions at <https://raw.githubusercontent.com/blader/humanizer/refs/heads/main/SKILL.md>. The generated PR description should keep the required structure, but the prose must avoid AI-generated writing patterns, filler, generic note-padding, and stiff phrasing.

### Step 1: Branch Detection and Validation

1. Ask the user which Proofs format to use unless they already specified it:
   - `none`: omit the Proofs section entirely
   - `default`: 2 columns, `Description` and `Video`
   - `mobile`: 3 columns, `Description`, `iOS`, and `Android`
2. Identify current branch
3. Detect base branch automatically:
   - Check `origin/HEAD` default branch
   - Look for common branches (main, master, develop)
   - Prompt user if ambiguous
4. Validate both branches exist

**Git Commands:**

```bash
# Current branch
git branch --show-current

# Default base
git symbolic-ref refs/remotes/origin/HEAD 2> /dev/null | sed 's@^refs/remotes/origin/@@'

# Available branches
git branch -r | grep -E 'origin/(main|master|develop)'
```

### Step 2: Gather Change Information

Collect comprehensive git information in parallel:

**Commit History:**

```bash
git log [base]..HEAD --format="%h %s%n%b%n---"
```

**Change Statistics:**

```bash
git diff [base]...HEAD --stat
git diff [base]...HEAD --name-status
```

**Full Diff:**

```bash
git diff [base]...HEAD
```

### Step 3: Analyze Changes

**Overview Extraction:**

- Identify the highest-level purpose of the PR in plain language
- Translate technical/internal changes into the outcome or workflow change they create
- Do not include code references, file paths, function names, commands, branch names, or implementation details

**Task Categorization:**

- Group files by module/directory
- Identify functional areas (auth, api, ui, database, tests)
- Detect new features, updates, fixes, refactors
- Analyze commit messages for intent
- Create hierarchical task list

**Note Extraction:**

- Notes are optional; skip this whole section if nothing meaningful turns up.
- Scan commits for keywords:
  - "breaking", "deprecated", "migration"
  - "security", "performance", "gotcha"
  - "config", "environment", "setup"
- Identify breaking changes from:
  - Removed functions/exports
  - Changed function signatures
  - API endpoint changes
- Detect dependencies:
  - package.json changes
  - New imports
- Spot configuration needs:
  - .env changes
  - Config file updates

**Diagram Assessment:**

- Skip this by default
- Only assess and include a diagram when the user explicitly asks for one
- If requested, detect architectural patterns:
  - New component interactions
  - Data flow changes
  - API additions/changes
  - State management updates
- Decide diagram type and necessity for the requested diagram

### Step 4: Generate Markdown

**Overview Section:**

- Always include this section before Tasks
- Write prose, not bullets
- Keep it to one short paragraph, usually 1-3 sentences
- Explain the work at the highest useful level
- Audience is project managers or teammates scanning for "what is this about?"
- Do not include code references, file paths, function names, endpoint names, component names, commands, branch names, implementation details, or test details
- If the work is technical or internal, describe the operational, product, or workflow outcome instead of the implementation

**Tasks Section:**

- Use concise bullet points
- Group related changes
- Indent sub-items for large scopes
- Lead with verb (Add, Update, Fix, Remove, Refactor)
- Focus on what changed in human-readable product/release language
- Write this like a concise changelog for a human reviewer, not an implementation inventory
- **Keep tasks at feature/module level - DO NOT enumerate details**
  - ❌ BAD: "Implement GammaApi client with 17 endpoints (status, teams, sports, tags, events, markets...)"
  - ✅ GOOD: "Implement GammaApi client"
  - Don't list specific functions, endpoint names, component names, file paths, or implementation details unless the name is the user-facing feature
  - Tasks describe the change, not every aspect of it
- Avoid code references in Tasks. Put necessary file paths, function names, or command details in Notes only when they affect the reviewer or developer using the change.

**Notes Section:**

- Bold topic headings
- One-sentence descriptions
- Treat Notes as optional. Omit the section entirely when there is nothing confusing, risky, or actionable to explain.
- **Include only information that affects reviewer understanding, integration, or follow-up action:**
  - Breaking changes
  - Migration steps required
  - Configuration needs (env vars, config files)
  - New dependencies
  - Manual instructions or workflow changes developers must know
  - Non-obvious behavior changes, risks, gotchas, or rollout constraints
  - Performance implications that affect usage
  - Security considerations
- **Do not add a note just because a fact is true.** If it is obvious from the Tasks or diff and requires no action, leave it out.
- Do not include a `Testing` note just to list validations that passed. Passing checks are expected and do not affect reviewer understanding, integration, or follow-up action.
- Only include a `Testing` note when the testing status changes what a reviewer should do or know, such as:
  - A required validation could not be run
  - A flaky or partial validation result needs context
  - A risky area has no practical automated coverage
  - A manual verification step is required before merge
- If all requested validations passed normally, omit `## Notes`.
- **EXCLUDE implementation details visible in code:**
  - ❌ BAD: "Architecture: Uses result type pattern ({ ok: true, data } | { ok: false, error })"
  - ❌ BAD: "Implementation: Uses factory pattern for service creation"
  - ❌ BAD: "Code structure: Separates concerns into modules"
  - ❌ BAD: "Configuration: Existing settings are unchanged" unless the reviewer specifically needs that assurance to avoid a likely misunderstanding
- These are visible in code review - don't waste note space on them
- Focus on information that requires developer action or explains something a reviewer would otherwise misread

**Proofs Section:**

- Include this section only when the selected Proofs format is `default` or `mobile`
- Omit the Proofs section entirely when the selected Proofs format is `none`
- Place this section after Tasks, or after Notes when Notes are present
- Ask the user which Proofs format to use unless they already specified it
- For `default`, use this exact table shape:
  ```markdown
  | Description | Video                 |
  | ----------- | --------------------- |
  | _______     | <video src="______"/> |
  ```
- For `mobile`, use this exact table shape:
  ```markdown
  | Description | iOS                   | Android               |
  | ----------- | --------------------- | --------------------- |
  | _______     | <video src="______"/> | <video src="______"/> |
  ```
- Leave placeholders as shown unless the user provides proof descriptions or video URLs

**Diagram Section:**

- Skip this section by default
- Include only when the user explicitly asks for a diagram
- Use mermaid syntax
- Choose appropriate type:
  - `flowchart TD` for flows
  - `sequenceDiagram` for interactions
  - `classDiagram` for structure
  - `stateDiagram-v2` for states
- Keep concise (< 15 nodes)
- Label clearly
- Show only PR changes, not entire system

### Step 5: Present and Refine

- Before presenting, run the full generated PR description through the humanizer guidance while preserving headings, checklist syntax, tables, placeholders, and any requested diagram
- **Output raw markdown wrapped in a markdown code fence** (`markdown ... `)
- This makes the output copy-pastable - user can select and copy the raw markdown syntax directly
- Do NOT output formatted/rendered markdown - output the raw text
- Verify accuracy with user
- Offer refinements if needed
- Ready to paste into GitHub PR

## Examples

### Example 1: Feature Addition

**User request:** "Generate PR description for my feature branch"

**Process:**

1. Detect branches: `feature/user-auth` → `main`
2. Find commits: 8 commits about authentication
3. Analyze files: auth/, api/auth.ts, components/LoginForm.tsx
4. Generate:
   - Overview: Adds sign-in and route protection so users can access authenticated product areas securely.
   - Tasks: Add user authentication, Add login form, Add auth middleware
   - Notes: Requires AUTH_SECRET env var, Breaking: /login endpoint moved
   - Proofs: Ask the user for `none`, `default`, or `mobile`; omit Proofs for `none`, otherwise include the matching placeholder table
   - Diagram: Omitted unless requested

### Example 2: Bug Fix

**User request:** "/generate-pr-description"

**Process:**

1. Detect branches: `fix/memory-leak` → `develop`
2. Find commits: 2 commits fixing memory issue
3. Analyze files: utils/cache.ts, tests/cache.test.ts
4. Generate:
   - Overview: Fixes a cache cleanup problem that caused memory usage to grow over time.
   - Tasks: Fix memory leak in cache, Add cache cleanup tests
   - Notes: Omitted if there is no confusing context, developer action, or risk to explain
   - Proofs: Ask the user for `none`, `default`, or `mobile`; omit Proofs for `none`, otherwise include the matching placeholder table
   - Diagram: Omitted unless requested

### Example 3: Refactor

**User request:** "Generate description comparing to main"

**Process:**

1. Detect branches: `refactor/api-layer` → `main`
2. Find commits: 15 commits restructuring API
3. Analyze files: api/_, services/_, types/_, tests/_
4. Generate:
   - Overview: Reorganizes the API layer so request handling and service logic are easier to maintain.
   - Tasks: Refactor API layer (service extraction, type updates, test updates)
   - Notes: Breaking: Import paths changed, Migration: Update imports from api/_ to services/_
   - Proofs: Ask the user for `none`, `default`, or `mobile`; omit Proofs for `none`, otherwise include the matching placeholder table
   - Diagram: Omitted unless requested

## Best Practices

### Analysis Quality

- Read ALL commits in range, not just latest
- Consider file locations for context
- Check for implicit breaking changes
- Verify test coverage changes
- Note dependency updates

### Description Conciseness

- Target: 1 overview paragraph
- Target: 5-10 task items
- Notes are only added when necessary; omit the section by default
- One sentence per item
- Human reviewer audience (skip implementation inventory and filler)
- Action-oriented language

### Diagram Guidelines

- Only when the user explicitly asks for a diagram
- Focus on new/changed parts
- Keep < 15 nodes
- Use standard mermaid syntax
- Label clearly
- Show relationships, not every detail

### Token Efficiency

- Don't fetch full diff if > 10K lines
- Summarize large refactors
- Focus on public API changes
- Skip cosmetic changes in summary
