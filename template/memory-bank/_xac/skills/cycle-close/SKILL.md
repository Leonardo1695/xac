---
name: cycle-close
description: Closes a development cycle — inventories active tickets, resolves unfinished ones with the user, compresses the finished work into one archive page, and deletes the individual ticket pages only after the user approves the exact list. Use only when explicitly asked to close a cycle, sprint, or iteration, or to archive finished work.
disable-model-invocation: true
---

# Cycle close

Turns a finished cycle into one page of history. Tickets are episodic: once shipped, their
durable residue lives in `decisions/` and `gotchas/`, and the tickets themselves compress
into a single archive page. This is the designed decay of episodic pages, not an exception
to "never delete a durable page".

The user says when a cycle is done. Never start this on your own initiative.

## Steps

**1. Inventory.** List `tickets/active/`. For each ticket: its `state`, and whether its
"How we verify it landed" block actually passed. A ticket claiming done without its
verification passing is not done — flag it, never archive it.

**2. Resolve unfinished tickets with the user, one by one.** Carry to the next cycle — stays
in `active/` with the new `cycle:` label — or return to `backlog/` with `state` set back to
`shaped` and `cycle` cleared. Never decide this alone.

**3. Promote before compressing.** Confirm every decision, gotcha, and procedure the
finished tickets produced or reference has its own page. Anything missing gets written or
staged now, before any deletion. Deleting a ticket that holds the only record of a decision
destroys the record.

**4. Write the archive page.** One page from `memory-bank/_xac/templates/cycle-archive.md` at
`tickets/archive/<cycle>.md`: shipped tickets one line each, links to the decisions and
gotchas produced, what slipped and where it went. Links, never copies.

**5. Delete, gated.** Present the exact list of ticket files to be deleted and wait for
approval. This is irreversible, so the apply gate holds: no approved list, no deletion.
Delete only what was approved.

**6. Close out.** Update `progress.md` — the cycle's shipped lines move out, the archive
page holds them now; this is what keeps the spine inside its budget. Update `index.md`,
append a `cycle-closed` line to `log.md`, and refresh `activeContext.md` for the next cycle.

## Boundaries

- Touches `tickets/` and the closeout files above. Nothing else.
- Never deletes from `backlog/`, `archive/`, or any other family.
- Unfinished work never gets archived as if it shipped.
