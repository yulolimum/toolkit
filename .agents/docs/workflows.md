# Workflows

Continuous integration authored here for use somewhere else. This repository runs no CI of its own, so nothing in this domain ever executes against it. A workflow is finished when another project can copy it, substitute its own identifiers, and get a working pipeline.

## Why the domain exists

CI configuration tends to get rewritten from scratch on every project and is tedious to get right each time. Keeping a working version here means the next project starts from something already debugged.

Workflows are written as templates. Anything project-specific appears as a named placeholder rather than a value that happens to work for one account, so the substitution step is explicit instead of something a consumer discovers by watching a run fail.

## Preview deployment

The current workflow gives reviewers an installable build of a mobile app for every pull request.

Its organizing constraint is that native builds are slow and expensive while application code changes are neither. The workflow decides what to do by fingerprint, building only the platforms whose native fingerprint changed and reusing an existing build otherwise, while publishing an over-the-air update on every run. A pull request touching only application code gets its changes onto a build that already exists.

Results come back as a comment on the pull request, so a reviewer never has to go looking through the build service for a link.

## Adoption requirements

A consuming repository is expected to be a monorepo with the mobile app in its own workspace, to hold an access token for the build service as a secret, and to pin its runtime the way this repository does. Per-pull-request channels come from the shared build configuration, which reserves a profile for exactly this purpose.
