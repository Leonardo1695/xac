# 10. Harness support is a contract with reference adapters

Date: 2026-08-22
Status: superseded by [ADR 12](0012-agents-md-is-the-entry-point.md)

Superseded 2026-09-25 before any of it was built. Every target harness reads a root `AGENTS.md`,
so XAC ships one section there instead of a skill tree and an instructions file per harness. The
contract below still describes what XAC needs from a harness; ADR 12 changes how it is met.

## Context

XAC shipped one harness shape: `.cursor/rules/`, `.cursor/skills/`, and an `AGENTS.md` router for
everything else. That is an odd position for a product whose whole claim is that memory travels
with the repository — the memory arrives with `git clone`, but the instructions only speak Cursor
fluently. A Claude Code user gets no skills; a Codex user gets a router file and nothing more.

Supporting more harnesses by hand does not obviously scale. Vendors move: Codex deprecated custom
prompts in favour of skills, Cursor added skills after rules, OpenCode's plugin hooks are partly
experimental. Any list of supported tools is stale by the next release.

Two things make this tractable. First, the surfaces are converging: `SKILL.md` with `name` and
`description` frontmatter is now common across Cursor, Claude Code, Codex and OpenCode, and
`AGENTS.md` is read by several of them. Second, an agent asked to support a new harness can read
that harness's own documentation — which is exactly the work a maintainer would otherwise do by
hand, and which stays current for free.

## Decision

Define what XAC needs from a harness as a contract, ship reference adapters for four, and generate
the rest on demand.

**The contract — five attachment points:**

| Point | What XAC needs | Degrades to |
|---|---|---|
| Instructions | always-loaded rules | rules copied into whatever file the harness reads |
| Procedure | on-demand `SKILL.md` | inlined into the instructions file |
| Open | the session brief is read at start | rule-driven read protocol |
| Close | capture at session end | conversational triggers plus a documented user phrase |
| Gate | `agent-permissions` enforcement | advisory rules |

Given [ADR 8](0008-lifecycle-is-conversational.md), Open, Close and Gate resolve to their degraded
form on every harness today. The contract is defined anyway: it is what makes adapter generation a
specification rather than an improvisation, and it is where a future exception would attach.

**Reference adapters** for Cursor, Claude Code, Codex and OpenCode, on Windows, macOS and Linux.
Verified 2026-08-22, two skill trees cover all four:

- `.agents/skills/<name>/SKILL.md` — Cursor, Codex, OpenCode
- `.claude/skills/<name>/SKILL.md` — Claude Code, and OpenCode reads it too

No single directory covers all four: Claude Code reads only `.claude/skills/`, and neither Cursor
nor Codex reads it. `.cursor/skills/` is retired in favour of `.agents/skills/`.

**Everything else is generated on demand** by an `xac-adapt` skill, which hands the agent the
contract and instructs it to research the target harness's current documentation and fill what
that harness supports.

## Consequences

- Four harnesses work out of the box, and any harness works on request. The supported list stops
  being a maintenance liability, because the unsupported case is a procedure rather than a gap.
- The `.agents/skills/` move is a payload path change, so it is an installer concern and an
  upgrade concern for existing installs, not a free rename.
- Two skill trees mean either two physical copies in a user's project or one tree plus a pointer
  from `CLAUDE.md`. Copies give Claude Code native `/skill-name` invocation and automatic loading;
  a pointer avoids drift between two trees inside someone's repository. Claude Code supports
  symlinks for this, but they need developer mode or elevation on Windows, which rules them out as
  a default. Deferred to implementation.
- `xac-adapt` produces unverified output by construction. The agent is reading documentation and
  writing configuration nobody has tested, which is acceptable for a named, user-invoked skill and
  would not be acceptable for something that ran automatically.
- Nothing happens until someone asks. The skill has to be advertised in the README and in the
  installer's next-steps output or it may as well not exist.
- Frontmatter compatibility holds today and is not guaranteed to hold. `name` and `description`
  are universal; `disable-model-invocation` is Cursor's and is ignored elsewhere, which means the
  eight named-only skills lose their gate on three of the four harnesses.

## Rejected alternatives

- **Cursor-first, `AGENTS.md` for everyone else.** The status quo. Least surface to keep in sync,
  and it leaves the majority of users without skills.
- **Ship adapters for every harness worth naming.** What server-based memory tools do — one
  supports roughly fifteen clients. Rejected: each is a vendor API to track, and this is a
  single-maintainer project whose payload is otherwise inert markdown.
- **Generate everything on demand, ship nothing.** Zero install bloat and zero sync burden, but a
  new user gets a working product only after asking for one. The four reference adapters exist so
  the common case needs no conversation.
- **One skill tree via symlinks.** Cleanest on POSIX, and unavailable by default on the primary
  development platform.
