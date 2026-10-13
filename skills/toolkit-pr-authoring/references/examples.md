# Worked examples

Each example holds a change, the description that fits that change, and the decision that the outline alone does not settle.

## A feature

**Branch.** `feature/user-auth` against `main`. Eight commits change the authentication module, the API layer, and one form component.

```markdown
## Overview

Adds sign-in and route protection, so a user reaches the authenticated parts of the product securely.

## Tasks

- Add user authentication
- Add the login form
- Add route protection

## Notes

- **Configuration**: Requires the `AUTH_SECRET` environment variable in each environment.
- **Breaking Change**: The login endpoint moved, so a client that calls the old path fails.
```

**The decision.** The branch adds three middleware functions and six endpoints. None of them reaches the Tasks. A reviewer reads the count in the diff, and a teammate needs the feature. `AUTH_SECRET` reaches Notes, because a deployment fails without it.

## A fix

**Branch.** `fix/memory-leak` against `develop`. Two commits change one cache module and its tests.

```markdown
## Overview

Fixes a cache cleanup problem that made memory use grow over time.

## Tasks

- Fix the memory leak in the cache
- Add cache cleanup tests
```

**The decision.** The description carries no Notes section. The fix needs no action from the reviewer. The new tests passed, so a testing item would report normal work. The Overview states the symptom that a user felt, and not the cause in the code.

## A refactor

**Branch.** `refactor/api-layer` against `main`. Fifteen commits restructure the API layer into service and type modules.

```markdown
## Overview

Reorganizes the API layer, so request handling and business logic are easier to maintain.

## Tasks

- Refactor the API layer
  - Extract the services
  - Update the shared types
  - Update the tests

## Notes

- **Breaking Change**: Import paths changed for every consumer of the API modules.
- **Migration Required**: Update each import to the new service modules.
```

**The decision.** Fifteen commits produce one task with three sub-items, because the branch made one change. The import paths reach Notes and not Tasks, because a developer acts on them.
