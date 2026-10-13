# Simplified technical English (STE)

This flavor uses a controlled, literal style based on a practical subset of ASD-STE100. It is for technical prose that must be easy to read and hard to misinterpret. It is not an ASD-STE100 compliance check and does not apply the official controlled dictionary.

## What ASD-STE100 is

ASD-STE100 is a controlled natural language, first released in 1986 as AECMA Document PSC-85-16598. ASD, the AeroSpace and Defence Industries Association of Europe, publishes it. The Simplified Technical English Maintenance Group (STEMG) maintains it. European airlines requested the standard because their maintenance staff read English as a second language. A misread maintenance instruction is a safety event.

The standard removes the two largest sources of misreading. The first is a word that carries more than one meaning. The second is a sentence that permits more than one structure. Most of the rules below follow from those two goals.

The full standard contains 53 writing rules in 9 sections. It supplies a dictionary of approximately 900 approved words. Each approved word has one meaning and one part of speech. The standard also lists approximately 1,200 words to avoid, with a suggested replacement for each. Organizations may define additional approved technical nouns and verbs for vocabulary that the base dictionary does not cover.

The current edition is Issue 9 (January 2025), and it is free to download at https://www.asd-ste100.org/. Use the official standard when exact approved wording matters.

## Terms and vocabulary

- Prefer common, concrete words over formal, rare, or inflated alternatives.
- Give one term one meaning. Use the same term for the same object, state, or action throughout the text. Do not rely on context to disambiguate a word that has several senses.
- Keep a word in one grammatical role when changing its role could confuse the reader. For example, use _backup_ consistently as either a noun or a verb phrase, not both.
- Do not rotate near-synonyms merely to avoid repetition. If _check_ is the intended action, do not alternate it with _verify_, _confirm_, or _review_ unless the actions differ.
- Choose a verb that names the action. Prefer _read_, _remove_, _start_, _stop_, _measure_, or _install_ over vague verbs such as _handle_, _perform_, _manage_, or _address_.
- Replace a phrasal verb with a direct verb when the direct verb is clearer. For example, prefer _read_ to _look at_ and _remove_ to _take out_.
- Avoid idioms, metaphors, slogans, conversational filler, and vague qualifiers such as _easy_, _robust_, _significant_, _soon_, or _as needed_ when they do not state a measurable fact.
- Use a necessary domain term rather than a looser everyday substitute. Define it briefly at first use when the source supplies a definition or the audience needs one. The standard's terminology allowance covers this vocabulary.
- Do not invent an expansion for an abbreviation or a definition for a technical term. Preserve an unfamiliar but necessary term when its meaning is not established by the source.
- Preserve product names, command names, file names, paths, option names, identifiers, and literal values exactly unless the user asks to change them.

## Verb forms and voice

- Keep to the permitted verb forms: imperative, infinitive, simple present, simple past, simple future, and past participle used as an adjective. The standard permits no others.
- Prefer a simple tense when it preserves the meaning. Replace perfect forms such as _has completed_ with _completed_ when the continuing relevance is not part of the meaning.
- Avoid progressive forms and `-ing` verb phrases when a simple verb says the same thing. Retain an `-ing` form only when it is a technical noun or part of a technical noun.
- Do not stack auxiliary verbs or modals when one form states the intended certainty. For example, use _may retry_ rather than _may be able to retry_ when possibility is the intended meaning.
- Use active voice for instructions and procedures. Name the actor when the actor matters to the action.
- Use passive voice only in descriptive text when the actor is genuinely unknown or irrelevant to the reader.
- Do not hide an important actor behind an indefinite subject, a passive construction, or an unclear pronoun.

## Sentence construction

