# 8. Lifecycle is conversational, not mechanical

Date: 2026-08-22
Status: accepted

Extends [ADR 1](0001-no-lifecycle-hooks.md), which rejected lifecycle hooks on overhead and
pollution grounds. This record re-examines that decision against a wider set of harnesses and a
narrower use of hooks, reaches the same conclusion for different reasons, and names the one
exception worth remembering.

## Context

ADR 1 rejected a four-hook design after establishing that a mechanical `sessionEnd` *writer*
cannot distinguish a productive session from an idle one, so it writes pages for both and makes
the noise problem worse.

That argument does not cover every hook. A `SessionStart` hook that only reads and injects writes
nothing and cannot pollute anything. A `Stop` hook that exits non-zero blocks the agent from
finishing and hands the decision back to it, so judgment is preserved and only the *trigger*
becomes deterministic. A survey of Cursor, Claude Code, Codex and OpenCode confirmed all three
capabilities exist, that three of the four take project-level hook configuration that commits with
the repository, and that Codex ships an explicit `commandWindows` override. Hooks would therefore
have travelled with the repo rather than living on one machine — the property that motivates XAC
in the first place.

The question was reopened deliberately, with capture reliability and cross-tool continuity named
as real pains.

## Decision

No lifecycle hooks ship. The events XAC cares about are detected by reading the conversation, not
by intercepting the harness.

Three classes of signal, defined in `memory-session` and pointed at from `memory-bank.mdc`:

- **Session-end language** — "I'm done for today", "let's continue tomorrow", "before I go",
  "pausing here", and the implicit forms, such as the user asking what was accomplished. Treated
  exactly as a session end.
- **Context-pressure observations** — the harness reporting low remaining context, the user
  mentioning compaction or a fresh chat, the agent re-reading files it already read this session.
  Treated as a checkpoint.
- **Handoff signals** — another agent or harness is taking over. Writes the baton.

These are phrased as observations, never as self-measurement: an agent cannot count its remaining
tokens, but it can read "let's wrap up".

`memory-session` gains a **Checkpoint** procedure distinct from Closing — overwrite `handoff.md`
and `activeContext.md`, write nothing else, because the work is not finished. Three canonical user
phrases are documented in the README and `AGENTS.md`: "checkpoint the memory bank", "close the
session", "catch me up".

## Consequences

- **Portability is preserved.** `SKILL.md` and `AGENTS.md` are converging across harnesses —
  `.agents/skills/` is already read by Cursor, Codex and OpenCode. Hook APIs went the other way:
  four config formats, four event vocabularies, four injection mechanisms, two of OpenCode's
  marked experimental, and Claude Code's event list past thirty names. Building the lifecycle
  layer on the diverging surface would have undercut the portability claim it was meant to serve.
- **Maintenance stays bounded.** Four adapters across three operating systems is twelve cells to
  verify against APIs nobody here controls, in a repo that has no automated tests yet. Markdown
  cannot break when a vendor ships a minor version.
- **"Nothing executes" survives.** No auto-running code in a cloned repository, no trust boundary
  to document, no supply-chain surface. This is a real differentiator against server-based memory
  tools, not merely a cost avoided.
- **Capture stays best-effort.** Conversational triggers beat the status quo and lose to a hook.
  An unattended session that dies without warning still loses its capture. Accepted deliberately.
- **False positives become a live risk.** "I'll finish this later" about a sub-task is not a
  session end. The trigger table needs explicit guards, and the existing rule — if nothing
  happened, write nothing — carries more weight than before.

## The acknowledged exception

`PreCompact` is the only lifecycle event with no instructional substitute. An agent cannot know
compaction is imminent; the information does not exist inside the conversation. Every other point
has a substitute that is merely weaker.

The Checkpoint procedure and the context-pressure signals are the compensation, and the
compensation is imperfect. If a single hook is ever shipped, it should be that one, on Claude
Code, and nothing else.

## Rejected alternatives

- **The full four-hook design** — `SessionStart` injection, `PreCompact` flush, `Stop` blocking
  once per session, `PreToolUse` permission gating, implemented as one Node script per event under
  a committed `.xac/hooks/`. Fully specified, including the Windows story and the installer merge
  problem, before being declined on portability and maintenance grounds.
- **`PreCompact` alone.** Still requires the hook runtime, the installer merge path, the trust
  boundary and a per-harness matrix, for one event. Kept on file as the exception above rather
  than shipped.
- **Hooks as an opt-in module**, in the manner of `caveman.mdc`. Optional code is still code that
  has to work on four harnesses and three operating systems, and an option that is rarely
  exercised is an option that is quietly broken. `xac-adapt` can wire hooks on request for a user
  who wants them, without XAC owning or shipping the result.
- **Mode-line state as the primary mechanism.** Retained, but demoted to a visibility aid and
  rendered only when something is outstanding. It makes a missed write visible; it does not make
  the write happen.
