# Lib

Configured instances of third-party libraries, kept apart from the code that uses them.

The domain exists so configuration has exactly one home. A library that must be constructed with settings is constructed once here, and everything downstream takes that instance rather than building its own. Changing a setting is then a single edit in a known place, instead of a search for every construction site.

Nothing in this domain holds logic. These files decide how a library is set up, not what gets done with it, which is the line between this domain and services.

Instances are offered downstream as defaults rather than imposed as requirements. Whatever consumes one also accepts a substitute, so part of an application can be pointed at a separately configured instance, or at a stand-in during testing, without touching the shared setup.
