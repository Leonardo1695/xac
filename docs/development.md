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
  the package.
- Windows and PowerShell are the primary development environment: no `&&` chaining, no
  bash-only utilities.

## Verification

| Check | Command | Expected |
|---|---|---|
| Root refusal | `node bin/cli.mjs` from the repo root | exits 1, refuses to install into the source repo |
| Clean install | run the CLI from `test-install/` or an empty dir | full payload created (50 files as of 2026-08-05) |
| Idempotent re-run | run it again in the same directory | every payload file unchanged, nothing to do |
| Conflict path | run over a customised copy of a payload file | `.new` parked beside it, original untouched |
| Package payload | `npm pack --dry-run` | only `bin/` and `template/` paths; under `template/memory-bank/`, only `_templates/` and `.gitkeep` |
| Tests | none yet — see roadmap | — |

## Packaging gotchas

**`files` in `package.json` overrides `.gitignore`.** npm falls back to `.gitignore` as a
pack filter only when there is no `files` field and no `.npmignore`. With a `files` allowlist
present, the allowlist decides, and `.gitignore` is not consulted for anything it names. This
once nearly shipped this repo's own working pages inside the tarball: the entry was
`memory-bank`, so the whole subtree was pulled in regardless of ignore rules.

**The payload boundary is the directory.** `files` is `bin` plus `template`, and repo-only
files live outside `template/`, so they cannot leak by construction — there are no exclusion
lists to keep in sync anymore. `isShippable` in `bin/cli.mjs` still guards two invariants at
install time: personal modules ship only behind `--personal`, and `template/memory-bank/`
may only carry `_templates/` and `.gitkeep` markers.

**`caveman.mdc` is a personal style module** and ships only behind `--personal`.
