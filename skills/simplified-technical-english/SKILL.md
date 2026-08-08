---
name: simplified-technical-english
description: Apply a Simplified Technical English pass to user-specified prose. Use only when the user explicitly requests STE, ASD-STE100, or a Simplified Technical English rewrite; do not apply it automatically to ordinary writing.
---

# Simplified technical English

Apply these rules only to text the user provides or identifies. This is a general-purpose clarity pass inspired by ASD-STE100. It is not a certified compliance check.

## Preserve the message

- Read the text before rewriting it. Understand what it must still say.
- Preserve every fact, condition, exception, scope limit, number, and safety instruction.
- Do not remove necessary precision to make a sentence shorter. Flag the trade-off instead.
- Do not claim the result is ASD-STE100 compliant.
- Do not apply this pass to creative, persuasive, or marketing prose unless the user asks.

## Write clearly

- Use one term for one concept. Do not rotate synonyms.
- Use common, unambiguous words.
- Prefer active voice. Keep passive voice only when the actor is unknown or irrelevant.
- Use simple present or simple past tense when possible.
- Write one instruction per sentence.
- Keep instructions to 20 words when practical. Keep descriptions to 25 words when practical.
- State the subject, verb, and needed articles. Do not omit words to save space.
- Avoid noun clusters with four or more words. Rephrase them into a clear relationship.
- Keep one topic in each paragraph.
- Use a list for three or more steps or conditions.
- Define an unfamiliar domain term once. Keep necessary technical terms.

## Apply the pass

1. Find ambiguity, vague wording, long sentences, passive voice, complex tense, missing words, and noun clusters.
2. Rewrite only the affected prose.
3. Recheck that the rewrite keeps the original meaning and required precision.

For a rewrite request, return the revised prose only unless the user asks for an audit. For an audit, show each issue, the original text, and the revision in a concise table.

When editing a file or running as an embedded step, preserve code blocks, frontmatter, data, links, and formatting. Change only the prose in scope.
