# Agent instructions — XAC source repository

This repository builds XAC. The product — agent rules, skills, and a memory bank scaffold —
lives under `template/` and is installed into other projects by `bin/cli.mjs`. This repo does
not run a memory bank, and nothing under `template/` applies to working on this repo.

## Before working

1. `docs/roadmap.md` — status, next steps, known issues
2. `docs/architecture.md` — how the pieces fit and why
3. `docs/development.md` — setup, verification commands, packaging traps
4. `docs/decisions/` — the numbered decision records

## Rules

- Never create `memory-bank/` at the repo root or write memory pages here. Continuity lives
  in `docs/roadmap.md` and git history.
- Every edit under `template/` changes what users install. Keep it generic; never reference
  this repository inside it.
- Run the verification commands in `docs/development.md` before reporting anything as done.
- Test installs go in `test-install/` (gitignored) or a temp directory, never the repo root.
- Never commit, open PRs, mutate git state, or write to a database unless the user
  explicitly asks.
