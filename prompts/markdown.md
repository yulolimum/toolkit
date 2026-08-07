# Markdown document conventions

Rules for writing and editing markdown documents (docs, guides, READMEs, and any `.md` file).

## No hard wrapping

Do not hard-wrap prose. Each paragraph is a single continuous line; let the editor soft-wrap it on display. Do not insert manual line breaks to keep lines under some column width.

When editing an existing document that was hard-wrapped, unwrap it: join the broken lines of each paragraph back into one line. Keep the blank line between paragraphs, and leave genuine line breaks alone (list items, headings, code blocks, table rows, and intentional hard breaks).

## Skill files

`SKILL.md` files are an exception. Their layout can carry agent-facing meaning, so do not mechanically unwrap, reflow, or otherwise normalize them. Preserve their established formatting unless the user or the skill itself asks for a change.
