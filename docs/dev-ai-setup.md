# AI development setup

This guide documents a preferred setup for AI coding tools across projects. It keeps project knowledge close to the project and makes genuinely reusable workflows easy to share.

The setup has three layers:

1. Repository-specific instructions and context.
2. Living documentation that explains the project without becoming a second codebase.
3. Global skills for work that is useful in more than one repository.

## Keep project context with the repository

Keep a repository's AI context in the repository and commit it with the code. Anyone, including an agent, working on a branch sees the same rules, vocabulary, and decisions.

Use one small, tool-neutral entry point at the repository root and point tool-specific files to the same source instead of maintaining copies. A typical layout looks like this:

| Item             | Role                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| `AGENTS.md`      | The starting point for project-wide agent instructions.                 |
| `CLAUDE.md`      | A relative link to the shared instructions for Claude Code.             |
| `.agents/`       | Shared agent material, including the documentation registry.            |
| `.claude/`       | A relative link to `.agents/` when Claude Code needs its own directory. |
| `skills/`        | Version-controlled skills that the project owns and can share.          |
| `.agents/skills` | A relative link to the repository's skills directory.                   |

The exact names depend on the tools a project uses. Keep the information in one canonical place and use links only as aliases. Root instructions stay short: they tell an agent where to find context and record only the rules that apply to every task. Project-specific knowledge belongs in the repository, not in a personal global configuration.

## Use living documentation for durable context

The toolkit-living-docs skill maintains a compact record of a project's current intent. It describes the current state instead of recent history and avoids repeating what is already clear from the source.

The skill starts from a documentation registry. Agents read that map first and then open only the briefs that relate to their task. The briefs cover the project's purpose and boundaries, its technical foundation, and durable domain concepts. This avoids asking every agent to start with one large instruction file.

Use the skill when a project needs its documentation scaffolded, when a completed change affects durable context, or when documentation needs an audit. It keeps the registry current alongside the briefs and leaves user-facing guides as a separate documentation domain.

## Share reusable skills globally

Keep reusable skills in a normal, version-controlled repository first. That makes their source reviewable, lets the owning project exercise them, and keeps their supporting files together. The repository remains authoritative; global links make skills available in each tool.

The global-skills linker creates one directory link for each eligible local skill in the user-level skill directories for Codex, Claude Code, and Cursor. It links skills individually rather than linking an entire directory. Existing matching links stay in place, broken links are cleaned up, and conflicting files or directories are reported rather than replaced.

Run the linker after adding or updating reusable skills. The script runs only when invoked, so it does not watch for changes in the background. Keep broadly applicable workflows global, such as writing, review, or automation patterns. Product rules, repository structure, and team decisions stay local to the repository that owns them.
