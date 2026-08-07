# Configs

One opinionated baseline for new projects. The domain answers a narrow question: when a project starts, what should its linting, formatting, and mobile build configuration look like before anyone has had a chance to form an opinion?

## Dogfooding

The root configuration of this repository re-exports the shared configuration instead of defining its own rules. Every rule handed to another project is one this repository already lives under, which is what keeps the baseline honest.

## Linting philosophy

The rule set is deliberately uneven.

It is permissive about matters of style and about escape hatches out of the type system, on the reasoning that a rule people suppress everywhere mostly teaches people to suppress rules.

It is strict about the things that quietly rot: code left behind after a change, imports that duplicate each other or drift out of order, and type suppressions with no stated reason. Those are cheap to fix while the change is fresh and expensive to untangle later.

## Formatting

Formatting is settled rather than argued. The configuration reaches past source files to package manifests, shell scripts, and utility class ordering, so one command formats a whole project and no file type is left to individual habit.

## Build profiles

The mobile build configuration is organized around inheritance. A base profile holds everything that does not vary, and each named profile extends it with only its differences.

Profiles vary along two axes at once, the release stage and how the build is distributed, so the same stage can go to a store or to internal testers without restating the rest of the setup. One profile is reserved for per-pull-request channels, which is what lets CI produce an isolated channel per review without a separate configuration.

Values a consumer has to supply, such as store account identifiers, appear as placeholders rather than as examples that look plausible enough to leave in place.
