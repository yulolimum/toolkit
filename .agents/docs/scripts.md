# Scripts

Automation for work that would otherwise be done by hand, repeatedly, from memory. A task belongs here once remembering the exact invocation costs more than writing the prompt for it.

## What a script is

Each script is one file that does one job from start to finish. Scripts share no internal library, do not import from the source registry, and do not depend on each other. That isolation is the point. A script can be read in full, copied out, or run on a machine where none of the rest of the repository is set up.

Category prefixes group scripts by the kind of work rather than by anything they share in code. Development, mobile delivery, time tracking, and personal media tasks each have a prefix, and the prefix is the whole of the relationship.

## Interaction contract

Scripts are conversational by default. They ask for what they need, default each answer to whatever was chosen last time, and remember the new answer for the next run.

Every prompt has a flag that skips it, so an interactive session collapses into a single reproducible command. A script wrapping an expensive external operation shows the command it assembled, confirms before running it, and prints the flag form afterward, which turns an exploratory run into something that can be repeated or handed to someone else.

Anything slow, costly, or irreversible asks first. Scripts that rename or link files refuse an existing target instead of resolving the conflict on the user's behalf. Missing credentials or arguments stop the run immediately and name what is absent, rather than failing halfway through.

## What scripts assume

The machine is expected to already have the external tools a script drives. Installing and maintaining those belongs to environment setup, not here. Credentials come from a local environment file, and no script prompts for or stores one.
