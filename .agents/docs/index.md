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
Description: What qualifies as automation here and the interaction contract every script keeps.
Tags: `scripts`, `cli`, `automation`, `prompts`, `caching`, `eas`, `linear`, `clockify`, `media`

#### [workflows.md](./workflows.md)
Description: Reusable GitHub Actions workflows meant to be copied into other repositories.
Tags: `workflows`, `github-actions`, `ci`, `eas`, `preview-builds`, `pull-requests`

#### [configs.md](./configs.md)
Description: Shareable linting, formatting, and EAS configuration, which also governs this repository.
Tags: `configs`, `eslint`, `prettier`, `eas`, `build-profiles`

#### [utils.md](./utils.md)
Description: What makes a helper portable enough to copy on its own, and the rules that keep it that way.
Tags: `utils`, `helpers`, `arrays`, `objects`, `strings`, `dates`, `colors`, `timers`, `search`

#### [lib.md](./lib.md)
Description: Configured instances of third-party libraries.
Tags: `lib`, `mmkv`, `library-setup`

#### [services.md](./services.md)
Description: Typed storage services, their schemas, and the split between general and sensitive data.
Tags: `services`, `storage`, `mmkv`, `secure-storage`, `schema`, `persistence`

#### [components.md](./components.md)
Description: Reusable React Native components for recurring layout and state problems.
Tags: `components`, `react-native`, `images`, `layout`, `query-state`

#### [hooks.md](./hooks.md)
Description: Reusable React and React Native hooks.
Tags: `hooks`, `react`, `react-native`, `app-state`, `authorization`, `debounce`, `navigation`, `refresh`

#### [docs.md](./docs.md)
Description: Reference guides for setting up an environment and understanding delivery and notification systems.
Tags: `docs`, `guides`, `environment-setup`, `eas`, `push-notifications`

#### [skills.md](./skills.md)
Description: Agent skills kept in the repository and shared like the other copyable artifacts.
Tags: `skills`, `agents`, `documentation`
