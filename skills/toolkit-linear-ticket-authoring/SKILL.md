---
name: toolkit-linear-ticket-authoring
description: Draft, create, and update Linear tickets through the Linear MCP. Check the connected workspace first. Propose labels, a project, and an estimate from the user's recent tickets. Write a structured task description. Create nothing without explicit approval. Use when the user asks to create, draft, update, or comment on a Linear ticket, or to change the estimate, labels, project, priority, or assignee of a ticket. Do not use it to read or search tickets. It applies only when an agent writes to Linear.
---

# Linear ticket authoring

The rules in this file record the preferences of the user for Linear tickets.

## Workflow

Do not create a ticket without the explicit approval of the user. Other people can see a ticket as soon as Linear creates it.

1. Check the workspace. Refer to [Check the workspace](#check-the-workspace).
2. Propose labels, a project, and an estimate. Refer to [Propose labels](#propose-labels), [Propose a project](#propose-a-project), and [Propose an estimate](#propose-an-estimate).
3. Write the draft: the title, the description, and the proposed labels, project, and estimate. Refer to [Write the ticket](#write-the-ticket).
4. Apply the `toolkit-editorial-pass` skill with the `simplified-technical-english` flavor to the title and the description. The pass edits prose only.
5. Show the draft to the user. Change the draft until the user is satisfied.
6. After the user explicitly approves the draft, create the ticket with `save_issue`. Set `assignee` to `"me"`, the account that the Linear MCP uses, so that the user can find the ticket in Linear.
7. Offer a branch rename. Refer to [Offer a branch rename](#offer-a-branch-rename).

Steps 1 and 2 are the preflight. The preflight only reads from Linear. Do the preflight even when the user asks only for a draft, because the draft shows the results of the preflight.

## Check the workspace

Do this check first, every time: before you write a draft, create a ticket, or update a ticket.

The Linear MCP uses one authentication. It reaches one workspace at a time, and you cannot change the workspace yourself. The connected workspace can belong to a different product.

1. Call `list_teams` to get the teams in the connected workspace.
2. Compare the team names with the context of the current repository. Do not use a fixed mapping of projects, teams, products, or workspaces. This skill runs in many repositories, and a fixed mapping is correct for only some of them.
3. If the teams clearly belong to a different product or workspace, stop. Do not create or change a ticket. Tell the user:

   > We're in the wrong Linear workspace. I see teams `X`, but this project (`<repo>`) belongs to `Y`. Re-auth with `/mcp` and reconnect to the correct workspace before I proceed.

4. Continue only after the workspace is correct.

Do not guess the workspace. Do not create a ticket in a workspace only because the MCP is connected to it. A ticket in the wrong workspace puts the work of this repository in the workspace of another organization.

## Propose labels

Labels belong to the whole team. A new label changes the set that every member uses, so only the user can approve a new label.

Do not skip labels silently. Propose labels, or state why the draft has none.

1. After the workspace check, call `list_issue_labels`. Read every page until you have all the labels of the team and the workspace. This set is the inventory.
2. Call `list_issues` with `assignee: "me"`. Read the labels on the most recent tickets of the user to find the labels that the user uses often.
3. Rank the labels of the inventory by their use on recent tickets and by the content of the ticket.
4. Propose only labels from the inventory, with the exact names from the inventory. A label on a recent ticket can be absent from the current inventory, so compare each such label with the inventory first.
5. Show the proposed labels in the draft. Apply them only after the user approves them.

If no label in the inventory fits, tell the user. Propose no labels. Ask whether to leave the ticket without labels or to create a new label.

If the user names a label that does not exist, tell the user that the label is absent. Create the label only after the user explicitly approves it. Do not create a label during the preflight.

## Propose a project

Use the same method as for labels.

1. Find the projects of the recent tickets of the user.
2. Before you propose a project, use `list_projects` or `get_project` to check that the project still exists.
3. Propose only a project that Linear returns. If no project fits, tell the user. Do not invent a project name.
4. Ask the user, for example: "Your recent work is under project `X`. Assign this ticket to it?"
5. Assign the project only after the user confirms it.

## Propose an estimate

Each team configures its own estimation, and the MCP does not expose that configuration. `get_team` returns only the ID, the name, and the timestamps. Infer the scale from real data. Do not assume a scale.

1. Call `list_issues` with `assignee: "me"` and `fields: ["estimate", "team"]`. Read the estimates on the recent tickets of the user for the same team. Each estimate comes back as `{value, name}`. The `name` is the label that the team uses for the value, for example `5 Points`.
2. Infer the scale from the values in use:
   - Fibonacci: 1, 2, 3, 5, 8
   - Exponential: 1, 2, 4, 8
   - Linear scale: 1, 2, 3, 4, 5
   - T-shirt sizes: Linear stores them as the numbers 1 to 5
3. Propose only a value that already appears on the tickets of that team. Do not use a value from a scale that the team does not use.
4. If the recent tickets have no estimates, the team most likely turned estimation off. Tell the user. Propose no estimate. Do not guess a scale.
5. Show the proposed estimate in the draft, with one line of reasoning. Apply the estimate only after the user approves it.

Do not send `estimate: 0` unless the tickets of the team show zero as a real value. Most teams reject zero.

### When the user states the estimate

When the user states an estimate, such as "set estimate to 5 points" or "make it a 3", use the value as given. Do not infer a scale. Do not ask for approval of a value that the user just gave.

- Read the number from the words of the user. `estimate` takes a plain number, so "5 points" is `5`. A t-shirt size is its position from 1 to 5 (XS=1 … XL=5).
- Apply the value directly. Object only when the value contradicts the scale of the team, such as a `4` on a Fibonacci team or a size name on a points team. Then tell the user which values the team uses. Do not round the value silently.

## Write the ticket

Write each ticket as a task to complete. The user creates a ticket to work on it, so a ticket is not an exploratory note or a record of knowledge.

- Do not add context that does not belong in a task.
- Add background context only when the user explicitly asks for it.

Separate the intent of the ticket from your suggestions. The agent that implements the ticket often treats each line as a requirement. It then follows the ticket instead of the patterns of the repository and the preferences of the user.

- The intent is firm. It is the task that the ticket must complete, and each requirement that the user states, for example "create a utility function named X". State the intent directly.
- Write the intent as the result that the user wants: what changes, for whom, and when. How to build it goes in Technical Notes & References: as a requirement when the user states it, otherwise as a suggestion.
- Everything that you infer or assume is a suggestion: an approach, a file to change, a name, or a structure. Write it as a suggestion. Do not write it as a command, such as "Create file X" or "Do the following". The implementing agent decides these details from its own research.

Keep the Overview, the Description, and the Expected Outcomes short and high-level. State what is necessary, then stop. State each fact in one section only. Expected Outcomes is the exception: it restates the intended result as short outcomes. Put technical detail in Technical Notes & References.

Do not use em dashes in a title, a description, or a comment. Use a period, a comma, or a colon instead.

Local material is a file that only the author can open. It is a path outside the repository, or a file in the repository that git ignores or does not track. Research notes, plans, and generated bundles are often local. Other readers cannot open local material, so the ticket must not depend on it.

- Write the ticket so that it carries the intent without the local material.
- Do not copy all of the research into the ticket. Use only what the ticket needs. The rules in this section still apply.
- When the user asks for more of the research in Linear, put it in a comment.
- Mention local material only in [Local References](#local-references).

Use the sections below in this order. Omit a section only when it does not apply.

### Overview

- Write a high-level summary: what the task is and why it matters. Every reader, including people who are not engineers, must understand the task from the Overview alone.
- Use plain language. Do not use code identifiers.
- Write one paragraph at most. Make it slightly longer only when necessary.

### Description

- Explain the task in more detail than the Overview: the problem, the intended result, and the reasoning behind it.
- Write it for project managers and clients. Use plain language. Do not use code identifiers.
- Do not include code blocks or file references. Put engineering detail in Technical Notes & References.

### Action Items

- Add this section only when the user asks for it.
- Write a checklist that the user checks off during the work:

  ```markdown
  - [ ] First step
  - [ ] Second step
  ```

### Technical Notes & References

This section is for engineers and for the agent that implements the ticket. That agent does its own research when the work starts, often weeks or months after you write the ticket. Write this section as notes and references for that agent. Keep it concise. Do not write steps for the implementation or for testing, even as suggestions.

- Do not restate the product intent here. The Overview, the Description, and the Expected Outcomes hold it.
- Put each technical requirement that the user states here, and mark it as required. Everything else here is a suggestion.
- Point to the files and the areas of the code that the task affects. If a file moves or someone deletes it before the work starts, the agent finds the correct place during its research.
- Do not give line numbers. Do not name functions or other symbols to point at specific logic. These pointers can go stale before the work starts. They also save nothing, because the agent reads the full file.
- Name a symbol when the ticket is about that symbol, for example a ticket that updates one function.

### Expected Outcomes

- This section is allowed. List only outcomes that are part of the intent. Keep them short and high-level.
- Do not put implementation details here. Put the detail in Technical Notes & References, not in a long list of outcomes.

### Local References

- Add this section only when the ticket is based on local material that exists. Do not create local material for this section.
- Start the section with this line: "These files are on the author's machine. They may not exist for you. The ticket does not depend on them."
- List the absolute path of each file. Write each path in full, even when the paths share a long prefix. Do not shorten a path with `...` or `~`. The author opens each path directly, and a shortened path cannot be opened.

## Offer a branch rename

When you create a ticket inside a repository, offer to rename the current Git branch to the branch name that Linear suggests. The `gitBranchName` field of the ticket holds that name.

- Ask first. Do not rename the branch automatically.
- If the user declines, do nothing. Keep the current branch name.

## Update a ticket

- When the user asks to update the description, write the new description with the rules in [Write the ticket](#write-the-ticket). When practical, show the proposed description before you save it.
- For a change to fields only, such as the estimate, labels, project, priority, or assignee, call `save_issue` on the existing ticket. Do not write the description again. Do not run the full preflight. [Propose an estimate](#propose-an-estimate) still applies to an estimate that the user did not state.
- Put context that does not fit the description structure in a top-level comment with `save_comment`. Do not add it to the description. A comment can be more technical and less structured. For example, put research that you find after work starts in a comment, so that the description stays short.
- Before you save a new description or a comment, apply the editorial pass from step 4 of the [Workflow](#workflow).

## Linear MCP notes

- Pass string values directly. Use real newlines, not the literal characters `\n`.
- This skill uses these tools: `list_teams`, `list_issues`, `get_issue`, `save_issue` (to create and to update), `save_comment`, `list_issue_labels`, `list_projects`, `get_project`, and `list_users`.
