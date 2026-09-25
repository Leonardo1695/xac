# Development

Working on XAC itself. This repo runs no memory bank — `.cursor/rules/repo-source.mdc`
explains the boundary. Continuity lives in `docs/roadmap.md` and git history.

## Layout

The product is everything under `template/`, shipped verbatim by `bin/cli.mjs`. The root
holds the factory: `docs/`, `bin/`, factory-only `.cursor/rules/`, and `test-install/`
(gitignored) as the local install playground. Full tree and rationale:
`docs/architecture.md` and [ADR 7](decisions/0007-template-directory-separates-product-from-factory.md).

## Stack

- Markdown for every rule, skill, template, and page shape.
- Node 18+ for the installer (`bin/cli.mjs`). ES modules, Node built-ins only, zero
  dependencies. Adding one would mean a lockfile, an audit surface, and an install step for a
  tool whose whole claim is that it has no runtime.
- Distribution via `npx github:Leonardo1695/xac`. No publish step, no build step. The repo is
  the package. Interactive installs ask about personal modules; `--personal` /
  `--no-personal` skip the prompts for scripts and CI.
- Windows and PowerShell are the primary development environment: no `&&` chaining, no
  bash-only utilities.

## Verification

| Check | Command | Expected |
|---|---|---|
| Root refusal | `node bin/cli.mjs` from the repo root | exits 1, refuses to install into the source repo |
| Clean install | run the CLI from `test-install/` or an empty dir | full payload created (50 files as of 2026-08-05) |
| Idempotent re-run | run it again in the same directory | every payload file unchanged, nothing to do |
| Conflict path | run over a customised copy of a payload file | `.new` parked beside it, original untouched |
| Package payload | `npm pack --dry-run` | only `bin/` and `template/` paths, plus npm's own three; under `template/memory-bank/`, only `_templates/` and `.gitkeep` |
| Tests | `npm test` | 15 pass, roughly two seconds |

`npm test` covers every row above it, so it is the one command to run before reporting work
done. The rows remain because they are what to reach for when a test fails and you want to see
the behaviour by hand.

## Tests

`node --test`, no framework, no dependencies — `node:test` plus `node:assert/strict`.

```text
test/install-paths.test.mjs    create, identical, conflict, parked, dry-run, personal opt-in
test/guards.test.mjs           root refusal, flag conflict, misplaced bank, payload boundary
test/package-payload.test.mjs  what npm pack would ship
test-support/helpers.mjs       temp projects, installer invocation, path listing
```

Every test drives the real CLI as a child process against a temporary directory. Nothing runs
in-process, so there is no way for a test to pass against an implementation that would fail a
real install.

**The helper lives outside `test/` deliberately.** Node's runner treats *every* file under a
directory named `test` as a test file, so a helper module placed there is executed and reported
as a passing suite with no assertions — inflating the count and confusing the output. There is
no file-level exclude flag to fix it with; moving the file is the fix.

**Tests that need a dirty payload copy it first.** `createPackageCopy()` clones `bin/` and
`template/` into a temp directory so a test can, for example, plant a page under
`template/memory-bank/` and prove the installer refuses to ship it. Mutating the real
`template/` instead would race every other test that installs from it, because the runner runs
test files in parallel.

**The suite is mutation-checked.** Seven deliberate regressions were introduced into
`bin/cli.mjs` one at a time — disabling the root guard, removing the memory-bank filter,
removing parked-conflict detection, making conflicts overwrite the original, making personal
modules non-optional, making `--dry-run` write, and removing misplaced-bank detection. Each
one fails at least one test. Worth repeating after changing the installer: a test suite that
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
lists to keep in sync anymore. `isShippable` in `bin/cli.mjs` still guards two invariants at
install time: personal modules are opt-in (prompt or `--personal`), and `template/memory-bank/`
may only carry `_templates/` and `.gitkeep` markers.

**`caveman.mdc` is a personal style module.** On a TTY the installer asks; `--personal`
includes it, `--no-personal` and non-TTY installs skip it (default off).
