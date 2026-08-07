# Documentation Registry

## How to Read

Read this registry to determine whether documentation applies to the current task. Read a registered document only when explicitly asked or when its description or tags relate to the work. Do not read documentation just because it is available, and do not read unrelated documents.

## How to Update

- Add an entry when a documentation file other than this registry is created.
- Update its entry when the file is renamed or its purpose changes.
- Remove its entry when the file is deleted.
- Use the exact relative file reference or path as the entry heading.
- Keep descriptions terse and limited to the document's purpose and contents. Do not include technical details.
- Use concise tags that are likely to appear in a related task.

### Entry Format

Add each document using this format:

```md
#### [file-name.md](./file-name.md)

Description: Very brief description of the document's purpose and contents.
Tags: `related-topic`, `another-topic`
```

## Registry

#### [project-brief.md](./project-brief.md)

Description: What the toolkit is for, the words it uses for its own parts, and what it deliberately is not.
Tags: `purpose`, `scope`, `vocabulary`, `boundaries`, `overview`

#### [technical-brief.md](./technical-brief.md)

Description: The shared technical foundation: how code runs, how dependencies and tooling are managed, and how agent context is arranged.
Tags: `dependencies`, `catalog`, `toolchain`, `typescript`, `running-scripts`, `tsx`, `zx`, `conventions`, `linting`, `formatting`, `credentials`, `agents`, `symlinks`

#### [scripts.md](./scripts.md)

Description: Standalone command-line automation for recurring work.
Tags: `scripts`, `cli`, `automation`, `prompts`, `caching`, `eas`, `linear`, `clockify`, `media`

#### [workflows.md](./workflows.md)

Description: Copyable GitHub Actions workflows for consumer projects.
Tags: `workflows`, `github-actions`, `ci`, `eas`, `preview-builds`, `pull-requests`

#### [configs.md](./configs.md)

Description: Shareable ESLint, Prettier, and EAS configuration.
Tags: `configs`, `eslint`, `prettier`, `eas`, `build-profiles`

#### [utils.md](./utils.md)

Description: Stateless, independently copyable helper modules.
Tags: `utils`, `helpers`, `arrays`, `objects`, `strings`, `dates`, `colors`, `timers`, `search`

#### [lib.md](./lib.md)

Description: Default instances of configured third-party libraries.
Tags: `lib`, `mmkv`, `library-setup`

#### [services.md](./services.md)

Description: Stateful API and storage abstractions.
Tags: `services`, `api`, `axios`, `http`, `storage`, `mmkv`, `secure-storage`, `tauri`, `schema`, `persistence`

#### [components.md](./components.md)

Description: Unstyled React Native components with reusable rendering behavior.
Tags: `components`, `react-native`, `images`, `layout`, `query-state`

#### [hooks.md](./hooks.md)

Description: React and React Native hooks for lifecycle and interaction behavior.
Tags: `hooks`, `react`, `react-native`, `app-state`, `authorization`, `debounce`, `navigation`, `refresh`

#### [docs.md](./docs.md)

Description: Human-facing, application-agnostic reference guides.
Tags: `docs`, `guides`, `environment-setup`, `eas`, `push-notifications`

#### [skills.md](./skills.md)

Description: Shareable instructions for recurring agent work.
Tags: `skills`, `agents`, `documentation`

#### [prompts.md](./prompts.md)

Description: Focused conventions for recurring agent work.
Tags: `prompts`, `agents`, `comments`, `commits`, `markdown`, `typescript`, `tanstack-query`
