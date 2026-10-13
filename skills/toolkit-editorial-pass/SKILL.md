---
name: toolkit-editorial-pass
description: Apply a selected editorial flavor to prose, documentation, or human-facing messages. Use when the user asks for an editorial pass, invokes editorial-pass, or requests a registered editorial style. Select a named flavor automatically; otherwise present a numbered list of registered flavors. Do not use for code changes.
metadata:
  version: 3
---

# Editorial pass

This file is a registry and orchestration layer, not a source of editorial rules. Flavor instructions live in [references/](./references). Do not read a flavor file until the user has selected it.

## Workflow

1. Determine the flavor.
   - Match an explicitly named flavor against registry names and tags, case-insensitively.
   - When one flavor matches, select it automatically. Do not ask for confirmation.
   - When no flavor is named, present every registered flavor as a precise numbered list and wait for the user's choice. Do not read flavor files before that choice.
   - When a name is unknown or ambiguous, present the numbered list and ask the user to choose.

2. Read only the selected flavor file. Follow its instructions without reading other flavor files or adding their rules to this skill.

3. Identify the intended prose from the user's request and the active conversation. It may be text supplied in the request, a named artifact, or prose created earlier in the session. Use normal judgment and ask a concise question only when the intended prose is genuinely unclear.

4. Apply the selected flavor to prose only. Preserve the user's facts, intent, and requested format. Do not apply an editorial pass to source code unless the user specifically asks to edit prose within it.

## Registry

Each entry provides its reference, purpose, and selection tags.

#### [humanizer.md](./references/humanizer.md)

- Description: Natural, fact-preserving prose that removes common AI-writing patterns.
- Tags: `humanizer`

#### [simplified-technical-english.md](./references/simplified-technical-english.md)

- Description: Controlled technical prose based on a practical subset of ASD-STE100.
- Tags: `simplified-technical-english`, `ste`, `asd-ste100`
