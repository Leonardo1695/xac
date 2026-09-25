# Architecture

How XAC is put together, and why the pieces sit where they sit. The decision records in
[`decisions/`](decisions/README.md) carry the full rationale behind each choice.

## Three layers of context

Separated by guarantee, not by topic:

| Layer | Path | Guarantee | Cost |
|---|---|---|---|
| Rules | the XAC section of `AGENTS.md` | Loaded by the harness every session | Permanent token cost, capped at ~15 kB by a test |
| Skills | `memory-bank/_xac/skills/*/SKILL.md` | Read when the catalog says so, or when named | Paid only when used |
| Memory | `memory-bank/` | Read at session start, written at milestones | Paid on read |

The rules hold triggers and non-negotiables. The skills hold procedure. The memory bank holds
project truth — in the *user's* project, never in this repo. Detail placed in the wrong layer
is either never read or always paid for.

## Enforcement tiers

Skills are not lifecycle-bound, and no harness loads them for XAC: the agent opens a skill
because a catalog row in `AGENTS.md` says to. That is not a guarantee. So anything that must
always happen lives in the `AGENTS.md` section itself, and skills carry only the how.

| Need | Where it lives |
|---|---|
| Must always be in context | the XAC section of `AGENTS.md` |
| Agent should reach for it when relevant | ambient skill, a catalog row saying when |
| Deliberate, user-driven pass | named skill, marked *Named* in the catalog |

A pointer from `AGENTS.md` to another file is followed mechanically only by Claude Code, through
`@path` imports. Everywhere else it depends on the agent choosing to open the file, which is why
the rules are inline rather than behind a pointer ([ADR 12](decisions/0012-agents-md-is-the-entry-point.md)).

## Boundaries

- Rules never contain procedure. Procedure never contains triggers.
- The installer does file placement only, into `memory-bank/_xac/` and nowhere else. Every
  judgment call — merging the section into a user's `AGENTS.md`, retiring an older install,
  classifying existing pages, moving anything — belongs to the agent working with the user,
  through `SETUP.md`.
- In a user's project, the memory bank holds transient-to-durable knowledge; anything that
  must survive with guarantees belongs in that project's own `docs/`. This repo follows its
  own rule: product rationale lives here in `docs/`, and the repo runs no memory bank at all.

## Source and payload

This repo is the factory. The product lives under `template/` and ships verbatim:

```text
template/memory-bank/_xac/
├── AGENTS.block.md    the section setup places in the project's AGENTS.md, markers included
├── SETUP.md           guided setup and upgrade, run by the agent with the user
├── skills/            the fourteen skills
├── templates/         page shapes
└── modules/           opt-in modules, such as caveman.md
bin/cli.mjs            the installer: copies template/ one-to-one into the target project
docs/                  factory documentation — never ships
AGENTS.md              this repo's own instructions — never ships
```

`files` in `package.json` is just `bin` plus `template`, so nothing repo-specific can reach
the tarball by construction. The installer also refuses to copy anything under `template/`
that sits outside `memory-bank/_xac/`, and refuses to install into the package root itself.
See [ADR 7](decisions/0007-template-directory-separates-product-from-factory.md) and
[ADR 12](decisions/0012-agents-md-is-the-entry-point.md).

## Patterns in use

- **Copy, then guide.** The installer copies into the one directory XAC owns and overwrites
  there; it never writes elsewhere, never merges, never deletes. `SETUP.md` detects the case,
  summarises every change, and applies only what the user approves. On upgrade, `git diff` on
  `AGENTS.block.md` is the exact change to carry into the project's section. See
  [ADR 3](decisions/0003-installer-copies-and-parks-conflicts.md) and
  [ADR 12](decisions/0012-agents-md-is-the-entry-point.md).
- **Announce or stage.** In user projects, cheap reversible memory writes are applied and
  reported; consequential ones are staged to `_pending/` and wait. See
  [ADR 2](decisions/0002-milestone-driven-memory-writes.md).
- **Supersede, never delete.** Durable pages get `authority: superseded` and a forward link.
  Tickets are the designed exception, compressed at cycle close — see
  [ADR 5](decisions/0005-tickets-move-through-three-horizons.md).
- **Evidence before promotion.** A durable claim cites where it came from, which separates
  "the agent suggested it" from "the project believes it".
