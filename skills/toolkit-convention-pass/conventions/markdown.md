# Markdown documents

Apply these rules when you write or edit a Markdown document. They apply to documentation, a guide, a README, and every other `.md` file.

## Do not hard-wrap prose

Keep each paragraph on one line. The editor wraps that line for display. Do not add a line break to hold a line below a column limit.

A hard-wrapped paragraph moves the text of every later line when one word changes. The diff then shows the whole paragraph, and a reviewer cannot see which words changed.

When you edit a document that is hard-wrapped, unwrap it. Join the broken lines of each paragraph, and keep the blank line between paragraphs.

Do not change a line break that carries meaning. A list item, a heading, a code block, a table row, and a deliberate hard break each keep their line breaks.

## Skill files

A `SKILL.md` file is an exception. Its layout can carry meaning for an agent. Do not unwrap, reflow, or normalize such a file. Keep its format until the user or the skill asks for a change.
