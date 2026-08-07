# Hooks

Behavior tied to the React lifecycle. Where components decide what gets rendered and utilities stay pure, this domain covers what has to subscribe, track, or intervene over time.

Most of it is friction every application eventually runs into: reacting when the app comes back from the background, waiting for input to settle before acting on it, binding refresh gestures to data that is already being fetched, and blocking navigation away from unsaved work while still allowing it once the user has confirmed. None of these are hard. All of them are fiddly enough to get subtly wrong, and none of them are worth rediscovering per project.

Some patterns cannot ship as working code, because they depend on state only the application has. Those arrive as a complete structure with a placeholder where the real source of truth belongs. Permission checking is the clearest case: the shape of the checks and the way they compose is the reusable part, while what feeds them never is. Replacing the placeholder is the first step of adoption rather than a defect in the file.

Hooks stay out of presentation. When one produces something meant for rendering, it hands back props or values rather than markup, and the application decides what to do with them.
