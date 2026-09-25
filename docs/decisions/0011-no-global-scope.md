# 11. No global scope — XAC knows only what the repo knows

Date: 2026-08-22
Status: accepted

## Context

Standing preferences that are not project-specific — preferred stack, code style, personal
working rules — have no home in XAC. Every page lives in `memory-bank/` inside one project, so a
preference expressed in one repository is invisible in the next.

Server-based memory tools solve this with a reserved global scope: a `_global` project unioned
into every query, so preferences follow the user into new projects without naming a magic project.
It is a genuinely useful feature, and its absence in XAC is a real gap rather than an oversight.

The gap was raised alongside a comparison against one such tool, whose principal drawback — from
this project's point of view — is that its wiki lives at a machine-local data directory rather
than in the repository, so knowledge does not travel with `git clone`.

## Decision

No global scope. XAC knows only what the repository knows.

Standing personal preferences belong to the harness, which already has a place for them:
`~/.claude/CLAUDE.md`, Cursor user rules, `~/.codex/`, `~/.agents/skills/`. XAC does not compete
with those and does not read them.

## Consequences

- The thesis stays whole. Everything XAC knows is in the repository, committed, reviewable in a
  pull request, and present for every collaborator after a clone. There is no second store, no
  sync question, and no answer that depends on which machine the agent is running on.
- A preference stated in one project has to be stated again in the next. That is the cost, and it
  is paid every time a new project starts.
- Team preferences have an obvious home already — the project's own `memory-bank/rules/`, which is
  shared by construction. Only genuinely personal preferences are affected.
- Nothing prevents a user putting their preferences in their harness's user-level configuration.
  XAC neither helps nor hinders; it simply does not own that layer.

## Rejected alternatives

- **An opt-in `~/.xac/global/`**, using the same page shapes and unioned into every project's
  read. Convenient, and it matches the tool it was borrowed from. Rejected because it reintroduces
  exactly the machine-local knowledge that motivated preferring XAC's storage model in the first
  place: memory that does not travel, does not get reviewed, and disappears with the machine.
  Adopting the feature would have meant adopting the flaw.
- **An in-repo `memory-bank/_personal/`** that a project may gitignore. One mechanism, per-project
  choice. Rejected as a worse version of both options: gitignored, it is machine-local knowledge
  with extra steps; committed, it is a `rules/` page with a confusing name.
- **Deferring the question** until the retrieval design settled. Rejected because the answer does
  not depend on it — the reason to say no is about where knowledge lives, not about how it is
  found.
