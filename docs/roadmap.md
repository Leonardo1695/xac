# Roadmap and known issues

State as of 2026-09-25. This file replaces a memory bank for this repo: update it when
milestones land, trim what ships.

The next phase of work is planned in
[`plans/ai-memory-convergence.md`](plans/ai-memory-convergence.md), with its decisions recorded as
[ADRs 8–12](decisions/README.md). Read the plan before starting anything numbered below it.

## Done

- Memory bank schema: family directories with ticket horizons
  (`tickets/backlog|active|archive/`) and `designs/`, twenty page templates.
- Read-path load tree: hot set (`index` + `handoff` + `activeContext`), spine on gap, a
  never-by-default list for history and future (`sessions/`, backlog, archive, `_pending/`,
  `_lint/`, `_index/`, `log.md`, `design/` mocks), ~100-line spine budgets with an audit check,
  aligned across the `AGENTS.md` section, `memory-session` and `memory-maintain`.
- Fourteen skills — ambient: `memory-session`, `memory-recall`, `memory-write`,
  `memory-maintain`, `plan-spec`; named-only: `memory-bootstrap`, `memory-migrate`,
  `refactor-pass`, `test-pass`, `security-audit`, `pr-description`, `design-discovery`,
  `cycle-close`, `idea-capture`.
- Factory split ([ADR 7](decisions/0007-template-directory-separates-product-from-factory.md)):
  the payload lives in `template/`, the factory at the root, and the CLI refuses to install into
  the package root.
- Public README, MIT LICENSE, package metadata.
- Context growth audit: session pages expire (~3 months), `_lint/` is never loaded and pruned to
  the last three reports, and the README documents the measured context bill with the cap behind
  each growth surface.
- Tests for `bin/cli.mjs` (2026-08-22), driving the real CLI against temp directories over
  `node --test`, no dependencies. `npm test` is the one verification command.
- Convergence plan, phase 1 (2026-08-22): `memory-bootstrap`, `memory-recall`, the `authority`
  read rule, question-style index lines, the "never record" rule for secrets, and the rule diet.
  The diet came out at net −40 bytes, not the −1.1 kB planned. Reviewed before commit:
  `memory-recall`'s entity search never matched and its exclusion globs did not exclude from
  the project root — both fixed and checked against a fixture bank.
- **Relocation, phase R (2026-09-25, [ADR 12](decisions/0012-agents-md-is-the-entry-point.md)).**
  - The four Cursor rules and the router became one section, `AGENTS.block.md`: 12.8 kB and
    217 lines, down from about 24.8 kB of rules, skill catalog and router. The skill catalog
    lives inside it.
  - Skills, templates, the caveman module and `SETUP.md` live in `memory-bank/_xac/`. Nothing
    ships to `.cursor/` any more; the root factory rule folded into the root `AGENTS.md`.
  - The installer copies into `_xac/` only, overwrites there, reports stale files without
    deleting them, and treats CRLF-only differences as unchanged. Parking, the personal-module
    prompt and flags, and misplaced-bank detection are gone; setup owns them now.
  - 18 tests, including a budget test on the section, catalog and path-reference integrity, and
    a mutation check against thirteen deliberate regressions.
  - Verified end to end with fixtures: an install over a 0.1 Cursor-layout project writes only
    `_xac/` and leaves every legacy file for `SETUP.md` to list; an upgrade's
    `git diff` on `AGENTS.block.md` applies cleanly onto a user's `AGENTS.md`, keeping their own
    lines and a non-overlapping local edit inside the section.
  - Version 0.2.0: every existing install changes shape.

## Next

1. **Run `SETUP.md` with a real agent**, in scratch projects rather than this repo: a fresh
   project, a project with its own `AGENTS.md` and `CLAUDE.md`, and a copy of a 0.1 Cursor-layout
   install. Check the summary is complete before anything changes, and that the checklist catches
   a half-finished setup. Try at least two harnesses.
2. **Dogfood the loop in a scratch project** set up through `SETUP.md`: capture an idea, pull it
   into a cycle, run `design-discovery`, implement, close the cycle. Watch whether the catalog
   alone gets ambient skills read when they should be.
3. **Dry-run `memory-migrate`** against a foreign memory layout (not only an XAC-shaped
   `memory-bank/`).
4. **Convergence plan, phases 2–4** — conversational lifecycle, the handoff fields, then the
   residue.

## Deferred, deliberately

- All lifecycle hooks, including the `beforeShellExecution` git gate. Reopened and declined a
  second time in [ADR 8](decisions/0008-lifecycle-is-conversational.md), on portability and
  maintenance grounds rather than the original overhead argument. `PreCompact` is recorded there
  as the single acknowledged exception should it ever be revisited.
- `design-review` pass diffing built UI against the approved mock via screenshots, and
  self-screenshotting during drafting.

## Known issues

- `SETUP.md` has not yet been run by an agent. Its mechanics are verified with fixtures — the
  detection signals exist where it looks for them, and the upgrade diff applies — but whether an
  agent follows it faithfully is untested. Next #1.
- Native skill discovery is gone by design: no harness loads an XAC skill from its description.
  Whether the catalog's one-line "when" is enough to get ambient skills read is unmeasured.
- The test suite has only been run on Node 22.18 and Windows, though `package.json` claims
  `>=18`. macOS, Linux, and Node 18 are unverified.
- The `AGENTS.md` section is 12.8 kB, about 3.2k tokens every session, against a 15 kB budget
  enforced by a test. Measure before adding to it; the README's context bill must be re-measured
  when it changes.
