# 5. Tickets move through three horizon directories

Date: 2026-08-05
Status: accepted

## Context

A flat `tickets/` family works for a young project and becomes a pile within weeks. Growing
projects need sprints and epics, a home for ideas that are not scheduled, and history that
does not hoard a file per finished ticket forever.

## Decision

Directory is the lifecycle state: `tickets/backlog/` for unscheduled ideas and future work,
`tickets/active/` for the current cycle, `tickets/archive/` for one summarized page per
closed cycle. Nothing nests deeper.

Grouping lives in frontmatter, not in more directories: `type: ticket | epic` (an epic is a
ticket page that groups others), `cycle:` for the iteration label, `epic:` for the parent
link.

Closing a cycle compresses: finished tickets collapse into a single archive page holding one
line per ticket plus links to the decisions and gotchas produced, then the individual files
are deleted — only from an exact list the user approved. Unfinished tickets are resolved one
by one with the user: carry forward or return to backlog. Ideas are captured only on the
user's yes, offered when one is parked in passing.

## Consequences

- History costs one page per cycle regardless of how many tickets shipped.
- Compression forces the promote-before-compress check, so durable residue gets its own
  pages before the ticket vanishes — the archive gets links instead of copies.
- Every cycle close includes one approval round for the deletion list. Accepted: the
  deletions are irreversible.
- "Never delete a durable page" needed a stated exception for episodic tickets, now written
  into `memory-bank.mdc`, so future agents do not read the two rules as contradicting.

## Rejected alternatives

- **Per-cycle subdirectories under `active/`.** Archived cycles make them redundant — active
  only ever holds the current one.
- **A separate `tickets/epics/` directory and template.** Sprints and epics are different
  axes; encoding both as directories forces a ticket to be in two places at once.
- **Keep all ticket files with `authority: historical`.** Nothing is lost, but the pile
  growth is exactly what the trim was asked for.
- **Delete automatically once the summary is written.** Faster, and irreversible without a
  check. Rejected for the same reason silent writes are.
- **Tracker-only tickets (Linear, GitHub).** Loses the self-contained repo. Kept instead as
  the optional `external_ref:` field on every ticket.
