# 3. Installer copies and parks conflicts, never overwrites or merges

Date: 2026-08-05
Status: accepted

## Context

XAC must install into fresh projects and upgrade projects already running an earlier, customised
version of the memory bank. Those projects hold accumulated pages, plans, and locally edited rule
files. Existing content is the valuable part — it is why the project has continuity at all — and
losing any of it would be worse than not upgrading.

## Decision

`bin/cli.mjs` creates missing files, skips files that already match, and parks a differing
version alongside the original as `<name>.new`. It never overwrites, never merges, and never
touches memory bank content. Reconciliation is a conversation between the agent and the user via
the `memory-migrate` skill.

## Consequences

- No install path can destroy user content. The worst outcome is an unwanted `.new` file.
- Reconciling a customised rule file costs the user one conversation per upgrade.
- Judgment stays with the pair rather than with a script guessing at a three-way merge.
- Re-runs are idempotent, and an already-parked conflict reports as awaiting reconciliation
  rather than being written again.

## Rejected alternatives

- **Overwrite with a backup directory.** Simpler to implement and easier to reason about, but it
  silently drops local customisation until someone reads the backup — which nobody does.
- **Marker-delimited managed blocks**, rewriting only between sentinel comments. The better
  long-term answer, and worth adding later, but useless for the first upgrade because existing
  installs have no markers to rewrite between.
- **Version-aware migration logic in the installer.** Rejected as script complexity for judgment
  work that an agent handles better with the user present.
