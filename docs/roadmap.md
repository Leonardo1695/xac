# Roadmap and known issues

State as of 2026-08-05. This file replaces a memory bank for this repo: update it when
milestones land, trim what ships.

## Done

- Memory bank schema: family directories with ticket horizons
  (`tickets/backlog|active|archive/`) and `designs/`, twenty page templates.
- Four always-applied product rules (358 lines total) under `template/.cursor/rules/`.
- Factory split ([ADR 7](decisions/0007-template-directory-separates-product-from-factory.md)):
  the whole payload moved to `template/`, root `.cursor/rules/` reduced to one compact
  factory rule, exclusion filters deleted, and the CLI refuses to install into the package
  root.
- Read-path load tree: hot set (`index` + `handoff` + `activeContext`), spine on gap, a
  never-by-default list for history and future (`sessions/`, backlog, archive, `_pending/`,
  `log.md`, `design/` mocks), ~100-line spine budgets with an audit check, aligned across
  `memory-bank.mdc`, `memory-session`, `memory-maintain`, and `AGENTS.md`.
- Twelve skills — ambient: `memory-session`, `memory-write`, `memory-maintain`, `plan-spec`;
  named-only: `memory-migrate`, `refactor-pass`, `test-pass`, `security-audit`,
  `pr-description`, `design-discovery`, `cycle-close`, `idea-capture`.
- Installer verified by hand on Windows: clean install, identical skip, conflict parked as
  `.new`, already-parked recognised, misplaced bank detected without being moved, idempotent
  re-runs. Personal modules are opt-in via TTY prompt or `--personal` / `--no-personal`.
- Public README, MIT LICENSE, package metadata.
- Context growth audit: session pages now expire (~3 months), `_lint/` joined the
  never-loaded tier with reports pruned to the last three, and the README documents the
  measured context bill with the cap behind each growth surface.

## Next

1. **Tests for `bin/cli.mjs`** — the four install paths (create, identical, conflict,
   parked), misplaced-bank detection, the root-refusal guard, and one test asserting the
   tarball carries only `bin/` and `template/` paths. This closes the project's own
   "every change ships with its test" violation.
2. **Confirm the repository name.** `README.md` and `package.json` hardcode
   `github.com/Leonardo1695/xac`; the working directory is `memory-bank-study`. If the repo
   lands under another name, seven URLs need updating.
3. **Dogfood the loop in a scratch project** (not in this repo): capture an idea, pull it
   into a cycle, run `design-discovery`, implement, close the cycle. Adjust rules based on
   what the triggers actually do.
4. **Dry-run `memory-migrate`** against a copy of a project with a legacy memory bank.

## Deferred, deliberately

- Optional `beforeShellExecution` hook for git gating — would make permission rules binding
  rather than advisory; writes nothing to memory. Polish, not foundation.
- `design-review` pass diffing built UI against the approved mock via screenshots, and
  self-screenshotting during drafting.
- Always-on rule diet: move frontmatter field details from `memory-bank.mdc` into
  `memory-write`, compress trigger tables. Revisit after the loop has been exercised.
- Marker-delimited managed blocks for smarter upgrades (see
  [ADR 3](decisions/0003-installer-copies-and-parks-conflicts.md)).

## Known issues

- `bin/cli.mjs` has no automated tests; everything above was verified by hand.
- Always-loaded product rules total 17.4 kB, about 4.5k tokens on every turn. Each earned
  its place, but measure before adding more; the README's "context bill" section documents
  the full footprint and must be re-measured when rules change.
- The repo is not a git repository yet — `git init`, first commit, and push belong to the
  owner.
- `sessionStart` hook capability was never verified. Hooks were dropped for other reasons;
  the question only matters if they are ever revisited.
