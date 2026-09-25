# 12. AGENTS.md is the entry point; XAC lives in memory-bank/_xac/

Date: 2026-09-25
Status: accepted

Supersedes [ADR 10](0010-harness-support-is-a-contract.md). Amends
[ADR 3](0003-installer-copies-and-parks-conflicts.md) — the installer now overwrites, but only
inside a directory XAC owns — and [ADR 7](0007-template-directory-separates-product-from-factory.md),
whose payload layout changes.

## Context

XAC ships in Cursor's shape: always-applied rules in `.cursor/rules/*.mdc`, skills in
`.cursor/skills/`, and an `AGENTS.md` router for everything else. ADR 10 planned to widen that
with two skill trees (`.agents/skills/`, `.claude/skills/`) and an instructions file per harness —
more harness-native directories, each a surface to keep in sync.

Meanwhile every target harness now reads a root `AGENTS.md`. Verified 2026-09-25 against vendor
documentation:

| Harness | Root `AGENTS.md` | Follows a file pointer mechanically |
|---|---|---|
| Cursor | read; nested files apply to their subtree | no |
| Claude Code | read natively from v2.1.277, **but only when no `CLAUDE.md` exists**; a `CLAUDE.md` containing `@AGENTS.md` restores it. Re-injected after compaction | yes — `@path` imports are expanded |
| Codex | read, concatenated root-down to the working directory; `AGENTS.override.md` replaces it; **32 KiB cap on the combined chain**, the user's global file included | no |
| OpenCode | read; wins over `CLAUDE.md` when both exist | no — "doesn't automatically parse file references" |

Two consequences follow. Anything that must be in context every session has to be *in*
`AGENTS.md`: a pointer to another file is followed mechanically only by Claude Code, and
everywhere else only if the agent chooses to open it. And a real project usually has its own
`AGENTS.md` already, so the file XAC most needs is the file it can least own.

The installer cannot resolve that. A differing `AGENTS.md` may be the user's own work, an older
XAC version, or both merged together; bytes do not say which. ADR 3 parked conflicts as `.new`,
which keeps content safe but leaves XAC inert until someone merges — and with the rules inside
`AGENTS.md`, every upgrade that touches a rule would re-park the whole file.

## Decision

**`AGENTS.md` is the only harness surface.** XAC's always-on rules and its skill catalog live in
one section of the project's root `AGENTS.md`, between `<!-- xac:begin -->` and
`<!-- xac:end -->`. Nothing ships to `.cursor/`, `.claude/`, `.agents/`, or any other
harness-specific directory.

**Everything else lives in `memory-bank/_xac/`, and XAC owns it:**

```text
memory-bank/_xac/
├── SETUP.md          guided setup and upgrade procedure, for the agent
├── AGENTS.block.md   the section that belongs in AGENTS.md
├── skills/<name>/SKILL.md
├── templates/        page shapes, formerly memory-bank/_templates/
└── modules/          opt-in modules, such as caveman.md
```

The underscore follows `_pending/` and `_lint/`. `memory-bank/rules/` was not an option: it is
already the family for the project's own rule pages.

**The installer copies files and nothing else.** It writes only inside `memory-bank/_xac/`,
creating or overwriting. It never writes outside that directory, never merges, and never deletes;
files in `_xac/` that the payload no longer carries are reported, not removed.

**Setup and upgrade are guided by the agent**, following `SETUP.md` with the user:

1. **Detect** which case this is — fresh project, upgrade of an XAC section already in
   `AGENTS.md`, legacy Cursor-layout XAC (`.cursor/rules/*.mdc`, `.cursor/skills/`), foreign
   memory in some other layout, or a combination.
2. **Summarise before acting.** One list of everything that will be created, changed, migrated,
   or removed — including the exact change to the `AGENTS.md` section — then wait for approval.
