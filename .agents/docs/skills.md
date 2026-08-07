# Skills

Reusable agent process, kept alongside the other artifacts this repository hands out. A skill is shared and used in place at the same time, which is why there is no separate repository-local skills area.

A skill captures how a kind of task should be done, in enough detail that an agent can follow it and arrive somewhere consistent. That makes it shareable the way a lint configuration is shareable. Another project adopts it whole, and improving it here improves it wherever it went.

Skills sit at the repository root alongside the other copyable artifacts, and the agent directory reaches them through a symlink. The placement groups them with everything else that gets shared, and the symlink puts them where an agent working here expects to find them. Both audiences are served by one copy.

What separates a skill from the source registry is what the artifact becomes. Registry code is copied into an application and runs inside it. A skill is never part of a product. It shapes the work that produces one.
