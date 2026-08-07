# New prompt

Create a standalone prompt from a repeatable lesson. Do not create a prompt for a one-off detail.

## Keep the prompt standalone

A registry prompt is a Markdown snippet injected into an agent session. It supplies a focused specification, constraint, or feedback.

- Write only the content the receiving agent needs.
- Do not mention the linter, registry, selection, loading, injection, tags, or routing in the prompt body.
- Treat when and how the prompt enters a session as external behavior. Do not change routing or workflow unless the user asks for that separate change.
- Do not treat an injection preference, such as "unconditionally," as a prompt instruction.

## Identify the prompt need

Read the current conversation before asking for an idea.

Treat a direct prompt request as confirmed when the user states the behavior or content they want. Do not repeat it back or ask whether it is correct. Go to scope clarification instead.

If no direct request exists, infer a candidate only when the user asks to prevent a recurring problem or a fix reveals a reusable rule. Do not infer a prompt from a routine typo, a single local decision, or a fact specific to one project.

If one inferred candidate exists, confirm it before gathering requirements:

1. I think this prompt should prevent or guide: `<terse problem>`. Is that right?

If more than one inferred candidate exists, present the candidates as a numbered list and ask the user to choose. If no candidate exists, ask:

1. What behavior should this prompt prevent or guide?

## Clarify the scope

Combine the user's direct request or confirmed session context. Check `./registry/` for overlap. If an existing file already covers the behavior, explain that and ask whether to extend it instead.

Ask only questions whose answers change the prompt body, metadata, or an important boundary. Every question must use a numbered list, including a single question. Do not ask for information the user already gave or about external injection behavior.

Clarify only what remains uncertain:

- The behavior to require or prevent.
- The tasks or code that should trigger the rule.
- Important exceptions or boundaries.
- Whether a short code example is needed to remove ambiguity.

When the scope is clear, ask:

1. Are we ready for the draft?

Do not draft the prompt until the user agrees.

## Draft the proposal

Use general Simplified Technical English writing rules. Do not claim certified ASD-STE100 compliance.

Write prompt prose in terse Simplified Technical English:

- Use one term for one concept. Do not rotate synonyms.
- Use common, unambiguous words.
- Use active voice and simple tenses.
- State the actor and action. Do not omit needed subjects, verbs, or articles.
- Use one instruction in each sentence.
- Keep instructions to 20 words when practical and descriptions to 25.
- Avoid noun clusters with four or more words.
- Define an unfamiliar domain term once, when needed.
- Use lists for three or more steps or conditions.
- Keep one topic in each paragraph.
- Keep safety conditions, scope limits, and needed precision, even when they make a sentence longer.
- Add a code example only when it makes the rule clearer. Keep it minimal.

Draft in the chat. Do not write files yet. Present these sections:

1. **Name**: a concise, lowercase, hyphenated file name.
2. **Description**: one sentence for the linter registry.
3. **Tags**: focused, lowercase trigger terms.
4. **Prompt**: the complete standalone Markdown snippet.

Then ask for explicit approval. Revise the draft until the user confirms all four parts.

## Create and register

Only after explicit approval:

1. Check whether `./registry/<name>.md` already exists. Do not overwrite it. Ask whether to rename or extend it instead.
2. Create `./registry/<name>.md` with the approved prompt.
3. Add this entry to the linter registry in `./SKILL.md`, using the approved name, description, and tags:

   ```md
   ---

   **<name>**
   `./registry/<name>.md`
   tags: <tag>, <tag>
   <description>
   ```

Do not commit unless the user asks.

## Validate

Before handing off:

- Confirm the name, file name, and registry entry agree.
- Check the prompt for project, client, user, filesystem, credential, or other sensitive identifiers.
- Format and review the changed Markdown.
