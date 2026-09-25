# 1. Enforcement without lifecycle hooks

Date: 2026-08-05
Status: accepted

Revisited 2026-08-22 in [ADR 8](0008-lifecycle-is-conversational.md), against a wider set of
harnesses and a narrower use of hooks. Same conclusion, additional reasons; this record still
stands.

## Context

Skills are not lifecycle-bound. A skill marked `disable-model-invocation: true` loads only when
named; without the flag, the agent decides from the description. Neither guarantees that
session-start reading or session-end capture actually happens.

Cursor project hooks (`.cursor/hooks.json`) do guarantee it — `sessionStart`, `sessionEnd`,
`afterFileEdit`, `beforeShellExecution` and others fire regardless of agent judgment. A four-hook
design was worked out in full before being dropped.

## Decision

No lifecycle hooks. Reading and writing obligations live in always-applied rules; the procedures
live in skills. Enforcement is instructional.

## Consequences

- Zero added latency. `afterFileEdit` and `beforeShellExecution` spawn a process per edit and per
  shell command, which on Windows costs 150–250ms each, repeatedly, for the whole session.
- Capture keeps its judgment. A mechanical `sessionEnd` writer cannot tell a productive session
  from an idle one, so it would write session pages for both — a hook that writes a page every
  session writes pages for sessions where nothing happened, making the noise problem it was
  meant to help with strictly worse.
- Nothing is deterministic. If the agent ignores the rule, nothing catches it. Accepted, because
  the rule-driven trigger was already working in practice before XAC existed; the gap was never
  the trigger, it was the absence of a quality gate on what got written.
- Install surface stays Markdown only. No scripts to audit, no shell portability problems.

## Rejected alternatives

- **Four hooks** (`sessionStart`, `sessionEnd`, `beforeShellExecution`, `afterFileEdit`).
  Rejected on overhead and on pollution, above.
- **Capture-only hooks** (`sessionStart` + `sessionEnd`). Still writes pages for empty sessions,
  and `sessionStart`'s ability to inject context into the turn was never verified.
- **A validator script** run on demand to check frontmatter, index size, and orphan links.
  Deferred rather than rejected: worth revisiting if pages come out malformed in practice, but
  building tooling before observing the failure mode is premature.
- **A single `beforeShellExecution` hook for git gating.** Genuinely low risk since it writes
  nothing to the memory bank, and it would make the permission rules binding rather than
  advisory. Deferred as optional polish, not foundation.
