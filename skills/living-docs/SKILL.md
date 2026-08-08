---
name: living-docs
description: Create, refresh, audit, and scaffold agent-facing living documentation in the `.agents/docs` system, including its registry, project/technical/domain briefs, and agent entry points. Use only for that system. Do not use for README files, user-facing documentation, changelogs, inline comments, or one-off documentation edits unless the user explicitly asks for living docs.
---

# Living Docs

Maintain the agent-facing `.agents/docs` system as a compact map of current intent. Write durable, high-level context that helps an agent understand what the project is building and what each domain owns.

## Scope

Use this skill only for agent-facing documentation in `.agents/docs`, its registry, or agent entry points that direct agents to that system. README files, user-facing documentation, changelogs, inline comments, and small standalone documentation edits are outside this skill's scope unless the user explicitly asks to apply Living Docs to them.

## Confirm scaffolding

Treat `.agents/docs/index.md` as the Living Docs scaffold marker. When it exists, work within this documentation system and follow its registry rules. Do not inspect or adopt unrelated documentation structures as alternatives.

If the registry is absent, do not update agent-facing living documentation. Report that the Living Docs scaffold is missing. Scaffolding remains an explicit user decision.

Root pointers and symlinks are part of the preferred scaffold, but a missing pointer does not block a documentation update once the registry exists. Report the setup issue and repair it only when the user asks.

Determine the work scope from the user's request, the current session, and repository changes. Use the relevant branch diff as a reminder of changed surfaces, then verify every claim against the current source of truth.

Use the project's own vocabulary, organization, and existing documentation as evidence. Do not impose a universal documentation taxonomy.

Inventory the registered documentation and identify every brief that reasonably intersects with the work. Read and review those briefs for stale or missing current-state information. Do not mechanically rewrite unrelated documentation.

Before creating, replacing, or retiring documentation, make a coverage map from the user's stated intent, the current repository, and any approved source documentation. For every durable concern in scope, identify where it is primarily documented: the project brief, the technical brief, a domain brief, or an intentional exclusion. Use this as a completeness check, not a required document structure. When the domain model is ambiguous, advise the user of candidates instead of deciding it unilaterally.

## Update existing documentation

Update relevant briefs directly when their current-state content is stale or incomplete. Keep the work scoped to durable context rather than narrating the recent change.

Treat the repository as the source of truth. A diff helps find affected domains, but it does not determine what the documentation says. Remove information that no longer reflects the project instead of preserving it as history.

When a durable domain has no useful brief, report it without drafting or creating the document:

Potential documentation: `<domain name>`

Purpose: `<one terse sentence>`

Tags: `<likely task triggers>`

Create a new document only when the user explicitly asks for it.

## Scaffold only on request

Scaffolding starts only when the user explicitly requests it. Once requested, create the standard setup without additional clarification questions.

When the user requests scaffolding, use this structure:

- Create `.agents/docs/index.md` from [assets/index.md](./assets/index.md). Preserve the template guidance above `## Registry`; only the registry section is dynamic.
- Create root `AGENTS.md` with only this content:

  ```md
  # Agent Docs

  Read [.agents/docs/index.md](./.agents/docs/index.md).
  ```

- Make root `CLAUDE.md` a relative symlink to `AGENTS.md`, so both agent entry points read the same registry.
- Make `.claude` a relative symlink to `.agents`.
- Keep shareable skills in root `skills/`, then make `.agents/skills` a relative symlink to `../skills` when the project uses repository-local skills.

Use relative symlinks so the setup remains portable across clones.

## Choose the right brief

Use these document roles:

- `project-brief.md` describes the project's purpose, boundaries, vocabulary, and durable direction.
- `technical-brief.md` describes the shared technical foundation, operating or execution model, meaningful dependency roles, conceptual repository organization, and cross-cutting project conventions.
- Domain briefs describe one coherent product, business, or code domain. They cover the domain's purpose, boundaries, essential concepts, and high-level workflows or interactions when useful.

Name domain files after the domain, such as `utilities.md` or `authentication.md`. Do not add a `-brief` suffix to domain file names. “Brief” describes the document's role, not its filename.

Domain boundaries vary by project. They may align with a product area, package, workflow, namespace, or nested feature. Treat repository structure as evidence, not a mandate, and defer to explicit user direction when the intended model is unclear. Do not merge otherwise distinct domains solely to reduce the number of documents. Use an umbrella brief only when the project itself or the user identifies a genuine shared domain.

Keep domain briefs free of global project rules and implementation detail. Keep project-wide engineering conventions in the technical brief. Keep agent operating instructions in the repository's agent instruction files, not in project briefs.

## Write current-state briefs

- Living documentation reflects the current project. It is not a historical record. Do not explain what changed, why it changed, what it replaced, or what an earlier version did.
- Prefer purpose, scope, ownership, vocabulary, and non-obvious relationships over a file catalog or mechanical implementation summary.
- Do not include code blocks, code examples, commands, file paths, direct file references, line references, checklists, to-do lists, changelogs, or status reports in briefs. The registry may use its required relative document references.
- Include future direction only when it is an explicit, durable part of the project's current intent. Keep it high level and omit speculative plans.
- Keep decisions only when they still guide current work. State the active rule or boundary, not the historical reasoning behind it.
- Omit information that is self-explanatory in code or easy to locate through search.
- Use neutral, concise prose. Use headings and lists when they clarify the document or make parallel facts terser. Prefer a concise list for categories, boundaries, conventions, or compact facts that would become denser in a paragraph.
- In technical briefs, explain the operating model and role-level distinctions in tooling or dependencies when they affect how the project is used or maintained. Keep literal commands and detailed inventories in their source documentation.

## Maintain the registry

Treat the registry as part of the documentation, not an afterthought. Update it in the same pass whenever a brief is created, renamed, deleted, or materially re-scoped.

Use one fourth-level heading per brief with its relative reference or path, followed by a `Description:` line and a `Tags:` line. Keep each description terse, limited to purpose and contents, and free of technical detail. Use tags that are likely to appear in a related task.

Treat the template guidance above `## Registry` as stable. Update only the registry entries unless the user explicitly asks to change the template itself.

Do not create a registry in a repository that has not explicitly requested scaffolding. Report it as a scaffolding option instead.

When replacing or retiring existing documentation, complete the coverage review before deleting source documents. Do not assume a broad summary covers distinct durable concerns.

## Humanize the completed draft

After preparing all documentation and registry changes, read the full upstream Humanizer instructions at https://raw.githubusercontent.com/blader/humanizer/refs/heads/main/SKILL.md. Do not rely on a remembered summary of that file.

Apply those instructions as an embedded editorial pass to the changed documentation prose, including registry descriptions. Preserve every supported fact and do not introduce new claims. Use the project's clearly human-authored documentation as the voice sample when available. Otherwise, use a neutral technical reference voice.

Keep meaningful organization intact. Preserve headings, document ordering, registry structure, concise lists, registry references, and tags when they make the content easier to navigate. A Humanizer pass may simplify an artificial label-and-sentence list, but must not flatten a useful list into paragraphs. Rewrite it as a simpler list instead. Do not preserve filler lists, outline-shaped future sections, or list formatting that obscures a simpler sentence.

If the upstream file cannot be read, do not claim that the Humanizer pass ran. Stop before finalizing documentation changes and report the failed editorial step.

## Finish

Review the final changes against the current repository. Confirm that each changed brief remains accurate, high level, and free of stale history and implementation detail. Confirm that each affected registry entry remains accurate and that its tags still route relevant work.

Report only the documentation that changed, the registry updates, and any potential new domains. Do not paste full documents into the conversation unless the user asks for them.
