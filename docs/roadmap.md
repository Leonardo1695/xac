# Roadmap and known issues

State as of 2026-09-25. This file replaces a memory bank for this repo: update it when
milestones land, trim what ships.

The next phase of work is planned in
[`plans/ai-memory-convergence.md`](plans/ai-memory-convergence.md), with its decisions recorded as
[ADRs 8–12](decisions/README.md). Read the plan before starting anything numbered below it.

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
- Fourteen skills — ambient: `memory-session`, `memory-recall`, `memory-write`,
  `memory-maintain`, `plan-spec`; named-only: `memory-bootstrap`, `memory-migrate`,
  `refactor-pass`, `test-pass`, `security-audit`, `pr-description`, `design-discovery`,
  `cycle-close`, `idea-capture`.
- Installer verified by hand on Windows: clean install, identical skip, conflict parked as
  `.new`, already-parked recognised, misplaced bank detected without being moved, idempotent
  re-runs. Personal modules are opt-in via TTY prompt or `--personal` / `--no-personal`.
- Public README, MIT LICENSE, package metadata.
- Context growth audit: session pages now expire (~3 months), `_lint/` joined the
  never-loaded tier with reports pruned to the last three, and the README documents the
  measured context bill with the cap behind each growth surface.
- Tests for `bin/cli.mjs` (2026-08-22): 15 tests over `node --test`, no dependencies, each
  driving the real CLI against a temp directory. Covers the four install paths, the payload
  boundary, both guards, `--dry-run`, personal opt-in, and what `npm pack` would ship.
  Mutation-checked against seven deliberate regressions. `npm test` is now the one
  verification command. This closes the project's own "every change ships with its test"
  violation.
- Convergence plan, phase 1 (2026-08-22): `memory-bootstrap`, `memory-recall`, the `authority`
  read rule, question-style index lines, the "never record" rule for secrets, and the rule diet.
  The diet came out at net −40 bytes, not the −1.1 kB planned; the budget held rather than shrank.
  Reviewed before commit: `memory-recall`'s entity search matched file names and never found
  anything, and its exclusion globs did not exclude from the project root — both fixed and checked
  against a fixture bank. `_index/` joined the never-loaded lists, `memory-bootstrap` gained a
  POSIX command, and the pack test runs `npm pack` once without the DEP0190 warning.

## Next

1. **Relocation — phase R of the plan** ([ADR 12](decisions/0012-agents-md-is-the-entry-point.md),
   plan W8). The always-on rules move into a section of `AGENTS.md`; everything else moves into
   `memory-bank/_xac/`; the installer only copies there; setup and upgrade become an agent-guided
   `SETUP.md` that detects the case and summarises every change before making it.
2. **Dogfood the loop in a scratch project** (not in this repo), set up through `SETUP.md`:
   capture an idea, pull it into a cycle, run `design-discovery`, implement, close the cycle.
   Adjust rules based on what the triggers actually do.
3. **Dry-run the upgrade path** against a copy of a project installed with the Cursor layout, and
   `memory-migrate` against a foreign memory layout (not only an XAC-shaped `memory-bank/`).
4. **Convergence plan, phases 2–4** — conversational lifecycle, the handoff fields, then the
   residue.

## Deferred, deliberately

- All lifecycle hooks, including the `beforeShellExecution` git gate. Reopened and declined a
  second time in [ADR 8](decisions/0008-lifecycle-is-conversational.md), on portability and
  maintenance grounds rather than the original overhead argument. `PreCompact` is recorded there
  as the single acknowledged exception should it ever be revisited.
- `design-review` pass diffing built UI against the approved mock via screenshots, and
  self-screenshotting during drafting.
- Always-on rule diet — no longer deferred. Scoped in the convergence plan as W7 and scheduled
  for phase 1, because it pays for the rule text that phase adds. Trigger tables stay in the
  rules; the frontmatter details and the promotion-gate reject list move into the skills.

## Known issues

- The test suite has only been run on Node 22.18 and Windows, though `package.json` claims
  `>=18` and the suite uses nothing newer than `cpSync`. macOS, Linux, and Node 18 are unverified.
- Always-loaded product rules total 17.4 kB, about 4.3k tokens on every turn. Each earned
  its place, but measure before adding more; the README's "context bill" section documents
  the full footprint and must be re-measured when rules change. Relocation moves them into
  `AGENTS.md` with a target under roughly 15 kB, skill catalog included.
- The payload is still Cursor-shaped: rules in `.cursor/rules/`, skills in `.cursor/skills/`.
  Claude Code, Codex and OpenCode get only the `AGENTS.md` router and no skills until the
  relocation lands.
