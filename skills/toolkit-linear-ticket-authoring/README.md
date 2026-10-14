# toolkit-linear-ticket-authoring

This skill drafts, creates, and updates Linear tickets through the Linear MCP. It is for a developer who wants each ticket in the correct workspace, with the same structure every time.

## When to use it

Use this skill when you want an agent to create, draft, update, or comment on a Linear ticket. It also covers a change to the estimate, labels, project, priority, or assignee of a ticket.

Do not use it to read or search tickets.

## How to use it

Connect the Linear MCP to the workspace of your project. Then ask your agent for a ticket:

> Use the toolkit-linear-ticket-authoring skill to create a ticket for the login timeout bug.

The skill shows a draft first. Tell the agent what to change until the draft is correct. Then approve the draft. The skill creates the ticket only after your explicit approval.

When you state an estimate, such as "make it a 3", the skill uses your value without a question.

## What it produces

- A Linear ticket that is assigned to you. The description has these sections: Overview, Description, Technical Details, and Expected Outcomes. The description has an Action Items checklist only when you ask for one. The skill writes details that it inferred as suggestions, so they do not override the patterns of your repository. When the ticket is based on research files that only you can open, the description ends with a Local References section. That section lists the paths and states that the ticket does not depend on them.
- Labels, a project, and an estimate. The skill proposes only labels and projects that exist, and only estimate values that your team already uses. The skill applies each one only after your approval.
- An offer to rename your current branch to the branch name that Linear suggests.
- A comment for context that does not fit the description.

## Notes

- If the connected workspace does not match your project, the skill stops. The skill asks you to reconnect the Linear MCP to the correct workspace.
- The skill edits ticket text with the `toolkit-editorial-pass` skill and its `simplified-technical-english` flavor. Install both skills.
