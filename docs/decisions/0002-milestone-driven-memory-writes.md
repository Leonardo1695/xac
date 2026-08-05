# 2. Memory writes are milestone-driven and never silent

Date: 2026-08-05
Status: accepted

## Context

Two questions had to be answered together: *when* does memory get written, and *how much
autonomy* does the agent have when writing it.

Writing on every turn or every file edit floods the bank with noise. Writing only when the user
asks means it never happens. Writing autonomously and silently is fast but removes the user from
their own project's memory.

## Decision

Writes fire at work milestones: plan approved, increment verified green, decision made, trap
resolved, procedure discovered, idea parked, design approved, work handed off, ticket closed,
cycle finished. Not on messages, edits, tool calls, or chat lifecycle.

Every write uses one of two postures. Cheap and reversible pages — gotchas, notes, sessions,
tickets, designs, progress, active context, log — are written and then reported in the turn.
Consequential ones — decisions, rules, anything pinned, anything in the spine — are staged to
`_pending/` and wait for approval.

## Consequences

- The user can always see what entered the memory bank and can veto it. They stay on top of what
  the agent does without having to write the code.
- Milestones map to things the user already recognises, so the write moments feel like part of
  the work rather than bookkeeping.
- Consequential pages arrive late, only after approval. Accepted: a decision page that lands
  without the decision-maker agreeing is not a record, it is a guess.
- The agent has to judge what counts as a milestone. That judgment is fallible, which is why the
  promotion gate sits behind it.

## Rejected alternatives

- **Full autonomy with an audit trail.** Fastest, and reversible through git. Rejected because it
  removes the user from the loop, which is the one thing this project is trying to preserve.
- **Approval for every write.** Rejected as tedious enough that it would be turned off, and
  turning it off loses everything.
- **IDE-event triggers.** See [ADR 1](0001-no-lifecycle-hooks.md).
