---
name: memory-maintain
description: Promotes session candidates into durable memory bank pages behind an evidence and filter gate, and audits the bank for contradictions, stale pages, duplicates, and orphans. Use when a session produced insights worth keeping, when the memory bank feels noisy or contradictory, when pages have expired, or when the user asks to clean up or update the memory bank.
---

# Memory maintain

Two jobs, kept separate: **promote** turns fresh candidates into pages, **audit** keeps the
existing bank honest. Never run either inside the middle of a task — both belong at a
milestone, after the work is verified.

## Promote

For each candidate from a session page:

**1. Durability.** Will this still be true and useful next month? If it only described this
afternoon, it stays in the session page.

**2. Evidence.** Every durable claim needs a source: a session page with a bounded quote, a
file path, a command output, an issue link. A claim with no evidence does not get promoted.
This is the line between "the agent suggested it" and "the project believes it".

**3. Filters.** Reject outright:

| Reject | Why |
|---|---|
| Nothing happened this session | Pure retrieval noise |
| A single command succeeded | Operational trivia, not knowledge |
| Version bump or release marker | Belongs in a changelog |
| Transient environment failure | Missing binary, expired token, network down, wrong path — becomes a false constraint |
| Broad negative claim about a tool | Turns false the moment it is fixed, then blocks future work |
| Narrative of one task | `sessions/` already holds chronology |
| A failure since resolved | Record the fix pattern, not the outage |
| Status the user can already see | Belongs in `activeContext.md` or the handoff |

**4. Deduplicate.** Search the bank before writing. If a page already covers this, extend it.
If two pages would overlap heavily, write one broader page instead.

**5. Posture.** `gotchas/`, `notes/` — write and announce. `decisions/`, `rules/`, spine, or
anything pinned — stage to `memory-bank/_pending/` and wait for approval.

**6. Record rejections.** Append to `memory-bank/_pending/rejected.md`:

```
- 2026-08-05 | <candidate in one line> | <filter that caught it>
```

Read this file before promoting. It is what stops the same rejected idea being re-proposed
every week. Keep the most recent fifty entries; drop anything older than six months.

Use `memory-write` for the actual page.

## Audit

Run when the bank feels off, when the user asks, or after a burst of work. Write findings to
`memory-bank/_lint/<YYYY-MM-DD>.md`; keep the last three findings files and delete older
ones. **An empty findings list is a valid and good result** — do not manufacture problems.

Check for:

| Finding | What to look for | Fix |
|---|---|---|
| Contradiction | Two pages making incompatible claims | Verify against the code, supersede the loser |
| Stale | `expires_at` passed, or the page describes code that has since changed | Update or retire |
| Duplicate | Two pages answering the same question | Merge into the broader one, supersede the other |
| Orphan | Index line with no page, or page with no index line | Fix whichever side is missing |
| Sprawl | `index.md` past 200 lines | Build `_index/entities.md` first, then merge narrow pages. Do not just shorten lines |
| Entity index drift | `_index/entities.md` exists but a page's `entities` are missing from it | Rebuild the affected lines |
| Oversized spine | Any spine file past ~100 lines | Shed detail into family pages or the cycle archive; the spine is read hot |
| Noise | `sessions/` dominating the bank | Retire old episodic pages that produced nothing durable |
| Missing entities | Page with an empty `entities` list | Add up to ten searchable nouns |

Cite the exact page paths in every finding. Report findings before changing anything, then
apply the fixes the user approves.

`_index/entities.md` is a grep surface, not a reading surface: one line per entity,
`- <entity> → path, path`, joining the never-loaded tier so its size costs nothing. Build it
only when the sprawl row above fires. Below that threshold `index.md` is the better index, and
a second one is just a second thing to keep true.

## Retire, never delete

- Durable pages are superseded, not removed: set `authority: superseded`, link forward to the
  replacement, leave the page in place.
- Episodic pages past their usefulness can be removed once nothing links to them.
- Never remove or rewrite a `pinned` page without the user saying so.
- An expired page is stale even if pinned. Fix it or retire it; do not leave it looking current.

## Promoting to rules

When a `rules/` page has proved itself across several sessions, propose copying it into
`.cursor/rules/`. Say what it would add and why. Never edit `.cursor/rules/` unprompted —
those files load on every turn, so every added line is a permanent cost the user should agree
to.
