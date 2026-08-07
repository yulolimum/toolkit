## Project Documentation

Read [.agents/docs/index.md](./.agents/docs/index.md).

## Keep the README current

[README.md](./README.md) catalogs everything in the toolkit. Update it in the same change, whenever you:

- Add, remove, or rename a file in a domain directory.
- Add, remove, or rename an exported function, class, or component.
- Add, remove, or rename a package script.
- Add a domain directory.

Match the format already in the file. Exported types are left out on purpose.

## Run Validations Smartly

Validation command: `pnpm dev:check-code-quality --all`

Execute this command when it is logically appropriate. Don't run it after every iteration. Examples:

- After a feature implementation is fully complete.
- Before staging or committing files.
- When asked by the user.

If changes are necessary, distinguish between simple tweaks (fix) vs things that require full rewrites (surface to user).
