---
name: toolkit-update-paseo-base-branch
description: Update the saved base branch for the current Paseo-owned Git worktree. Use when changing or repairing a Paseo workspace base after stacking, merging, renaming, or deleting a branch.
---

# Update Paseo Base Branch

Update the current workspace when the user says, for example, "update my base branch to dev." The request authorizes the two Paseo metadata edits below; do not ask for separate confirmation.

## Preflight

1. Resolve the current Git worktree root and absolute Git directory with `git rev-parse --show-toplevel` and `git rev-parse --path-format=absolute --git-dir`.
2. Require `<git-dir>/paseo/worktree.json`. Stop if it is absent; the current checkout is not a Paseo-owned worktree.
3. Resolve the requested branch to an exact existing branch ref:
   - Keep an existing `refs/heads/...` or `refs/remotes/...` ref as given.
   - Convert `origin/<branch>` to `refs/remotes/origin/<branch>`.
   - For a bare branch name, prefer `refs/remotes/origin/<branch>`, then `refs/heads/<branch>`.
   - If an expected origin ref is missing, run `git fetch origin` once and check again.
   - Reject `HEAD`, commit-only refs, tags, missing refs, and the current branch.
4. Derive the display name by stripping `refs/heads/` or `refs/remotes/<remote>/` from the exact ref.
5. Read `${PASEO_HOME:-$HOME/.paseo}/projects/workspaces.json` and find exactly one active workspace whose `worktreeRoot` resolves to the current worktree root. Stop before editing if the file is missing or the match is absent or ambiguous.

## Update

Preserve every unrelated field and the existing JSON formatting.

1. In `worktree.json`, set:
   - `baseRefName` to the display name.
   - `baseRef` to the exact ref.
2. In the matched `workspaces.json` record, set `baseBranch` to the display name.

Do not rebase, merge, check out, rename, create, delete, or push any Git branch. Do not modify another workspace record.

## Verify

1. Parse both files again as JSON and confirm the three saved values.
2. Verify `baseRef` still resolves with `git show-ref --verify`.
3. Report the old and new base branches and tell the user to quit and reopen Paseo so its in-memory workspace cache reloads.
