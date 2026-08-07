# Utils

The most portable layer of the registry. A utility module has to survive being copied on its own into a project that shares nothing else with this one.

## What belongs here

Pure functions and small composition helpers. Nothing that holds state between calls, carries configuration, or has to be constructed before use. Once something needs setting up, it belongs in services instead.

Modules are grouped by subject, one file per subject, and they do not import each other. Whoever copies one file gets everything that file needs. Reuse across modules would be convenient in this repository and costly in every project the code lands in, so it is given up on purpose.

## Portability rules

Being dependency-free is the default, since a dependency is a decision imposed on every project that copies the file. Where a module does take one, it is because reimplementing it would be worse, and the module declares the dependency rather than hiding it behind a shim.

Helpers return new values instead of modifying their arguments and accept readonly inputs when they have no reason to write. A caller can pass whatever it already has without first working out what the helper will do to it.

## Documented edges

A helper here is only worth copying if it can be trusted on sight, so behavior a signature does not reveal gets written down instead of left to be discovered.

The cases that matter are the ones where a helper makes a choice a reasonable caller might not expect: what counts toward a limit, which subset of a format is actually handled, when a fallback comes back and why the helper cannot do better than that, and how ordering treats case and numbers inside strings. Each of those is stated with its reason, because the reason is usually what tells a reader whether the choice suits their situation.
