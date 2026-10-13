---
name: toolkit-living-docs
description: Review, update, audit, and scaffold the agent-facing `.agents/docs` system. It includes the registry, project/technical/domain briefs, and agent entry points. Use only for that system. Do not use for README files, user-facing documentation, changelogs, inline comments, or one-off documentation edits unless the user explicitly asks for living docs.
metadata:
  version: 4
---

# Living Docs

Maintain the agent-facing `.agents/docs` system as a compact map of current intent. Write durable, high-level context that helps an agent understand what the project is building and what each domain owns.

## Scope

Use this skill only for agent-facing documentation in `.agents/docs`, its registry, or agent entry points that direct agents to that system. README files, user-facing documentation, changelogs, inline comments, and small standalone documentation edits are outside this skill's scope unless the user explicitly asks to apply Living Docs to them.

## Confirm scaffolding

Treat `.agents/docs/index.md` as the Living Docs scaffold marker. When it exists, work within this documentation system and follow its registry rules. Do not inspect or adopt unrelated documentation structures as alternatives.

If the registry is absent, do not update agent-facing living documentation. Report that the Living Docs scaffold is missing. Scaffolding remains an explicit user decision.

Root pointers and symlinks are part of the preferred scaffold, but a missing pointer does not block a documentation update once the registry exists. Report the setup issue and repair it only when the user asks.

## Review information ownership

Determine the work scope from the user's request, the current session, and repository changes. Use the relevant branch diff as a reminder of changed surfaces. Verify every claim against the current source of truth.

Use the project's own vocabulary and organization as evidence. Check existing documentation against its intended scope. Existing misplaced content is not a precedent. Do not impose a universal documentation taxonomy.

Before you select a brief, decide whether the changed information belongs in living docs. Information does not belong in a brief merely because it remains true over time. Briefs explain project intent, shared technical foundations, and domain concepts, boundaries, ownership, and relationships. Keep operational instructions and detailed behavior with the source documentation that owns them. A high-level summary of local procedures does not make them domain knowledge.

For information that belongs in living docs, identify relevant briefs in the registry by their purpose and scope. Read those briefs for stale or missing knowledge within that scope. A shared topic alone does not make a brief the owner.

Before you create, replace, or retire documentation, make a coverage map. Base it on the user's stated intent, the current repository, and approved source documentation. Identify each concern's primary owner or its reason for exclusion. Source documentation outside living docs can be the owner. Use this map as a completeness check, not a required document structure. When the domain model is ambiguous, present the candidates to the user.

## Update existing documentation

Update a brief only when its content is stale or incomplete within its intended scope. If the relevant briefs remain accurate and complete, leave them unchanged. A review with no edits is a complete outcome.

Treat the repository as the source of truth. A diff helps find affected domains, but it does not determine what the documentation says. Remove information that no longer reflects the project instead of preserving it as history.

If a distinct domain needs a brief but has none, report the gap below. Do not put its details in a broader brief.

Potential documentation: `<domain name>`

Purpose: `<one terse sentence>`

Tags: `<main subjects or workflows>`

Create a new document only when the user explicitly asks for it.

## Scaffold only on request

Scaffolding starts only when the user explicitly requests it. Once requested, create the standard setup without additional clarification questions.

When the user requests scaffolding, use this structure:

- Create `.agents/docs/index.md` from [references/index.md](./references/index.md). Preserve the template guidance above `## Registry`; only the registry section is dynamic.
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

Choose the most specific brief that owns the knowledge. Keep broad briefs focused on shared concepts, boundaries, and relationships. Put knowledge about a distinct area in its own appropriate brief. Do not expand a broad brief merely because that area belongs to the same topic.

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

Use one fourth-level heading per brief with its relative reference or path, followed by a list that holds a `Description:` item and a `Tags:` item. Keep each description terse, limited to purpose and contents, and free of technical detail.

Tags name a document's main subjects or workflows. They route agents to the documents that provide substantial guidance for their task.

- Choose tags from the document's purpose and scope, not from individual terms in its contents.
- Add a tag only when work on that subject or workflow needs the document's core guidance.
- Exclude incidental mentions, supporting details, and prerequisites.
- Use the smallest set that covers the document's main subjects or workflows.
- Reuse an existing tag for the same subject or workflow instead of adding synonyms.
- Review the full tag set whenever an entry changes. Remove tags that no longer meet these rules.

Keep the two items as list items. A formatter that joins prose lines merges two plain lines into one, and a list item survives that.

Treat the template guidance above `## Registry` as stable. Update only the registry entries unless the user explicitly asks to change the template itself.

Do not create a registry in a repository that has not explicitly requested scaffolding. Report it as a scaffolding option instead.

When replacing or retiring existing documentation, complete the coverage review before deleting source documents. Do not assume a broad summary covers distinct durable concerns.

## Apply the editorial pass

After preparing all documentation and registry changes, invoke the `toolkit-editorial-pass` skill and name the Simplified technical English flavor. Apply it to the changed documentation prose, including registry descriptions.

Preserve every supported fact and introduce no new claims. Keep headings, document ordering, registry structure, registry references, and tags intact.

If the editorial pass cannot run, do not claim that it ran. Stop before finalizing documentation changes, report the failed editorial step, and ask the user how to proceed.

## Finish

Review the final changes against the current repository. Confirm that each changed brief remains accurate, high level, and free of stale history and implementation detail. Confirm that each affected registry entry remains accurate. Check that every tag names a main subject or workflow that the brief substantially covers.

Report the documentation that changed, the registry updates, and any potential new domains. If no edits are needed, report that outcome briefly. Do not paste full documents into the conversation unless the user asks for them.