3. **Apply** what was approved: place or update the section, add `@AGENTS.md` to an existing
   `CLAUDE.md`, warn about `AGENTS.override.md`, retire legacy files, create the bank's spine and
   directories, and route to `memory-bootstrap` or `memory-migrate` where the case calls for it.
   Opt-in modules are offered here rather than by an installer prompt.
4. **Verify** against a checklist: the section is present exactly once, `AGENTS.md` is within
   Codex's cap, the `CLAUDE.md` import is in place where needed, and nothing was left half-moved.

The markers are a convention for the agent, not for the installer. On upgrade the new
`AGENTS.block.md` has already overwritten the old one, and because `_xac/` is committed,
`git diff` on that file is the exact change XAC made. The agent applies that change to the marked
section — a known diff against a known base, not a guess about whose text is whose.

**The section has a budget.** `AGENTS.block.md` stays under roughly 15 kB, enforced by a test, so
it fits Codex's shared 32 KiB cap with room for the project's own instructions. Procedure that
does not need to be in context every turn moves into the skills.

## Consequences

- One surface works on every harness that reads `AGENTS.md`, which today is all four targets.
  There are no adapters, no per-harness files, and nothing to track when a vendor renames a
  directory. `xac-adapt` is no longer needed.
- The always-on rules are loaded by the harness rather than fetched on the agent's initiative,
  and on Claude Code they survive compaction because the root instruction file is re-injected.
- Native skill discovery is lost. Harnesses no longer load a skill from its description or offer
  `/skill-name`. The catalog in `AGENTS.md` names each skill, when to use it, and whether it is
  named-only; the agent reads the file when the catalog says to. `disable-model-invocation`
  already only worked on Cursor, so the named-only gate is now textual everywhere rather than on
  three harnesses of four.
- `AGENTS.md` becomes the always-on budget. Claude Code's guidance is under about 200 lines per
  instruction file, because adherence falls as they grow. The four rules total about 360 lines today,
  so the diet is a requirement of this change, not an optimisation.
- The installer loses every conflict path. It cannot damage user content because it never writes
  where user content lives. The cost is that edits made inside `_xac/` are overwritten on
  upgrade; `git diff` shows them, and the documented rule is that customisation belongs outside
  `_xac/`.
- Setup is agent work, so it is not deterministic and cannot be unit-tested. The mitigations are
  the summary before acting, the verification checklist, and a test that every path the payload
  mentions exists in the payload.
- Nothing is configured until the user asks. The installer's closing line — ask your agent to read
  `memory-bank/_xac/SETUP.md` — is the only prompt.
- Every existing install changes shape. The upgrade path in `SETUP.md` has to carry legacy
  Cursor-layout projects across, and the version number has to say that this is a breaking change.
- `memory-recall`, the audit, and the never-loaded lists must skip `_xac/`. Otherwise a search for
  `authority` returns skill text, and the audit reports XAC's own files as pages without
  frontmatter.

## Rejected alternatives

- **Two skill trees and an instructions file per harness** — ADR 10's plan. Native skill loading
  on each harness, at the price of four surfaces to keep in sync with vendors who keep moving.
- **Full rules in `_xac/rules/`, `AGENTS.md` as a pointer.** Smallest `AGENTS.md`, but only
  Claude Code follows the pointer mechanically. Elsewhere the always-on guarantee becomes a hope.
- **A nested `AGENTS.md` inside `_xac/`.** Codex reads from the repository root down to the
  working directory and never below it, so it would not load from the root.
- **The installer owns a marker-delimited section of `AGENTS.md`.** Mechanical upgrades, but the
  installer edits a file the user owns, and the first install still has no markers to find.
- **A hybrid** — park `.new` on first install, rewrite between markers once present. Better, and
  still an installer making edits to a user's file. The git diff of `AGENTS.block.md` gives the
  agent the same precision without it.
- **Parking `.new` inside `_xac/` as well.** Every changed skill leaves a `.new` beside it on
  every release: the upgrade noise this change exists to remove, in a directory users are not
  meant to edit.
