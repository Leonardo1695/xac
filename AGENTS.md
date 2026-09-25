# Agent instructions — XAC source repository

This repository builds XAC. The product — the `AGENTS.md` section, skills, page templates and
setup procedure — lives under `template/memory-bank/_xac/` and is copied into other projects by
`bin/cli.mjs`. This repo does not run a memory bank, and nothing under `template/` applies to
working on this repo: those files describe consumer projects.

## Before working

1. `docs/roadmap.md` — status, next steps, known issues
2. `docs/architecture.md` — how the pieces fit and why
3. `docs/development.md` — setup, verification commands, packaging traps
4. `docs/decisions/` — the numbered decision records

## Rules

- Never create `memory-bank/` at the repo root or write memory pages here. Continuity lives
  in `docs/roadmap.md` and git history — update the roadmap at milestones.
- Every edit under `template/` changes what users install. Keep it generic; never reference
  this repository's internals inside it.
- `AGENTS.block.md` is every user's always-on context. Measure it before adding to it; a test
  enforces its budget.
- `bin/cli.mjs` stays ES modules, Node built-ins only, zero dependencies.
- Run the verification commands in `docs/development.md` before reporting anything as done.
- Test installs go in `test-install/` (gitignored) or a temp directory, never the repo root.

## Working contract

- Print the mode first in every response: `# Mode: PLAN` (default — gather context, plan,
  change nothing) or `# Mode: ACT` (execute the approved plan). `ACT` switches, `PLAN`
  returns; fall back to PLAN after every response.
- Plan before acting, say what happens next before doing it, report progress during longer
  work. The user decides what and why; the agent proposes how.
- A non-trivial task states four things: what is wanted, how in broad strokes, what is not
  wanted, and how to verify it landed. Ask for a missing block before starting.

## Gated actions

Never commit, open PRs or issues, create/switch/delete branches, stash, push, pull with
merge or rebase, reset, or discard working-tree changes — and never write to a database —
unless the user explicitly asks in the conversation. Read-only git and gh are always fine.
Never stage secrets (`.env`, keys, tokens, dumps); if one is already committed, stop and
say so — rotation is the fix, not deletion. When a gated action is needed, escalate:
**Needs your decision:** what and why, then wait for yes.

## Shell

Windows PowerShell is the primary environment. No `&&` chaining, no bash-only utilities in
anything a user runs. Chain with `;` and check `$LASTEXITCODE`.
