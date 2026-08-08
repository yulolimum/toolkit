---
name: create-linear-tickets
description: Create and update Linear tickets through the Linear MCP with workspace checks, explicit approval, labels and project prompts, and structured task descriptions. Use when creating, updating, or commenting on Linear tickets.
---

# Create Linear Tickets

Rules for creating and updating Linear tickets. Follow these exactly — they encode the user's hard preferences.

**Keep everything high-level and concise — except Technical Details.** Overview, Description, and Acceptance Criteria should stay brief and avoid over-explaining; say what's needed and stop. Technical Details is the only section where depth is welcome. Beyond brevity, apply the `humanizer` skill so prose reads naturally.

## Assignment

- Always assign newly created tickets **to the authenticated user** (the account the Linear MCP is currently connected as) so they can find them in Linear. This is non-negotiable on every create.

## 0. Never create without explicit approval

**Never automatically create a ticket.** Every ticket requires the user's explicit approval first.

1. Before drafting, **read the upstream Humanizer instructions** at <https://raw.githubusercontent.com/blader/humanizer/refs/heads/main/SKILL.md> and apply its tone and voice guidance to all ticket prose so the draft doesn't read as AI-generated.
2. Run the read-only preflight in Sections 1-3. This is required even when the user only asks for a draft.
3. Present a **draft** of the ticket (title, description following the structure below, and proposed labels/project).
4. **Iterate** with the user on the draft until they're satisfied.
5. Only after the user **explicitly approves** do you call the Linear MCP to create the ticket.

Do not call `save_issue` to create until that approval is given. The same applies to description updates — show the proposed change first when practical.

## 1. Workspace safety (check this FIRST, every time)

The Linear MCP uses a **single auth** — only one workspace is reachable at a time, and you cannot switch it yourself.

Use the current repository context and the team names the MCP reports to determine whether the connected workspace is correct. Do not use hardcoded project, team, product, or workspace mappings.

Before drafting, creating, or updating any ticket:

1. Call `list_teams` to see what's actually reachable in the authenticated workspace.
2. Compare those team names against the project you're currently in. If they clearly belong to a different product/workspace → **STOP immediately. Do not create or modify anything.** Tell the user plainly: "We're in the wrong Linear workspace — I see teams `X`, but this project (`<repo>`) belongs to `Y`. Re-auth with `/mcp` and reconnect to the correct workspace before I proceed."
3. Only continue once the workspace is confirmed correct.

Never guess or create a ticket in whatever workspace happens to be connected.

## 2. Labels (inventory first, always prompt)

Never silently skip labels. When creating a ticket:

- After confirming the workspace, call `list_issue_labels` and paginate until you have the complete set of available labels for the selected team/workspace.
- Check the user's **most recently assigned tickets** for the labels they commonly use (`list_issues` assigned to the user, inspect their labels).
- Build suggestions from the fetched label inventory. Use recent-ticket usage and the ticket's content to rank relevant labels, but only suggest canonical labels that exist in the inventory.
- Never invent or propose a label that was not returned by `list_issue_labels`. Intersect labels found on recent tickets with the current inventory before suggesting them.
- Show the proposed existing labels in the draft and ask the user for approval before applying them.
- If no existing label fits, say so plainly and propose no labels. Ask whether to leave the ticket unlabeled or create a new label.
- If the user names a label that does not exist, explain that it is absent and ask for explicit approval before creating it. Never create a label as part of preflight.

## 3. Projects (always prompt)

Same pattern as labels:

- Check whether the user's recently assigned tickets belong to a **project**.
- Verify a candidate project still exists with `list_projects` or `get_project` before suggesting it.
- Only suggest existing projects returned by Linear. If none fit, say so rather than inventing a project name.
- Ask: "Your recent work is under project `X` — assign this ticket to it?"
- Don't assign a project without confirmation.

## 4. Ticket framing — it's a TASK

Every ticket is written as **a task to be completed**, with the intent of working on it — not an exploratory note or a knowledge dump.

- Do **not** add random context bits that don't belong in a task.
- Only add broader/background context when the user **explicitly asks** for it.

## 5. Description structure

Use these sections in order. Omit a section only if it genuinely doesn't apply.

### Overview

- High-level summary anyone — **engineers and non-engineers (EMs)** — can read to instantly understand what the task is about, without reading the rest.
- **At most one paragraph.** Expand slightly only when truly necessary.

### Description

- The actual task, in depth: what needs to be done, plus the relevant research/reasoning.
- Written for an engineer who needs to understand the problem.
- Some technical detail is fine, but **not overwhelming**. **No code blocks. No file references.**

### Action Items (only when the user asks)

- Checklist bullets the user can check off as they work:
  ```
  - [ ] First step
  - [ ] Second step
  ```

### Technical Details

- The place for depth: as much technical detail as needed, **code blocks allowed**, **file references allowed**, implementation specifics.

### Acceptance Criteria

- Allowed, but keep them **terse and concise** — short, high-level outcomes only.
- **Do not** put implementation details here; those belong in **Technical Details**. Prefer expanding Technical Details over a long acceptance-criteria list.

## 6. After creation — offer to rename the branch

When a ticket is created while working inside a project or repository, **offer** to rename the current git branch to Linear's suggested branch name.

- **Always ask first. Never rename automatically.**
- If the user declines, do nothing — leave the branch as-is.

## 7. Updating tickets

- When asked to **update the description**, rewrite it following the same section rules above.
- Context that does **not** fit the description structure goes in a **top-level comment**, not the description.
  - Comments can be **more technical/freeform**.
  - Example: research or context discovered after starting work → add it as a comment, not by bloating the description.

## MCP notes

- Pass string values directly — use real newlines, not literal `\n`.
- Relevant tools: `list_teams`, `list_issues`, `get_issue`, `save_issue` (create/update), `save_comment`, `list_issue_labels`, `list_projects`, `list_users`.
