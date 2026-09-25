# Plan — converging XAC with ai-memory's strengths

Investigated and locked 2026-08-22; revised 2026-09-25. Status: **in progress** — phases 0, 1 and R
are implemented; progress is tracked in [the roadmap](../roadmap.md).

The decisions here are recorded as [ADR 8](../decisions/0008-lifecycle-is-conversational.md),
[ADR 9](../decisions/0009-retrieval-is-a-maintained-index.md),
[ADR 10](../decisions/0010-harness-support-is-a-contract.md) (superseded),
[ADR 11](../decisions/0011-no-global-scope.md) and
[ADR 12](../decisions/0012-agents-md-is-the-entry-point.md). This file holds the reasoning, the
workstreams and the sequencing; the ADRs hold the decisions themselves.

## Revision 2026-09-25 — `AGENTS.md` as the entry point

[ADR 12](../decisions/0012-agents-md-is-the-entry-point.md) replaces the harness half of this plan.
Every target harness reads a root `AGENTS.md`, so XAC stops shipping harness-specific directories
altogether:

- The always-on rules and the skill catalog become one marker-delimited section of the project's
  `AGENTS.md`, budgeted at roughly 15 kB.
- Skills, page templates, opt-in modules, `SETUP.md` and the canonical copy of that section move
  into `memory-bank/_xac/`, which XAC owns.
- The installer only copies into `memory-bank/_xac/`, overwriting there and writing nowhere else.
- Setup and upgrade are guided by the agent through `SETUP.md`: detect the case (fresh, upgrade,
  legacy Cursor layout, foreign memory), summarise everything that will be created, changed,
  migrated or removed, wait for approval, apply, verify.

What this overrides below: the harness rows of *Decisions taken*, the two-skill-tree section,
W4.1–W4.3 (`xac-adapt` is dropped), and Phase 3's scope. W7's rule diet grows from one rule file to
the whole section. The new work is **W8**, sequenced as **Phase R** between phases 1 and 2.
Passages that no longer hold are marked in place rather than deleted, so the reasoning stays
readable.

