# toolkit-update-paseo-base-branch

Update the base branch saved for the current Paseo worktree.

## What it does

- Verifies the requested Git branch.
- Updates the worktree metadata and matching Paseo workspace record.
- Leaves Git history and branches unchanged.

## How to use

Ask an agent: `Update my base branch to dev.`

Quit and reopen Paseo after the update so it reloads the workspace metadata.
