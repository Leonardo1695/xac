# Agent instructions — XAC

This project uses **XAC** (eXtreme Agentic Coding): shared memory and engineering discipline
for coding agents. Continuity lives in `memory-bank/`. Read it before acting and write to it
at work milestones.

## Before starting work

1. `memory-bank/index.md` — what exists
2. `memory-bank/handoff.md` — if `State: open`, that is the current baton
3. `memory-bank/activeContext.md` — current focus
4. The rest of the spine (`projectbrief.md`, `productContext.md`, `systemPatterns.md`,
   `techContext.md`, `progress.md`, `designSystem.md`) when returning cold or the task is broad
5. Only the family pages the index marks relevant. Never load `sessions/`, `tickets/backlog/`,
   `tickets/archive/`, `_pending/`, `_lint/`, or `log.md` unless the task is about them

Verification commands live in `memory-bank/techContext.md`. Run them before reporting anything
as done.

## Write at milestones, not continuously

Plan approved, increment verified green, decision made, trap resolved, work handed off, ticket
closed, idea parked, design approved, cycle finished. Not on individual messages, file edits,
or tool calls.

`gotchas/`, `notes/`, `sessions/`, `tickets/`, `designs/`, `progress.md`, `activeContext.md`,
`log.md` — write, then say what was recorded. `decisions/`, `rules/`, and anything pinned —
stage under `memory-bank/_pending/` and wait for approval.

## Non-negotiable

- A page records what was true when it was written. Verify against the working tree before
  acting on it. When a page and the code disagree, the code wins and the page needs fixing.
- Not everything that happens deserves a page. Transient environment failures, successful
  single commands, and one-off task narratives do not.
- Never delete a durable page. Supersede it and link forward.
- Never commit, open a PR, mutate git state, or write to a database without being asked.
- No agent touches production.

## Full rules

`.cursor/rules/` holds the complete instruction set: `core.mdc`, `memory-bank.mdc`,
`engineering.mdc`, `agent-permissions.mdc`. `.cursor/skills/` holds the detailed procedures.
Read the rules directory if your harness does not load it automatically.