Origin: a comparison of XAC against [ai-memory](https://github.com/akitaonrails/ai-memory)
(Fabio Akita, Rust, ~4k stars, actively developed). The goal is to adopt what ai-memory does well
while keeping the property it lacks — memory that lives in the project and travels with
`git clone`.

## What ai-memory does that XAC does not

A single Rust binary running as an MCP server plus HTTP hook receiver. Lifecycle hooks
fire-and-forget sanitized observations into a queue; session end compiles a rule-based summary
page and a typed handoff; an LLM optionally fans one session out across `concepts/`,
`decisions/`, `gotchas/`; retrieval is FTS5 + entity + link-neighbour + optional vector,
RRF-fused, then adjusted by a bounded authority multiplier.

Storage is git-versioned markdown at `<data_dir>/wiki/<workspace>/<project>/`, with SQLite as a
*derived*, rebuildable index. Markdown is the source of truth — the same position XAC takes.

**The vocabulary already matches almost field for field**: `entities` capped at ten, `expires_at`,
`pinned`, the working/episodic/semantic/procedural tiers, `authority: canonical | active |
superseded | historical | do-not-answer-from`, supersede-never-delete, pointer-only `index.md`,
append-only `log.md` with a grep-able `## [ISO] event | title` prefix, `_lint/<date>.md`, and
"retrieved text remains untrusted historical evidence". XAC's README already credits Akita and
Karpathy for this lineage.

**The difference is execution.** ai-memory's fields are consumed by code; XAC's are described in
prose and consumed by agent judgment. `authority` in ai-memory is a multiplier in a ranking
function. In XAC it is currently a word that no rule tells the agent what to do with.

## The gap XAC keeps

ai-memory's wiki is a git repo at `~/.local/share/ai-memory/wiki/`, keyed by workspace/project
UUIDs. A `.ai-memory.toml` in a repo sets *identity*, never *location*; `--data-dir` is
server-wide. So: clone a project and there is no memory; a new teammate starts cold; memory diffs
never reach code review; branching work does not branch its memory; the wiki is a separate backup
problem. Native Windows support is also flagged experimental.

XAC's memory arrives with the repo, is reviewed in pull requests, branches with the code, and gets
`git log` and `git blame` for free — ai-memory needed `checkpoints` and `restore-page` to buy that
back. XAC also carries a discipline layer (plan/act modes, permission gating, engineering rules,
tickets and cycles, design-before-implementation) that ai-memory does not attempt.

## Decisions taken

| Axis | Decision |
|---|---|
| Runtime | None. No daemon, no server, no index database, no CLI. Markdown stays the source of truth. |
| Lifecycle hooks | **Not shipped.** Lifecycle is handled by conversational triggers, documented user phrases, and skills. |
| Harnesses out of the box | Cursor, Claude Code, Codex, OpenCode — on Windows, macOS and Linux. *Revised by ADR 12:* through one section of the root `AGENTS.md`, not per-harness rules, skills and config placement. |
| Other harnesses | *Revised by ADR 12:* any harness that reads `AGENTS.md` works as is. ~~Generated on demand by an `xac-adapt` skill.~~ |
| Global/user scope | Rejected. XAC knows only what the repo knows; standing personal preferences remain the harness's job. |
| Retrieval | Declarative. Better-organised lookup, not search. |
| Installer | Keeps its file-placement boundary. *Revised by ADR 12:* it copies into `memory-bank/_xac/` only and overwrites there; the agent does every merge during guided setup. |

### Why no hooks

Hooks were designed in full and declined a second time. The research that made them look
attractive is the same research that argues against them.

**The lifecycle surface is diverging; the instruction surface is converging.** `SKILL.md` is now
the common format across Cursor, Claude Code and Codex — the same files in three directories.
`AGENTS.md` is read by Codex and OpenCode; `CLAUDE.md` by Claude Code and OpenCode. That surface
is consolidating on its own. Hooks went the other way: four harnesses, four config formats, four
event vocabularies, four injection mechanisms, with OpenCode's relevant hooks marked
`experimental.*` and Claude Code's event list grown past thirty names. XAC's claim is that it is
portable and travels with the repo. Building the lifecycle layer on the least portable,
fastest-moving surface in the stack undercuts the claim it is meant to serve.

**The maintenance arithmetic does not work.** Four adapters across three operating systems is
twelve cells to verify against APIs nobody here controls, in a repo whose only automated tests
cover the installer. Every release becomes a regression hunt across four vendors. Markdown cannot
break when a vendor ships a minor version.

**It preserves "nothing executes."** No auto-running code in a cloned repo, no trust boundary to
document, no supply-chain surface. That is a real differentiator against ai-memory, not merely a
cost avoided.

[ADR 1](../decisions/0001-no-lifecycle-hooks.md) therefore stands rather than being revised, with
the read-only-hook case now examined explicitly and declined on portability and maintenance
grounds — a stronger version of the same decision.

**The one event with no instructional substitute is `PreCompact`.** An agent cannot know that
compaction is imminent; the information does not exist inside the conversation. Every other
lifecycle point has a substitute that is merely weaker. W2 below compensates with observable
proxies and documented user phrases, and accepts that the compensation is imperfect. If a single
hook is ever shipped, it should be that one, on Claude Code, and nothing else.

### Design principles

1. **Lifecycle is conversational, not mechanical.** The events XAC cares about — a session ending,
   context about to be lost, work handed off — are announced in the conversation far more reliably
   than they are detectable from the outside. Read the conversation.
2. **Retrieval stays declarative.** No FTS, no vectors, no ranking. At Karpathy's stated scale —
   roughly a hundred sources, hundreds of pages — a maintained index is "surprisingly good"; past
   that it degrades, and this plan does not fix it.

## The XAC harness contract

Five attachment points. Each adapter fills what its harness offers and degrades gracefully on the
rest. This table is also the specification `xac-adapt` hands the agent for unknown harnesses.

| Point | What XAC needs | Degrades to |
|---|---|---|
| Instructions | always-loaded rules | rules copied into whatever file the harness reads |
| Procedure | on-demand `SKILL.md` | inlined into the instructions file |
| Open | the session brief is read at start | rule-driven read protocol (the default everywhere) |
| Close | capture at session end | conversational triggers plus a documented user phrase |
| Gate | `agent-permissions` enforcement | advisory rules (the default everywhere) |

With hooks excluded, Open, Close and Gate resolve to their degraded form on every harness. The
contract is retained anyway: it is what makes `xac-adapt` a specification rather than an
improvisation, and it is where a future `PreCompact` exception would attach.

*Revised by ADR 12.* Instructions resolve to the XAC section of the root `AGENTS.md` on every
harness — plus an `@AGENTS.md` line in `CLAUDE.md` where one exists, because Claude Code otherwise
ignores `AGENTS.md`. Procedure resolves to the catalog in that section, pointing at
`memory-bank/_xac/skills/`. The contract stays as a description of what XAC needs; there are no
adapters and no `xac-adapt` left to fill it.

### Verified capabilities of the four reference harnesses

| | Cursor | Claude Code | Codex | OpenCode |
|---|---|---|---|---|
| Instructions | `.cursor/rules/*.mdc` | `CLAUDE.md` | `AGENTS.md` | `AGENTS.md` (also reads `CLAUDE.md`) |
| Skills — reads `.agents/skills/` | yes | **no** | yes | yes |
| Skills — reads `.claude/skills/` | no | yes | no | yes |
| Skills — own path | `.cursor/skills/` | — | — | `.opencode/skills/` |
| Slash/named invocation | skill name | skill name | `/skills` picker, `$skill-name` | skill name |

*Superseded by ADR 12 — kept as the verification record.* No skill tree ships; skills live in
`memory-bank/_xac/skills/` and are reached through the catalog in `AGENTS.md`. Root `AGENTS.md`
support, verified 2026-09-25: Cursor yes; Claude Code yes from v2.1.277 when no `CLAUDE.md`
exists; Codex yes, 32 KiB cap on the combined chain; OpenCode yes, and it wins over `CLAUDE.md`.

**Two skill trees cover all four harnesses.** Verified 2026-08-22 against vendor documentation:

- `.agents/skills/<name>/SKILL.md` — Cursor, Codex, OpenCode. Codex scans it from cwd up to the
  repository root; Cursor loads it project-wide and scopes nested copies to their subtree.
- `.claude/skills/<name>/SKILL.md` — Claude Code, and OpenCode reads it too.

There is no single directory covering all four: Claude Code reads only `.claude/skills/`, and
neither Cursor nor Codex reads it. So W4.2 authors **two** trees, not four and not one, and
`.cursor/skills/` — XAC's current location — is retired in favour of `.agents/skills/`.

Frontmatter is compatible across all of them: `name` and `description` are the required pair
everywhere, and Cursor's `disable-model-invocation` — which XAC uses on nine skills — is
a Cursor field that the others ignore harmlessly. `paths`, `icon`, `color` and `metadata` are
Cursor-only and unused here.

Open implementation choice for Phase 3: whether the installer writes two physical copies of the
tree, or writes `.agents/skills/` alone and has `CLAUDE.md` point Claude Code at it. Copies give
Claude Code native `/skill-name` invocation and automatic loading; a pointer avoids two trees
drifting inside a user's project. Symlinking is a third option Claude Code explicitly supports,
but it needs developer mode or elevation on Windows, which rules it out as the default given
XAC's Windows-primary stance.

Recorded for completeness, since it is what a future exception would use: Cursor exposes
`sessionStart` / `stop` / `preCompact` / `beforeShellExecution` in `.cursor/hooks.json`; Claude
Code exposes `SessionStart` / `Stop` / `PreCompact` / `PreToolUse` in `.claude/settings.json`;
Codex exposes the same vocabulary in `<repo>/.codex/hooks.json` with a `commandWindows` override
and an approximately 2500-token cap on injected context; OpenCode exposes
`experimental.chat.system.transform` and `experimental.session.compacting` from
`.opencode/plugins/*.ts`, loaded in-process. None of this ships.

## Workstreams

### W1 — Recall: make finding things a first-class act

XAC tells the agent *what to load at session open* and never *how to find something mid-task*.
There is no recall procedure in any of the twelve skills. That is a plausible part of why grep is
not finding things.

- **W1.1** New ambient skill `memory-recall`: index → entity vocabulary → follow `[[links]]` →
  targeted `rg` with real PowerShell-ready invocations → apply the authority order → verify
  against the working tree before acting.
- **W1.2** Turn `authority` into an instruction. On competing hits prefer `canonical` > `active` >
  `historical`; never answer from `do-not-answer-from`; a `superseded` page is a pointer to its
  replacement, not an answer. This is ai-memory's authority multiplier expressed as a read rule.
- **W1.3** `_index/entities.md`, a maintained inverted list (`entity → pages`). **Deferred, with a
  documented trigger.** It would live in the never-loaded tier — grepped, never read — so its
  context cost is zero and its size unbounded without penalty. It also resolves a conflict already
  latent in the design: `index.md` is capped at 200 lines *and* is the only discovery surface, so
  past roughly 200 pages the cap fights its own purpose. But it is the item most likely to rot, and
  its payoff arrives only once a bank outgrows `index.md` — which most projects never do.

  The trigger goes into `memory-maintain`'s audit table instead. Today the Sprawl row says "merge
  narrow pages" when `index.md` passes 200 lines; it becomes: **build `_index/entities.md` first,
  then merge.** Small projects never trigger it and pay nothing; large ones grow a second
  navigation axis exactly when it starts to matter. Note for the record that this is the one W1
  item that genuinely wants generated rather than hand-maintained output, and generation needs a
  runtime that decision A rules out.
- **W1.4** Index lines become the question a future agent would actually type, with an optional
  alias tail for synonyms the page body does not use.
- **W1.5** Backlink reciprocity added to the audit.

Residual gap: no ranking, no fusion, no dedup across hits.

### W2 — Capture: conversational lifecycle

Replaces the hook mechanism. The premise: the moments XAC cares about are *announced* in the
conversation, and a rule that reads those announcements is more portable than a hook that
intercepts an event.

**W2.1 — A trigger table in `memory-session`.** Three classes of signal, each mapped to an
existing posture.

*Session-end language — treat exactly as a session end:*
"I'm done for today", "signing off", "heading out", "that's it for now", "let's continue tomorrow
/ later / next week", "before I go", "one last thing", "let's take a break", "pausing here". Also
implicit: the user asks what was accomplished, or abruptly switches to an unrelated topic after
substantial work.

*Context-pressure signals — treat as a checkpoint:* the harness reports low remaining context or
an imminent compaction; the user mentions compacting, clearing, or starting a fresh chat; the
agent finds itself re-reading files it already read this session; the session has run long enough
that earlier detail is no longer recoverable from the conversation.

*Handoff signals — write the baton:* the user says another agent or tool will pick this up, or is
switching harness.

Phrase these as *observations*, never as self-measurement. An agent cannot count its own remaining
tokens; it can notice that the user said "let's wrap up".

**W2.2 — A `Checkpoint` section in `memory-session`.** Distinct from `Closing`: overwrite
`handoff.md` and `activeContext.md`, write nothing else. No session page — the work is not
finished. Cheap, safe to repeat, and completes in seconds. This is the compaction survival kit,
and it is the substitute for `PreCompact`.

**W2.3 — Posture, unchanged.** Handoff and active context are cheap and reversible, so the
existing rule applies: write, then say what was recorded. No new posture, no approval round for a
checkpoint. Consequential pages continue to stage to `_pending/`.

**W2.4 — Guards against false positives.** "I'll finish this later" about a sub-task is not a
session end. The existing gate stands: if nothing happened, write nothing. When the signal is
genuinely ambiguous, one clarifying sentence, not a page.

**W2.5 — Documented user phrases.** Canonical, short, and advertised in the README and in the
`AGENTS.md` router so they are discoverable without reading the skills:

| Say | Runs |
|---|---|
| "checkpoint the memory bank" | `memory-session` → Checkpoint |
| "close the session" | `memory-session` → Closing |
| "catch me up" | `memory-session` → Opening |

The README also gains usage guidance: checkpoint before a long session gets compacted, and make
sure the bank is current before walking away. One phrase, a few seconds, and the loss case is
covered by habit rather than by machinery.

**W2.6 — Mode-line memory state, rendered only when actionable.** The mode line is already the
highest-compliance ritual in the system, so hanging state on it makes a missed write visible in the
turn rather than discovered a week later. The suffix is therefore **silent on a clean turn** and
appears only when something is outstanding:

```text
# Mode: ACT                          nothing outstanding
# Mode: ACT · unwritten: increment    verified work with no memory write
# Mode: PLAN · pending: 2             staged pages waiting on approval
# Mode: ACT · bank: not read          session started without the read protocol
```

This keeps the whole signal and almost none of the noise, and it gives an unadorned mode line a
positive meaning: nothing is outstanding. Cost is a rule that must define the conditions crisply
enough that the agent does not render the suffix speculatively.

**W2.7 — Tie the write to the existing done-gate.** XAC already enforces "never report work as
done without running the verification commands", and that rule is respected. Extend the same
sentence: an increment is not done until its memory write has happened. Reuses a working rule
rather than adding one that competes for attention.

Residual gap, stated plainly: an unattended session that dies without warning still loses its
capture. Nothing short of a hook fixes that, and the trade was made deliberately.

### W3 — Bootstrap: cold-start a repo that already has history

New named skill `memory-bootstrap` (`disable-model-invocation: true`). Distinct from
`memory-migrate`, which adopts *existing memory*; this adopts *the codebase itself*.

Inventory the README, `docs/`, existing ADRs, manifests, CI config and test commands → mine
`git log` for recurring themes, hot files, revert clusters and fix-of-a-fix chains (gotcha
candidates by construction) → interview the user for what the repo cannot tell you → draft the
spine plus a first pass of `decisions/`, `gotchas/`, `concepts/` and `procedures/`.

Hard gates, because this is the skill most likely to invent a project: every claim carries
`evidence` citing a commit SHA or a file path; everything lands in `_pending/`; "never invent
project facts to fill a template" applies at full force.

Fixes the adoption cliff — today, installing XAC into a two-year-old repo leaves fifty empty files
that nobody fills.

### W4 — Harness contract and the four adapters

*W4.1–W4.3 superseded by ADR 12:* no adapters, no skill trees, no `xac-adapt`. The work that
replaces them is W8. W4.4 and W4.5 are unaffected and ship in Phase 3.

- **W4.1** Write the contract above into `docs/` as the normative specification.
- **W4.2** Four authored adapters — Cursor, Claude Code, Codex, OpenCode. Cursor remains the
  authored source; the rest are generated from it. Three of the four are largely a `SKILL.md`
  tree copy plus one instructions file.
- **W4.3** `xac-adapt` skill (named-only): hands the agent the contract, instructs it to research
  the target harness's current documentation, and fills what that harness supports. Advertised in
  the README and in the installer's next-steps output, since nothing happens until it is asked
  for. This is also where hooks live for anyone who wants them: the skill can wire a harness's
  lifecycle events on request, without XAC shipping or owning the code.
- **W4.4** Harden the handoff into a portable baton. The template already carries From, Summary,
  Next steps, Open questions and Files touched. Add `To:` (target harness), `Harness:` and the
  branch or worktree — ai-memory matches handoffs by cwd *path boundary* precisely because "same
  directory" is not "same work" — plus an expiry, so a three-week-old open handoff stops
  presenting itself as current.
- **W4.5** Handoff multiplicity: **one baton, plus a `branch:` field.** `handoff.md` stays a single
  mutable slot, which matches XAC's one-human-one-agent pair thesis and avoids a directory of
  handoff files outliving the branches that produced them. Adding the branch or worktree to the
  frontmatter means a baton left on other work is **detected and reported** rather than silently
  followed — the agent says so and confirms before acting on it. This fixes the "wrong work" case;
  it does not fix the "lost update" case, and that is the accepted limit. ai-memory needed handoff
  *rows* with precedence rules to solve both, and that needs a runtime.

### W5 — Small imports from ai-memory

| Import | Shape in XAC |
|---|---|
| `slot_kind: invariant` | A frontmatter flag marking pages that no rewrite may touch without directly contradicting evidence — stronger than `pinned`, which only exempts from decay. |
| Capture exclusions | A "never record" rule: secrets, tokens, credentials, customer data and `.env` contents must never enter a page. XAC gates *committing* secrets today but says nothing about *writing them into memory* — and memory pages get committed. A real hole, one paragraph to close. |
| Page feedback | A lightweight `stale` / `wrong` flag, giving `memory-maintain` a work queue instead of a full-bank scan. XAC has no reinforcement signal at all today. |
| Fan-out as the primary act | `memory-write`'s reconcile step is one paragraph. Karpathy's claim, and ai-memory's `memory_ingest` design, is that one insight touches ten to fifteen pages. Promote reconciliation from a step to the point of the skill. |

### W6 — Foundations

- Tests for `bin/cli.mjs`: the four install paths (create, identical, conflict, parked),
  misplaced-bank detection, the root-refusal guard, and a pack assertion that the tarball carries
  only `bin/` and `template/` paths. Done 2026-08-22: 15 tests, mutation-checked.
- The verification matrix stays at one cell per install path. Nothing executable ships, so there
  is no per-harness, per-OS runtime matrix to maintain.

### W7 — Rule diet, paying for W1.2, W2 and W5

The three workstreams above add roughly 0.9 kB of always-on rule text to a 17.4 kB budget
(~4.5k tokens every turn). Two blocks in `memory-bank.mdc` are duplicated near-verbatim in the
skills that actually use them, and both are cut:

| Cut from `memory-bank.mdc` | Approx. | Already lives in |
|---|---|---|
| Frontmatter field descriptions (`kind`, `tier`, `pinned`, `expires_at`, `entities`, `authority`, `evidence`) | ~1.1 kB | `memory-write` → Frontmatter |
| Promotion-gate reject bullets | ~0.9 kB | `memory-maintain` → Promote, step 3 |

The write-triggers table **stays** in the rule. Rules hold triggers and skills hold procedure;
that boundary is stated in [architecture.md](../architecture.md) and moving the triggers would
break it.

Net: about 2.0 kB freed against 0.9 kB added, leaving the always-on budget near 16.3 kB — smaller
than today. This is the roadmap's "always-on rule diet" item, and it must land **in the same
increment** as the rules it pays for, not after. The README's context-bill table needs
re-measuring once it does.

*Measured after Phase 1:* the always-on rules came to 17.35 kB, net −40 bytes rather than the
−1.1 kB predicted. Both cuts landed, but the recall pointer, the "never record" paragraph and two
new router rows spent most of what they freed. The budget held; it did not shrink.

*Extended by ADR 12:* the diet now covers the whole XAC section of `AGENTS.md` — all four rules
plus the skill catalog, which today total about 20 kB and 410 lines. The target is under roughly
15 kB, enforced by a test, to leave room under Codex's shared 32 KiB cap and to approach Claude
Code's guidance of about 200 lines per instruction file. The method is the same: triggers and
non-negotiables stay in the section, procedure moves into the skill that uses it. This is part of
W8, not a separate phase.

### W8 — Relocation: `AGENTS.md` as the entry point ([ADR 12](../decisions/0012-agents-md-is-the-entry-point.md))

*Done 2026-09-25.* The section came in at 12.8 kB and 217 lines. Two departures from the text
below: the version went to 0.2.0 rather than 1.0.0, since semver puts pre-1.0 breaking changes in
the minor digit; and the root `.cursor/rules/caveman.mdc` stays, because it is the maintainer's
own gitignored style file rather than part of the factory. The installer also learned to treat
CRLF-only differences as unchanged, found during end-to-end verification.

- **W8.1 Payload move.** `template/` holds only `memory-bank/_xac/`. Skills move to
  `_xac/skills/`, `_templates/` to `_xac/templates/`, `caveman.mdc` to `_xac/modules/caveman.md`.
  The four always-on rules are merged, dieted and rewritten as `_xac/AGENTS.block.md` between
  `<!-- xac:begin -->` and `<!-- xac:end -->`, with the skill catalog (name, when to use it,
  named-only or not, path) replacing `core.mdc`'s router table. Every `.cursor/` path reference in
  the payload is rewritten.
- **W8.2 `SETUP.md`.** The guided setup and upgrade procedure. Detect the case from observable
  signals: markers in `AGENTS.md`, a bank spine, legacy `.cursor/rules/*.mdc` or `.cursor/skills/`
  from XAC, foreign memory layouts, `CLAUDE.md`, `AGENTS.override.md`, uncommitted changes under
  `_xac/`. Summarise every create, change, migration and removal as one list — the `AGENTS.md`
  change shown as a diff — and wait for approval. Apply, then verify against a checklist. On
  upgrade, `git diff memory-bank/_xac/AGENTS.block.md` is the change to carry into the marked
  section; where there is no git base, compare the section with the new block and show the diff.
  Routes to `memory-bootstrap` or `memory-migrate` where the case calls for it, and offers the
  opt-in modules.
- **W8.3 Installer.** Copies `template/memory-bank/_xac/**` into the target, creating or
  overwriting, and writes nothing else. Reports files in `_xac/` the payload no longer carries
  without deleting them. Keeps the root-refusal guard and `--dry-run`. Drops the conflict and
  parked paths, the misplaced-bank check (moved into `SETUP.md` detection), and the personal-module
  prompt and flags (moved into setup). Ends with one instruction: ask your agent to read
  `memory-bank/_xac/SETUP.md`.
- **W8.4 Tests.** Rewrite around the new behaviour: clean copy, overwrite on upgrade, nothing
  written outside `_xac/`, stale files reported and kept, dry-run, root refusal, pack boundary.
  Add a budget test on `AGENTS.block.md` and a reference-integrity test that every payload path
  mentioned in the payload exists. Repeat the mutation check.
- **W8.5 Bank tooling skips `_xac/`.** `memory-recall` search exclusions, the audit's orphan and
  frontmatter checks, the never-loaded lists, `memory-bootstrap`'s "existing bank" test, and
  `memory-migrate`, which also learns to retire legacy `.cursor/` XAC files.
- **W8.6 Factory.** `.cursor/rules/repo-source.mdc` folds into the root `AGENTS.md`; the root
  `.cursor/` and its `.gitignore` line go.
- **W8.7 Documentation.** README (harness support, install layout, setup and upgrade flow, a
  re-measured context bill), `architecture.md`, `development.md`, and a major version bump in
  `package.json`, since every existing install changes shape.

## Sequencing

| Phase | Contents | Rationale |
|---|---|---|
| **0** ✓ | W6 `cli.mjs` tests | Existing debt, and the project's own "every change ships with its test" rule is currently violated. |
| **1** ✓ | W3 bootstrap; W1.1 recall skill; W1.2 authority rule; W1.4 index lines; W5 capture exclusions; **W7 rule diet** | Pure markdown, no interdependencies. Bootstrap unblocks real dogfooding, which everything downstream needs. The rule diet ships with the rules it pays for. |
| **R** ✓ | W8 relocation, including the W7 diet extended to the whole `AGENTS.md` section | Added 2026-09-25 by ADR 12. Goes before Phase 2 because Phase 2 edits `memory-session` and the rules, and both move. Dogfooding should exercise the layout that will ship, and `SETUP.md` is what a scratch project is set up with. |
| **2** | W2 conversational lifecycle, including W2.6 mode line and W2.5 documentation | Small, and it directly addresses the capture pain. Do it early enough to live with it during dogfooding. |
| **3** | W4.4 handoff fields, W4.5 branch field | *Reduced by ADR 12.* The contract, skill trees, instruction files, `xac-adapt` and installer `.new` snippets are gone; W8 delivers the four-harness goal. |
| **4** | W1.3 trigger row in the audit; W1.5 backlinks; W5 remainder | Small residue, and the entity-index trigger only earns its place once the audit is otherwise settled. |

## Risks and costs

- **Capture remains best-effort.** Conversational triggers are more reliable than the status quo
  and less reliable than a hook. An unattended session that dies without warning loses its
  capture. Accepted deliberately; revisit only if it bites repeatedly in practice.
- **The always-on rule budget is the binding constraint.** W7 resolves it for this plan and ends
  net negative, but the principle it establishes — swap, never append — has to survive contact
  with the next good idea. The rules are the one growth surface with no cap, which is why nothing
  reaches `.cursor/rules/` without the user's explicit yes.
- **The rule diet moves detail out of the always-on tier.** An agent that writes a page without
  loading `memory-write`, or promotes without loading `memory-maintain`, no longer has the field
  descriptions or the reject list in front of it. Both skills are ambient and their descriptions
  cover exactly those situations, so the exposure is small — but it is real, and it is the cost of
  the 2 kB.
- **Trigger tables invite false positives.** An over-eager close on "let's do this later" writes
  noise, and noise is the failure mode XAC's promotion gate exists to prevent. W2.4 is not
  optional.
- **Adapter drift.** Four harnesses whose instruction and skill conventions are still moving.
  Lower risk than hooks, but not zero — Codex has already deprecated custom prompts in favour of
  skills.
- **Native skill discovery is gone (ADR 12).** No harness loads an XAC skill from its description
  or offers `/skill-name`; the agent opens a skill because the catalog in `AGENTS.md` says to. An
  ambient skill whose catalog line is vague will simply not be used.
- **Setup is agent work (ADR 12).** It is not deterministic and cannot be unit-tested. The
  summary-before-apply step and the verification checklist are the controls, and dogfooding is the
  only real test.
- **Every existing install changes shape (ADR 12).** Legacy Cursor-layout projects depend on
  `SETUP.md`'s upgrade path being right the first time it meets them.
- **`memory-session` is growing.** Opening, Closing, Checkpoint, plus a trigger table, in one
  skill. Watch its size; split if it stops fitting one read.

## Decision records to write

- **Lifecycle is conversational, not mechanical** — extends ADR 1 with the read-only-hook case
  examined and declined, the divergence argument, and `PreCompact` recorded as the single
  acknowledged exception should it ever be revisited.
- **Retrieval is a maintained index, not a search engine** — why no FTS, no vectors, no ranking.
- **Harness support is a contract with four reference adapters** — why others are generated on
  demand, and why the agent researching a harness's own documentation is the right division of
  labour.
- **No global scope** — XAC knows only what the repo knows.

## Open questions

None outstanding. Settled 2026-08-22:

| Question | Resolution |
|---|---|
| Handoff multiplicity | One baton plus a `branch:` field — detect a mismatched baton, do not solve concurrency (W4.5) |
| Entity index | Deferred behind a trigger in the audit, not built now (W1.3) |
| Mode-line memory state | Rendered only when something is outstanding (W2.6) |
| Rule budget | Cut frontmatter detail and the promotion-gate reject list; net −1.1 kB (W7) |
| Codex project-level skills | Supported, at `.agents/skills/` — no `AGENTS.md` inlining needed |

## Verified 2026-08-22

- `.agents/skills/` is read by **Cursor, Codex and OpenCode**; Claude Code reads **only**
  `.claude/skills/`, which OpenCode also reads. Two authored trees cover all four harnesses. See
  the harness table above.
- Codex skills are repo-level and committable, so no `AGENTS.md` inlining fallback is needed.
- `SKILL.md` frontmatter is compatible across all four; XAC's existing files need no changes to
  their frontmatter.

Nothing else is pending verification. Gemini CLI and Copilot were reported as `.agents/skills/`
readers by secondary sources only; neither is a target harness, and `xac-adapt` covers them.

## Explicitly excluded

Lifecycle hooks, vectors, decay math, LLM consolidation, background auto-improve, feedback-based
ranking, a web UI, an MCP server, a search CLI, a SQLite index, and a global preference scope.

## Sources

- [akitaonrails/ai-memory](https://github.com/akitaonrails/ai-memory) — README,
  `docs/ARCHITECTURE.md`, `docs/design-decisions.md`, `docs/research-karpathy-llm-wiki.md`,
  `docs/install.md`, `hooks/`
- [Karpathy, `llm-wiki.md`](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Claude Code hooks reference](https://code.claude.com/docs/en/hooks)
- [Cursor hooks reference](https://cursor.com/docs/agent/hooks)
- [Codex hooks reference](https://learn.chatgpt.com/docs/hooks)
- [Codex custom prompts and skills](https://developers.openai.com/codex/custom-prompts)
- [Codex skills — directory locations and `SKILL.md` frontmatter](https://learn.chatgpt.com/docs/build-skills)
- [OpenCode plugins](https://opencode.ai/docs/plugins/)
