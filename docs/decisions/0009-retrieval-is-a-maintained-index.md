# 9. Retrieval is a maintained index, not a search engine

Date: 2026-08-22
Status: accepted

## Context

XAC's page frontmatter carries `entities`, `authority`, `tier`, `pinned` and `expires_at`. The
same fields, under the same names, exist in server-based memory tools where they are consumed by
code: `authority` becomes a multiplier in a ranking function, `entities` becomes an inverted index
feeding one stream of a reciprocal-rank fusion, `expires_at` drives a scheduled sweep.

In XAC they are read by an agent, or not read at all. Nothing in the rules tells an agent what to
*do* with `authority`. That is the gap between the two designs, and closing it mechanically means
a runtime: a process, an index database, a rebuild path, a test matrix.

A second problem is structural rather than mechanical. `index.md` is capped at 200 lines *and* is
the only discovery surface. Past roughly two hundred pages the cap fights its own purpose, and the
audit's remedy — merge narrow pages — starts destroying distinctions to fit a budget.

Separately, the rules had no recall procedure at all. Twelve skills cover writing, promoting,
auditing and migrating memory. None covers finding it. The read protocol says what to load at
session open and goes silent from there.

## Decision

Retrieval stays declarative. No full-text index, no vectors, no ranking, no fusion, no SQLite.

Four changes instead:

1. **A `memory-recall` skill.** The missing procedure: index, then entity vocabulary, then follow
   `[[links]]` from the nearest hit, then targeted `rg`, then apply the authority order, then
   verify against the working tree before acting.
2. **`authority` becomes an instruction.** On competing hits prefer `canonical` over `active` over
   `historical`; never answer from `do-not-answer-from`; a `superseded` page is a pointer to its
   replacement, not an answer.
3. **Index lines become questions**, phrased as what a future agent would actually type, with an
   optional alias tail for synonyms the page body does not use.
4. **The entity index is deferred behind a trigger.** `_index/entities.md` — a maintained
   `entity → pages` inverted list, living in the never-loaded tier so it is grepped rather than
   read — is not built now. The audit's Sprawl row changes from "merge narrow pages" to "build
   `_index/entities.md` first, then merge" when `index.md` passes its cap.

## Consequences

- Existing frontmatter starts paying for itself without any new machinery. `authority` in
  particular goes from decoration to behaviour for the cost of one rule paragraph.
- The scale ceiling is real and now explicit. This works at the scale Karpathy describes for the
  pattern — roughly a hundred sources, hundreds of pages — and degrades past it. There is no
  ranking, no dedup across hits, and no graceful failure mode when the index outgrows a read.
- Small projects pay nothing for the entity index and large ones grow a second navigation axis
  exactly when the cap starts to bite. The trigger also stops the audit from merging pages purely
  to satisfy a line budget.
- The entity index will be hand-maintained when it does arrive, and hand-maintained indexes drift.
  Drift detection belongs in the audit alongside the orphan check. This is the one retrieval item
  that genuinely wants generated output, and generating it needs the runtime this record declines.
- Recall quality now depends on how well index lines are written. That is a authoring-discipline
  dependency, which is weaker than a search engine and stronger than nothing.

## Rejected alternatives

- **A zero-dependency Node CLI** — `npx xac search|lint|sweep|brief`, with an FTS5 index in a
  gitignored `.xac/`. Verified feasible: Node 22.18 ships `node:sqlite` with FTS5 working, so
  "zero third-party dependencies" would have survived. Rejected because it makes XAC a program
  rather than a schema, and every capability it buys is one the agent can approximate with `rg`.
- **Vectors, decay scoring, and reciprocal-rank fusion.** Correct at scale, and far past what a
  single repository's memory bank reaches. Rejected as engineering ahead of the problem.
- **Building the entity index now.** The habit would form early rather than being retrofitted onto
  a bank that is already large. Rejected because it is the item most likely to rot, and its payoff
  arrives only for projects that most installs will never become.
- **Dropping the entity index permanently** and accepting `index.md` plus grep as the ceiling.
  Rejected as premature in the other direction: it caps how large a useful bank can get, for no
  gain over deferring behind a trigger.
