# Development

Working on XAC itself. This repo runs no memory bank — the root `AGENTS.md` explains the
boundary. Continuity lives in `docs/roadmap.md` and git history.

## Layout

The product is everything under `template/memory-bank/_xac/`, shipped verbatim by
`bin/cli.mjs`. The root holds the factory: `docs/`, `bin/`, `test/`, the factory's own
`AGENTS.md`, and `test-install/` (gitignored) as the local install playground. Full tree and rationale:
`docs/architecture.md` and [ADR 7](decisions/0007-template-directory-separates-product-from-factory.md).

## Stack

- Markdown for every rule, skill, template, and page shape.
- Node 18+ for the installer (`bin/cli.mjs`). ES modules, Node built-ins only, zero
  dependencies. Adding one would mean a lockfile, an audit surface, and an install step for a
  tool whose whole claim is that it has no runtime.
- Distribution via `npx github:Leonardo1695/xac`. No publish step, no build step. The repo is
  the package. The installer only copies; setup is the agent's job, through `SETUP.md`.
- Windows and PowerShell are the primary development environment: no `&&` chaining, no
  bash-only utilities.

## Verification

| Check | Command | Expected |
|---|---|---|
| Root refusal | `node bin/cli.mjs` from the repo root | exits 1, refuses to install into the source repo |
| Clean install | run the CLI from `test-install/` or an empty dir | `memory-bank/_xac/` created (37 files as of 2026-09-25), nothing else |
| Idempotent re-run | run it again in the same directory | every payload file unchanged, nothing to copy |
| Upgrade path | edit a file under `memory-bank/_xac/`, run again | the file is overwritten, no `.new` anywhere |
| Package payload | `npm pack --dry-run` | only `bin/` and `template/memory-bank/_xac/` paths, plus npm's own three |
| Tests | `npm test` | 18 pass, roughly two seconds |

`npm test` covers every row above it, so it is the one command to run before reporting work
done. The rows remain because they are what to reach for when a test fails and you want to see
the behaviour by hand.

## Tests

`node --test`, no framework, no dependencies — `node:test` plus `node:assert/strict`.

```text
test/install-paths.test.mjs       create, identical, CRLF, overwrite, stale files, dry-run, the boundary
test/guards.test.mjs              root refusal, retired flags, nothing outside _xac/ ever ships
test/package-payload.test.mjs     what npm pack would ship
test/payload-integrity.test.mjs   AGENTS.block.md budget and markers, catalog, path references
test-support/helpers.mjs          temp projects, installer invocation, path listing
```

Every test drives the real CLI as a child process against a temporary directory. Nothing runs
in-process, so there is no way for a test to pass against an implementation that would fail a
real install.

**The helper lives outside `test/` deliberately.** Node's runner treats *every* file under a
directory named `test` as a test file, so a helper module placed there is executed and reported
as a passing suite with no assertions — inflating the count and confusing the output. There is
no file-level exclude flag to fix it with; moving the file is the fix.

**Tests that need a dirty payload copy it first.** `createPackageCopy()` clones `bin/` and
`template/` into a temp directory so a test can, for example, plant a file outside
`template/memory-bank/_xac/` and prove the installer refuses to ship it. Mutating the real
`template/` instead would race every other test that installs from it, because the runner runs
test files in parallel.

**The suite is mutation-checked.** Thirteen deliberate regressions were introduced one at a
time, in a scratch copy, on 2026-09-25. Nine in `bin/cli.mjs`: disabling the root guard,
removing the `_xac/` boundary filter, skipping updates, making `--dry-run` write, parking
updates as `.new`, not reporting stale files, deleting stale files, writing `AGENTS.md`, and
comparing line endings strictly.
Four in the payload: pushing `AGENTS.block.md` over budget, dropping a catalog row, adding a
second begin marker, and renaming a referenced template. Each one fails at least one test. Worth repeating after changing the installer: a test suite that
passes against a broken implementation is worse than none, because it reports confidence it has
not earned.

Verified on Node 22.18 and Windows. `package.json` claims `>=18`; the suite uses nothing newer
than `node:fs.cpSync` (16.7) and the stable `node:test` runner, but it has not been run on 18.

## Packaging gotchas

**`files` in `package.json` overrides `.gitignore`.** npm falls back to `.gitignore` as a
pack filter only when there is no `files` field and no `.npmignore`. With a `files` allowlist
present, the allowlist decides, and `.gitignore` is not consulted for anything it names. This
once nearly shipped this repo's own working pages inside the tarball: the entry was
`memory-bank`, so the whole subtree was pulled in regardless of ignore rules.

**The payload boundary is the directory.** `files` is `bin` plus `template`, and repo-only
files live outside `template/`, so they cannot leak by construction — there are no exclusion
lists to keep in sync. `collectPayload` in `bin/cli.mjs` still copies only what sits under
`template/memory-bank/_xac/`, so a stray file elsewhere in `template/` never reaches a project.

**Opt-in modules ship always and are enabled by setup.** `modules/caveman.md` is copied like
every other payload file; `SETUP.md` offers it and, on yes, adds an `@`-import line to the
project's `AGENTS.md` outside the XAC section. The installer's old `--personal` /
`--no-personal` flags are accepted with a notice and do nothing.

**Line endings are not content.** With `core.autocrlf`, a clone checks the payload out with CRLF
endings. The installer compares with carriage returns stripped, so such a checkout reports
unchanged instead of "updating" every file on every run — which, under the old parking model,
would have parked a `.new` beside each one.

**Budget the section, not the payload.** `AGENTS.block.md` is loaded every session on every
harness, so `test/payload-integrity.test.mjs` fails past 15 KiB or 250 lines. Skills and
templates cost nothing until read and have no budget.
