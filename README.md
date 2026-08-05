<div align="center">

# XAC

### eXtreme Agentic Coding

**Shared memory and engineering discipline for coding agents.**

Give your agents continuity across sessions, and hold them to the practices that make
generated code survive contact with production.

![Node](https://img.shields.io/badge/node-%E2%89%A5%2018-3c873a?style=flat-square)
![Cursor](https://img.shields.io/badge/built%20for-Cursor-000000?style=flat-square)
![Markdown](https://img.shields.io/badge/runtime-none%20(markdown)-0366d6?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

</div>

---

## The problem

Building software with AI is unreliable in a specific way: the process is non-deterministic. The
same request produces solid work one day and something subtly broken the next, and nothing in a
default setup tells you which one you got. Two causes account for most of it.

**Agents forget everything between sessions.** Every session starts by re-explaining the project,
decisions already made get re-litigated, and the trap you solved last Tuesday gets walked into
again on Thursday.

**Agents are fast and agreeable.** They write plausible code at speed, never say "this is a bad
idea", and leave you to discover what broke.

Neither is solved by a better model or a longer prompt. Both are solved by giving the agent
persistent memory and a process it has to follow — and neither needs infrastructure.

## What XAC is

Three layers of plain Markdown, dropped into any repo.

| Layer | Path | What it does |
|---|---|---|
| **Memory** | `memory-bank/` | Versioned project memory that grows as you work — decisions with their rejected alternatives, traps with their root cause, procedures worth replaying, tickets across backlog, current cycle, and archived history, approved design specs, and a handoff so the next session resumes instead of restarting |
| **Rules** | `.cursor/rules/` | Always loaded. Plan before acting, verify before claiming done, one coherent increment at a time, tests in the same change |
| **Skills** | `.cursor/skills/` | Loaded on demand. Writing a memory page, promoting an insight, refactor and test and security passes, PR descriptions |

Nothing runs at work time. No database, no embeddings, no daemon. Every file is something you
can open, read, grep, and diff.

## Quick start

```bash
npx github:Leonardo1695/xac
```

On an interactive terminal the installer asks about optional personal modules (caveman chat
style defaults to no). Flags skip the prompts for scripts and CI:

```bash
npx github:Leonardo1695/xac --dry-run       # show what would happen, change nothing
npx github:Leonardo1695/xac --personal      # include personal modules, no prompt
npx github:Leonardo1695/xac --no-personal   # skip personal modules, no prompt
```

Then open the project in Cursor and tell the agent:

> Initialise the memory bank from `memory-bank/_templates/`.

It will fill the spine from the repo and from your answers. It will not invent project facts.

**Already have a memory bank?** Say this instead:

> Run the `memory-migrate` skill.

Nothing existing is deleted, rewritten, or moved without your approval. Migration adds
frontmatter in place, builds an index from what is already there, and *proposes* moves for you
to accept or decline.

### Nothing gets overwritten

The installer only creates what is missing. If a file already exists with different content,
the new version lands beside it as `<name>.new` and the original is left alone. Reconciling the
two is a conversation between you and the agent, not a guess made by a script.

Re-running is safe and idempotent.

## How it works

### Memory is written at milestones

Not on a timer. Not on every message. Not on IDE events.

| Milestone | What gets written |
|---|---|
| Plan approved | Ticket or plan page, refreshed active context |
| Increment finished and verified green | Progress, one line in the log |
| Decision made | A staged decision page |
| Trap hit and resolved | A gotcha page: symptom, root cause, fix, verification |
| Workflow worth replaying | A procedure page |
| Work paused or handed off | Handoff note, session page |
| Ticket closed | Progress updated, obsoleted pages superseded |
| Idea parked for later | A backlog ticket — offered first, written on your yes |
| Design approved | A design spec page, linked from its ticket |
| Cycle finished | One archive page; ticket files deleted only from a list you approve |

### Nothing is written silently

Two postures, and the agent uses the right one without being asked.

- **Announce and apply** — gotchas, notes, sessions, tickets, designs, progress, active
  context, log. Written, then reported in the turn.
- **Stage and ask** — decisions, rules, anything pinned. Written to `_pending/`, then it waits
  for your yes.

You stay on top of what the agent does. You do not have to write the code to do that.

### Not everything earns a page

A gate stands between "something happened" and "the project believes this". A durable page
needs an insight that outlives the session, evidence showing where it came from, and none of
the following:

- nothing actually happened this session
- a single command succeeded
- a version bump or release marker
- a transient environment failure — missing binary, expired token, network down, wrong path
- a broad negative claim about a tool, which turns false the moment it is fixed
- a narrative of one task, which the session record already covers
- a failure since resolved — the fix pattern is worth keeping, the outage is not
- status you can already see

Rejections are recorded with their reason and read before the next promotion, so the same idea
does not come back every week.

The reason for all of it: **bad memory is worse than no memory.** No memory makes an agent ask.
Bad memory makes it confident and wrong.

### Retrieved memory is evidence, not instruction

A page records what was true when someone wrote it. It can be stale, superseded, or simply
wrong. The agent verifies against the working tree before acting on what a page claims, and
when a page and the code disagree, the code wins and the page gets fixed.

### Pages are retired, never deleted

A superseded decision keeps its page, gets marked, and links forward to what replaced it. The
rejected alternatives stay readable, which is what stops a future session re-proposing
something already ruled out.

The one designed exception is tickets. Work orders are episodic: when you close a cycle, the
finished tickets compress into a single archive page — what shipped, what slipped, links to
the decisions and gotchas the cycle produced — and the individual files are deleted from a
list you approve. History survives in one page instead of a growing pile.

### Work moves through three horizons

`tickets/backlog/` holds ideas and future work — parked in seconds with the `idea-capture`
skill, refined toward ready when you ask. `tickets/active/` holds the current cycle.
`tickets/archive/` holds one summarized page per finished cycle. Epics are just ticket pages
that group others, so nothing new to learn when a project grows into them.

### Design is decided before implementation, not during

The `design-discovery` skill is a designer, not a coder: it interviews you about direction —
after reading what the memory bank already knows — offers market research if you want it,
then drafts single-file HTML mocks with faked interactions: tabs switch, forms validate,
modals open, all against hardcoded data. Every mock must show its empty, loading, error, and
mobile states, because missing states are where invented decisions creep back in. You iterate
on versions, never overwrites.

When you approve, the direction lands as a design spec page linked from its ticket, and the
design tokens get staged into `designSystem.md`. The developer agent then treats the mock as
the spec: match its layout, states, and interactions, reimplement in the real stack, ask when
the mock is silent. Design stays optional — a ticket without one simply follows the design
system as it stands.

### The context bill, measured

Numbers below are measured on the shipped files, estimated at ~4 characters per token.

| Always in context | Size | ≈ Tokens |
|---|---|---|
| The four rules files | 17.4 kB | 4,500 |
| Skill catalog — 12 one-line descriptions; a skill's body loads only when it runs | 4 kB | 1,000 |
| `AGENTS.md` router — written for non-Cursor harnesses; some load it alongside the rules | 2.1 kB | 550 |
| `caveman.mdc`, only if opted in (prompt or `--personal`) | 3.4 kB | 900 |

On top of that fixed cost, a session open reads the hot set — `index.md`,
`activeContext.md`, `handoff.md` — which is budget-capped around 5k tokens and usually far
under it. Coming back after days adds the rest of the spine, six files capped at ~100 lines
each. The worst case — a cold start after weeks, every file grown to its budget ceiling —
lands around 20k tokens, a tenth of a 200k window. A same-day resume runs on roughly a
third of that.

More importantly, the bill stays flat as the project ages. Every surface that grows either
has a hard cap with an audit remedy, or lives outside the default read path:

| What grows with use | Why it never reaches context |
|---|---|
| Spine files | ~100-line budget; the audit sheds overflow into family pages or the cycle archive |
| `index.md` | 200-line cap, pointers only; the audit merges narrow pages when it sprawls |
| `activeContext.md`, `handoff.md` | Overwritten every time, never appended |
| Tickets | Active set bounded by the cycle; `cycle-close` compresses each finished cycle into one archive page; backlog and archive are never loaded by default |
| Session pages | Written with a ~3-month expiry, retired once stale, never loaded by default |
| `log.md` | Append-only ledger on disk, never loaded by default |
| Audit reports (`_lint/`) | Only the last three kept, never loaded by default |
| Rejection ledger | Capped at fifty entries and six months |
| `decisions/`, `gotchas/`, `concepts/`, `procedures/` | Loaded cold, one page at a time, found by name through the index — a page's ambient cost is its single index line |
| The always-on rules themselves | The one surface with no size cap gets the strongest gate: nothing is promoted into `.cursor/rules/` without your explicit yes, because every added line is a permanent per-turn cost |

## Layout

The installer delivers the empty shape of this — 50 files, about 70 kB: the rules, the
skills, the page templates in `_templates/`, and directory markers. No content. The spine
files appear when the agent initialises the bank from the repo and your answers; every
other page exists only when work produces it. The files that load hot carry the budgets
from the context bill above, and the caps are written into the pages themselves — the
index template says "under 200 lines" in its own header comment, `activeContext.md` says
"overwrite, never append" — so any agent reading a page also reads its discipline.

```text
memory-bank/
├── index.md            pointers only, under 200 lines
├── log.md              append-only milestone ledger
├── handoff.md          single-use baton for the next session
├── projectbrief.md     problem, scope, success criteria
├── productContext.md   why it exists, who uses it, expected behaviour
├── activeContext.md    what is true right now — overwritten, never appended
├── systemPatterns.md   architecture, boundaries, conventions
├── techContext.md      stack, setup, and the verification commands
├── progress.md         what works, what is left, known issues
├── designSystem.md     brand, colour, type, components (delete if no UI)
├── decisions/          a choice made, with rejected alternatives
├── gotchas/            symptom, root cause, fix, verification
├── concepts/           how this system actually works
├── procedures/         workflows where the order is the value
├── rules/              candidate always/never instructions
├── notes/              useful facts that fit nowhere else yet
├── tickets/
│   ├── backlog/        ideas and future work, unscheduled
│   ├── active/         the current cycle
│   └── archive/        one summarized page per closed cycle
├── designs/            approved design specs — the mocks live in design/ at the project root
├── sessions/           episodic record, decays over time
├── _pending/           staged pages awaiting your approval
├── _lint/              audit findings
└── _templates/         page shapes
```

Every page carries frontmatter, so pages can be found by search, retired when stale, and traced
back to where their claims came from:

```yaml
---
title: Slot inheritance runs on create, not on update
kind: gotcha          # decision | fact | rule | gotcha | procedure | ticket | design
tier: semantic        # working | episodic | semantic | procedural
pinned: false         # exempt from decay and automated rewrite
expires_at:           # YYYY-MM-DD — an expired page is stale even if pinned
entities: [booking, slot, ticket]   # searchable nouns, how the page gets found
authority: canonical  # canonical | active | superseded | historical | do-not-answer-from
evidence:
  - page: sessions/2026-08-05-slot-audit.md
    quote: "inherit only fires in the create path"
---
```

## Skills

| Skill | Loads | Does |
|---|---|---|
| `memory-session` | automatically | Opens and closes a work session against the memory bank |
| `memory-write` | automatically | Writes a page with the right family, frontmatter, links, and index entry |
| `memory-maintain` | automatically | Promotes candidates behind the gate; audits for contradictions, stale pages, duplicates |
| `plan-spec` | automatically | Turns a request into a specified, verifiable task and gates it before execution |
| `memory-migrate` | on request | Adopts an existing memory bank without losing anything |
| `design-discovery` | on request | Interviews you, researches references, drafts interactive HTML mocks, records the approved direction |
| `idea-capture` | on request | Parks an idea in the backlog in seconds; refines it toward ready when asked |
| `cycle-close` | on request | Compresses a finished cycle into one archive page, deletions gated on your approval |
| `refactor-pass` | on request | Deliberate cleanup of recently changed code, behaviour unchanged |
| `test-pass` | on request | Closes test gaps and makes the suite runnable headless from one command |
| `security-audit` | on request | Secrets, permissions, injection, traversal, validation, failure paths |
| `pr-description` | on request | Writes a PR body from the actual diff, not from the intent |

## Philosophy

**Extreme Programming, with a pair that never gets tired.** Pair programming, test-first, small
releases, continuous integration, continuous refactoring. None of it was invented for AI, and
all of it matters more now that code gets produced faster than it gets reviewed.

**Specify four things, not one.** What you want. How, in broad strokes. What you do *not* want —
the block everyone skips and the one where all the unspoken assumptions live. And how you verify
it landed. Without the fourth, "done" is an opinion.

**The one-shot prompt is a fantasy.** A perfect spec would require knowing in advance everything
that will go wrong — and if you knew that, you would not need the spec. Good software is hundreds
of small decisions made with the system running, not one large decision made before the first
line exists.

**The human decides what and why. The agent proposes how.** Invert that and quality drops. The
agent never says no, so you are the brake, the review, and the adult in the room.

**Documentation is agent-facing infrastructure now.** An agent reads the whole project doc in
seconds before every interaction and never complains about it. That changes the return on writing
things down.

**Code is written for two readers.** An agent navigates by grep and reads in chunks, so small
files, searchable names, explicit types, and headless tests stopped being style preferences and
became working constraints.

**Throwing code away is hygiene, not failure.** Prototype, measure, write down what you learned,
delete the prototype. The document is the point.

## Inspirations and credit

XAC is assembled from ideas that already existed. **Nothing here is copied.** Every rule, skill,
and template in this repo was written from scratch for it, and several of the borrowed ideas were
deliberately reshaped — or rejected outright — once they met practice.

The lineage, credited properly:

- **[Extreme Programming](http://www.extremeprogramming.org/)** — Kent Beck and the original XP
  community. The engineering rules here are XP applied to a pair that happens to be a model.
- **The Memory Bank pattern** that circulated through the Cline and Cursor communities. The
  seven-file spine started there and is kept largely intact, because it works.
- **[Andrej Karpathy's LLM wiki notes](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)**
  — the argument that an agent should maintain a compiled, interlinked Markdown wiki instead of
  re-deriving answers from raw sources on every query. The page families, the pointer-only index,
  and the append-only log come from there.
- **[Fabio Akita's writing on disciplined AI-assisted development](https://akitaonrails.com/)** —
  the strongest single influence on this project's process rules and on the memory quality gate.
  Evidence-backed promotion, negative filters, supersession over deletion, milestone-driven
  capture, and the insight that bad memory is worse than none all trace back to his published
  post-mortems and his open-source work on agent memory.

### Where XAC departs

Studying those sources produced as many rejections as adoptions, and the rejections are part of
the design:

- **No lifecycle hooks.** Deterministic session-start and session-end capture was designed, built
  on paper, and then dropped. A hook that writes a page every session writes pages for sessions
  where nothing happened, which makes the noise problem worse. Capture belongs at work
  milestones, where judgment can be applied.
- **No background consolidation.** Memory is written with the user present and told what was
  written. Silent autonomous rewriting is faster and worse.
- **No decay engine, no confidence scoring, no vector search.** TTLs, authority tags, and grep
  cover it at the scale a single repo actually reaches.
- **Two postures instead of one policy.** Cheap, reversible pages are announced and applied.
  Decisions and rules are staged and wait. That split is what makes the loop trustworthy without
  making it tedious.

## Updating an existing install

Re-run the installer. Files that already match are skipped, new files are added, and anything you
have customised is left alone with the new version parked as `<name>.new` beside it. Ask the agent
to reconcile them with you.

## Forking

XAC is opinionated on purpose. If an opinion does not fit your team, fork it and change it — the
rules and skills are Markdown, there is nothing to compile, and nothing to unpick. Adjusting the
template for your own conventions is expected, not a workaround.

The repository mirrors the split: everything that installs lives under `template/`, byte for
byte; `bin/cli.mjs` copies it; `docs/` holds the architecture notes and decision records that
explain why it is shaped this way.

## Requirements

Node 18 or later, for the installer only. Everything else is Markdown.

## About

I'm Leonardo Serra, a fullstack Node developer with a backend lean and more than eight years of
experience, working mostly with Node, TypeScript, React, and AWS. I'm deeply interested in
technology and in AI specifically.

XAC exists because building software with AI felt non-deterministic and unreliable. The same
request would produce good work one day and something subtly broken the next, context vanished
between sessions, and there was no way to tell a solid result from a lucky one. So over years of
using these tools daily and researching how to use them properly, I built the guardrails I wanted
for my own work. It made my results predictable enough to rely on, and that seemed worth sharing.

It is MIT licensed — use it, fork it, rewrite it, ship it. No attribution required and no
permission needed. If you want to reach out:

- [LinkedIn](https://www.linkedin.com/in/leonardo-serra16/)
- [GitHub](https://github.com/Leonardo1695)

## License

MIT. See [LICENSE](LICENSE).
