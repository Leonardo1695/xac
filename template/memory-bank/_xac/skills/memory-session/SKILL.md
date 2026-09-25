---
name: memory-session
description: Opens and closes a work session against the memory bank. Reads the right amount of context at the start, and at the end writes a session page, updates progress, and leaves a handoff for whoever comes next. Use when starting a task, when work pauses, when the user says they are stopping, or when handing off to another agent or session.
---

# Memory session

## Opening

Read in this order, stopping as soon as there is enough to act:

1. `memory-bank/index.md`
2. `memory-bank/handoff.md`
3. `memory-bank/activeContext.md`
4. The rest of the spine
5. Family pages the index marks relevant to this task

Scale to the gap since the last session:

| Gap | Read |
|---|---|
| Same day | the hot set only: `index.md`, handoff, `activeContext.md` |
| Days | above plus `progress.md` and relevant family pages |
| Weeks or unknown | the whole spine, plus the last few `sessions/` pages |

Never open `sessions/`, `tickets/backlog/`, `tickets/archive/`, `_pending/`, `_lint/`, `_index/`, or
`log.md` unless the task is about them, and never open `design/` mocks except for the ticket
being implemented. History and future are fetched when named, not carried by default.

If `handoff.md` has `State: open`, that is the current baton. Summarise it back to the user
in a sentence, act on its next steps, then set `State: accepted`.

If the memory bank is missing or the spine is empty, say so and offer setup from
`memory-bank/_xac/SETUP.md`. Fill the spine from the repo and the user's answers, never from
guesses.

Report what was read in one line. Then start work.

## Closing

Trigger on: work paused, task finished, user says they are stopping, context is about to run
out, or handing off.

First decide whether anything happened. If the session produced no file changes, no decision,
and no discovery, write nothing except a handoff if work is unfinished. A session page for a
session with nothing in it is pure noise.

Otherwise, in order:

1. **Session page** — `memory-bank/sessions/<YYYY-MM-DD>-<short-slug>.md` from
   `memory-bank/_xac/templates/session.md`. Fill Worked on, Outcome, Open, and Candidates. Candidates are
   durable insights with the evidence behind them; empty is normal. Set `expires_at` about
   three months out: session pages are episodic and must decay, and the expiry is what lets
   the audit retire them deterministically.
2. **Progress** — update `memory-bank/progress.md` for anything that landed and verified.
3. **Active context** — overwrite `memory-bank/activeContext.md` with what is true now.
4. **Log** — append one line per milestone reached:
   `## [<ISO8601>] increment-done | <short title>`
5. **Handoff** — if work is unfinished, overwrite `memory-bank/handoff.md` with `State: open`,
   a two or three sentence summary, next steps, open questions, files touched.
6. **Index** — add lines for any new pages.
7. **Candidates** — if the session page lists candidates, follow `memory-maintain` to promote
   them. Do not promote inline while closing; the gate exists for a reason.

Say what was written and where. One short block, not a recital of file contents.

## Boundaries

- Never write a session page for an empty session.
- Never let a session page carry knowledge that belongs in a family page. The session records
  what happened; the family page records what is now true.
- Never append to `activeContext.md`. Overwrite it.
