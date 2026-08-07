# Services

Stateful abstractions that own configuration and hold data. Adopting one means adopting its schema as well, which is the main thing separating this domain from the standalone helpers.

## Schema as the contract

A service is defined by a schema its consumer writes. The schema declares what may be stored and what each key means, and the rest follows from it. Types are derived instead of declared a second time, and any key that is absent, unreadable, or corrupted resolves to its declared default. Callers never deal with a missing value, which is what makes a service safe to read directly during rendering.

Failures are absorbed rather than raised. A failed read returns the default and a failed write warns, because an application should not crash over persistence having a bad day.

## Schema change without migrations

Stored data outlives the code that wrote it, and writing migrations for local caches is rarely worth the effort. A key can instead carry a version, and changing that version discards whatever was stored under the previous one.

The old value is thrown away deliberately, traded for one guaranteed to match the current shape. That trade is right for cached and preference data and wrong for anything a user would miss, and deciding which case a key falls into is the judgment the consumer makes when choosing to version it.

## Two services, not one

Sensitive values get their own service rather than a mode of the general one, because the platform's secure storage differs enough that papering over the difference would mislead. It is asynchronous, offers no reactive path, and clears only the keys its own schema declares instead of emptying the store.

Keeping them separate forces the choice at adoption time. Credentials go one way and application state goes the other, and neither API quietly implies a guarantee it cannot keep.
