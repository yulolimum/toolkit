# Proofs

A proof shows the result to a reviewer who does not run the branch. The section holds one table: a description column, then one column for each proof target.

## Targets

A target is one thing that the reviewer sees evidence for. Step 2 settles the targets before you read this file. These shapes are common:

| Targets      | Columns                          |
| ------------ | -------------------------------- |
| One          | `Description`, `Video`           |
| Two          | `Description`, `iOS`, `Android`  |
| A comparison | `Description`, `Before`, `After` |
| None         | Omit the section.                |

MAACS ships no default set, because the evidence that a pull request carries belongs to the project. A project sets its own targets in its outline or in a requirement file.

## Form

One target:

```markdown
| Description | Video                 |
| ----------- | --------------------- |
| _______     | <video src="______"/> |
```

Two targets:

```markdown
| Description | iOS                   | Android               |
| ----------- | --------------------- | --------------------- |
| _______     | <video src="______"/> | <video src="______"/> |
```

Write one row for each proof. A run with one proof writes one row.

## Placeholders

Keep `_______` and `<video src="______"/>` until the user supplies a description and a URL. Never write a URL that you did not receive. A false URL sends the reviewer to a page that does not exist.

Use `<video src="..."/>` for a recording, because GitHub renders that tag. Use a Markdown image for a still image.

## Placement

Put Proofs after Tasks, or after Notes when Notes appears. Put it before Diagram.
