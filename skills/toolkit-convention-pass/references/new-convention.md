# New convention

Create a convention file from a lesson that occurs again. Do not create one for a detail that occurs one time.

## Choose the destination

A convention goes to one of two places, and the choice changes who owns the file and what the registration costs.

**A shared convention** goes to `conventions/` in the MAACS checkout. It applies across clients, and it reaches every project that installs this skill.

**A project convention** goes to `conventions/extensions/` in the installed copy of the skill. It belongs to one project, and it stays there.

Infer the destination from the current directory. The MAACS checkout means a shared convention. A client project means a project convention. Ask the user when the directory does not settle it, or when the user works in the checkout on a rule that only one client needs.

Each destination has a consequence to tell the user before you write:

- A shared convention changes the skill, so `metadata.version` in `SKILL.md` must increase. The version is how the CLI finds an installed copy that is behind. Repository validation then runs against the change.
- A project convention needs no version change, because MAACS owns the version. The registry entry goes in `SKILL.md`, which MAACS owns, so the CLI reports that copy as edited and reconciles the entry at the next update. The convention file itself is the developer's, and an update keeps it. A removal of the skill deletes the whole directory, and the deletion includes that file.

## Keep the convention standalone

A convention file is Markdown that an agent reads in a session. It gives one specification, one constraint, or one correction.

- Write only the content that the agent needs.
- Do not name this skill, the registry, the selection, the tags, or the routing in the body of the convention. Those belong to the skill, not to the convention.
- Treat the time and the method of the reading as behavior outside the file. Do not change the routing or the workflow of the skill, unless the user asks for that change separately.
- Do not turn a preference about reading, such as "always read this one", into a rule inside the body.

## Identify the need

Read the current conversation before you ask the user for an idea.

When the user asks for a convention directly and gives the behavior or the content that they want, treat the request as confirmed. Do not repeat it back, and do not ask whether it is correct. Go to the scope instead.

Without a direct request, infer a candidate only when the user asks to prevent a problem that occurs again, or when a fix shows a rule that applies again. Do not infer a convention from a routine mistake, from one local decision, or from a fact that belongs to one project.

With one inferred candidate, confirm it before you gather the requirements:

1. I think this convention must prevent or guide: `<terse problem>`. Is that correct?

With more than one inferred candidate, give the candidates as a numbered list, and ask the user to choose. With no candidate, ask:

1. What behavior must this convention prevent or guide?

## Clarify the scope

Combine the direct request of the user with the session context that they confirmed. Read the registry for an overlap, and read both destinations. When a file covers the behavior already, say so, and ask whether to extend that file instead.

When a file covers the same subject but states a rule that contradicts the new one, the two are variants. Name the new file `<subject>-<variant>.md`, and keep the existing file unchanged. `commit-seven-rules.md` and a project's own `commit-conventional.md` are such a pair.

Ask a question only when its answer changes the body, the metadata, or a boundary that matters. Put every question in a numbered list, including a single question. Do not ask for information that the user gave already.

Clarify only what stays uncertain:

- The behavior to require or to prevent.
- The task or the code that triggers the rule.
- Each exception and each boundary that matters.
- Whether a short code example removes an ambiguity.

When the scope is clear, ask:

1. Are we ready for the draft?

Do not draft the convention until the user agrees.

## Draft the proposal

Write the prose of the convention in simplified technical English. Invoke the `toolkit-editorial-pass` skill with the `simplified-technical-english` flavor for that pass.

Add a code example only when it makes the rule clearer, and keep the example minimal.

Draft in the conversation. Write no file yet. Give these four parts:

1. **Name**: a file name in lowercase kebab-case.
2. **Description**: one sentence for the registry.
3. **Tags**: focused trigger terms in lowercase. The selection matches against them, so give the languages, the frameworks, the file types, and the actions that must reach this convention.
4. **Convention**: the complete Markdown body.

Then ask for approval. Revise the draft until the user confirms all four parts.

## Create and register

Do this only after the user approves.

1. Read the destination directory for `<name>.md`. Do not overwrite a file that exists. Ask whether to rename the new file or to extend the old one.
2. Create the file in the destination directory.
3. Add an entry to the Registry in `SKILL.md`, in the alphabetical position of its name:

   ```md
   #### [<name>.md](./conventions/<name>.md)

   - Description: <description>
   - Tags: `<tag>`, `<tag>`
   ```

   For a project convention, the path in the link is `./conventions/extensions/<name>.md`.

4. For a shared convention, increase `metadata.version` in `SKILL.md` by one.

Do not commit until the user asks.

## Validate

Check these before you hand the work back:

- The name, the file name, and the registry entry agree.
- The body names no project, no client, no user, no path on a filesystem, and no credential. A shared convention reaches the projects of other clients, so this check is the last point before it does.
- The Markdown is formatted, and you have read it once more.

For a shared convention, run `pnpm validate` in the MAACS checkout, and fix what it reports.
