# Architecture

How XAC is put together, and why the pieces sit where they sit. The decision records in
[`decisions/`](decisions/README.md) carry the full rationale behind each choice.

## Three layers of context

Separated by guarantee, not by topic:

| Layer | Path | Guarantee | Cost |
|---|---|---|---|
| Rules | `.cursor/rules/*.mdc` | Loaded every turn | Permanent token cost per turn |
| Skills | `.cursor/skills/*/SKILL.md` | Loaded when relevant or named | Paid only when used |
| Memory | `memory-bank/` | Read at session start, written at milestones | Paid on read |

The rules hold triggers and non-negotiables. The skills hold procedure. The memory bank holds
project truth — in the *user's* project, never in this repo. Detail placed in the wrong layer
is either never read or always paid for.

## Enforcement tiers

Skills are not lifecycle-bound. A skill with `disable-model-invocation: true` loads only when
named; without it, the agent decides from the description. Neither is a guarantee. So anything
that must always happen lives in an always-applied rule, and skills carry only the how.

| Need | Where it lives |
|---|---|
| Must always be in context | always-applied rule |
| Agent should reach for it when relevant | ambient skill, no `disable-model-invocation` |
| Deliberate, user-driven pass | named skill, `disable-model-invocation: true` |

## Boundaries

- Rules never contain procedure. Procedure never contains triggers.
- The installer does file placement only. Every judgment call — reconciling a customised rule
  file, classifying existing pages, moving anything — belongs to the agent working with the
  user.
- In a user's project, the memory bank holds transient-to-durable knowledge; anything that
  must survive with guarantees belongs in that project's own `docs/`. This repo follows its
  own rule: product rationale lives here in `docs/`, and the repo runs no memory bank at all.

## Source and payload

This repo is the factory. The product lives under `template/` and ships verbatim:

```text
template/
├── .cursor/rules/     the always-on product rules, plus opt-in caveman.mdc
├── .cursor/skills/    the fourteen skills
├── memory-bank/       the scaffold — _templates/ and .gitkeep markers only
└── AGENTS.md          routing block for non-Cursor harnesses
bin/cli.mjs            the installer: maps template/ one-to-one into the target project
docs/                  factory documentation — never ships
.cursor/rules/         one compact factory rule — never ships
```

`files` in `package.json` is just `bin` plus `template`, so nothing repo-specific can reach
the tarball by construction. `isShippable` in `bin/cli.mjs` guards the two remaining
invariants at install time: personal style modules are opt-in (TTY prompt, or `--personal` /
`--no-personal` for non-interactive runs), and `memory-bank/` may only
carry the scaffold. The CLI refuses to install into the package root itself. See
[ADR 7](decisions/0007-template-directory-separates-product-from-factory.md).

## Patterns in use

- **Copy and park.** The installer creates missing files and parks conflicts as `<name>.new`.
  It never overwrites and never merges. See `bin/cli.mjs` and
  [ADR 3](decisions/0003-installer-copies-and-parks-conflicts.md).
- **Announce or stage.** In user projects, cheap reversible memory writes are applied and
  reported; consequential ones are staged to `_pending/` and wait. See
  [ADR 2](decisions/0002-milestone-driven-memory-writes.md).
- **Supersede, never delete.** Durable pages get `authority: superseded` and a forward link.
  Tickets are the designed exception, compressed at cycle close — see
  [ADR 5](decisions/0005-tickets-move-through-three-horizons.md).
- **Evidence before promotion.** A durable claim cites where it came from, which separates
  "the agent suggested it" from "the project believes it".
