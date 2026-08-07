# Project brief

This is a private development toolkit and source registry for one developer's recurring work. Nothing in it is published, and nothing is meant to be installed as a dependency. Consumers copy individual files into their own projects and adapt them there.

## Purpose

The repository exists so the same work does not get done twice. It holds interactive automation for tasks that come up often, shareable configuration for new projects, and TypeScript and React Native source that has already been written once and does not need rewriting.

A file belongs here when it is worth copying again. Each one should make sense on its own, because that is how it gets read: alone, in a different project, without the rest of the repository around it.

Everything is written to be shared, and whatever can also serve this repository does. There is no second, repository-specific version of a configuration or a skill when the shareable one already works, and using an artifact in place is the cheapest evidence that it works at all.

## Vocabulary

The repository is organized by category, and those category names are the words the project uses for itself.

Scripts are interactive command-line automation. Configs, workflows, and skills are artifacts written for other repositories, though most of them are in use here as well. Utils, lib, services, components, and hooks make up the source registry, which is standalone code meant to be copied into an application. Docs are reference guides written for people and not tied to any particular application.

## Boundaries

The toolkit is not a library. There is no package entry point, no build output, and no barrel exports. There is no versioning or release process either, since there is nothing to release.

It is also not a framework for the projects that borrow from it. Copied code becomes the consumer's code, and the toolkit does not track it or try to keep it current.

The React Native and Expo material targets the stack the author works in now. Keeping that stack current is intentional, so the registry stays usable in new projects instead of collecting patterns for versions nobody runs.
