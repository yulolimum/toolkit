# Components

Behavior without design. Each component solves a rendering problem that recurs across applications and stops there, leaving appearance to whatever adopts it.

The boundary is deliberate rather than unfinished. A styled component only travels between projects that share a design system, and these do not. What generalizes instead is the awkward part: measuring something before it can be laid out, sizing content whose dimensions are unknown until it loads, and collapsing several asynchronous results into one decision about what to show.

That last case is where most of the value is. Rendering loading, error, empty, and populated states is a problem every screen has, and the version written inline on each screen is usually subtly different from the last one.

Where a component must render something itself, the defaults stay minimal and every part can be replaced. Content can be handed over as plain text and get reasonable treatment, or swapped out entirely for whatever the application would rather display.