- Put one instruction in each sentence. Split a combined instruction even when the actions occur in sequence.
- Treat 20 words as the maximum for an instruction and 25 words as the maximum for descriptive text. Keep a longer sentence when shortening it would lose a necessary fact, condition, or limit.
- State the subject, verb, article, object, and condition that the reader needs. Do not omit sentence parts merely to save words. The standard warns that omission creates ambiguity rather than clarity.
- Write a condition before the action that depends on it. State the condition directly with words such as _if_, _when_, _before_, or _after_.
- Give each pronoun one clear antecedent. Repeat the relevant noun when _it_, _this_, _they_, or _which_ could refer to more than one thing.
- Keep one main logical relationship in a sentence. Split stacked causes, exceptions, conditions, or contrasts into separate sentences when their connection is hard to parse.
- Avoid dangling modifiers and verb-less fragments. State who performs the action and what the action affects.
- Limit a noun cluster to three stacked modifiers. Rewrite a longer cluster with a preposition, a verb, or a separate sentence.
- Put a warning, prohibition, or limiting condition at the start of its sentence. Do not bury it after several clauses.
- Do not replace vague source language with invented precision. If the source says _soon_ or _as needed_, do not make up a time or threshold.

## Procedures, warnings, and organization

- Start a procedural step with the action the reader must take.
- Put steps in the order that the reader performs them.
- Use a vertical list for three or more steps, conditions, or enumerated items. Do not bury a sequence inside one prose sentence.
- Use a numbered list for an ordered sequence. Use a bulleted list for conditions, options, or related facts that have no required order.
- Keep list items parallel. Start related instructions with verbs in the same form.
- Give each paragraph one topic. Treat six sentences as the maximum, and split a paragraph that combines unrelated information.
- State each alternative and its condition explicitly. Do not use _and/or_ when a list of allowed choices is clearer.
- Mark a safety-critical statement as a warning or caution when that label belongs in the source. State the required action or prohibition before its consequence.

## Technical precision

- Preserve every supported fact, number, unit, range, limit, exception, safety condition, and scope qualifier.
- Keep necessary technical detail. If a shorter sentence would change the meaning, keep the detail and make the surrounding sentence clearer instead.
- Preserve the difference between a requirement, a capability, a permission, a possibility, and a recommendation.
- State what failed, what it affects, and the next action when the source provides that information. Do not add a cause, actor, or remedy that the source does not establish.
- Use exact values and comparisons as written. Do not change _less than_, _at least_, _between_, _unless_, or _only if_ into a different condition.
- Keep quotations, code, commands, configuration values, and externally defined wording unchanged unless the user explicitly asks to edit them.
- Favor clarity and consistency over voice, persuasion, or expressive variation. This flavor is intentionally plain.

## Do not overcorrect

- Do not remove a necessary technical term simply because it is unfamiliar.
- Do not split a sentence in a way that loses the relationship between its condition and its action.
- Do not replace a precise but long phrase with a shorter phrase that is less exact.
- Do not add missing facts, values, definitions, actors, or causal explanations to make the prose sound clearer.
- Do not claim that the result is compliant with ASD-STE100. This flavor applies a practical subset of its writing discipline.

## Examples

| Rule               | Less controlled                                                  | Simplified technical English                                                |
| ------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| One part of speech | "Oil the bearing."                                               | "Apply oil to the bearing."                                                 |
| Direct verb        | "If the import fails, take a look at the logs."                  | "If the import fails, read the logs."                                       |
| Simple tense       | "The service has completed the import."                          | "The service completed the import."                                         |
| Active voice       | "The file is deleted by the cleanup task after validation."      | "The cleanup task deletes the file after validation."                       |
| One instruction    | "Start the service and check the migration status."              | "Start the service. Check the migration status."                            |
| Noun cluster       | "the request retry policy configuration screen"                  | "the screen that configures the retry policy for requests"                  |
| Ellipsis           | "Files not backed up will be lost."                              | "The service deletes each file that it did not back up."                    |
| Explicit condition | "Read the logs if the import fails."                             | "If the import fails, read the logs."                                       |
| Clear reference    | "When the service reads the file, it sends it to the queue."     | "When the service reads the file, the service sends the file to the queue." |
| Modal stacking     | "The user may be able to retry the request."                     | "The user may retry the request."                                           |
| Alternatives       | "Use a password and/or a token to authenticate."                 | "Use a password, a token, or both to authenticate."                         |
| Safety condition   | "Do not start the service when the configuration is incomplete." | "When the configuration is incomplete, do not start the service."           |
