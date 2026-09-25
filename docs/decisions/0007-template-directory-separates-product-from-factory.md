# 7. The product lives in template/, apart from the factory

Date: 2026-08-05
Status: accepted, amended by [ADR 12](0012-agents-md-is-the-entry-point.md)

Amended 2026-09-25. The factory/product split stands; the payload's shape changes. `template/`
will hold only `memory-bank/_xac/`, still mapped one-to-one into the target, and the root's
`.cursor/rules/` factory rule folds into the root `AGENTS.md`.

## Context

The product originally lived in this repo's live locations — `.cursor/rules/`,
`.cursor/skills/`, `memory-bank/`, `AGENTS.md` at the root — on the theory that shipping the
same files the repo runs on ("dogfooded payload") meant one source and no drift.

In practice it merged the factory with the product. The scaffold at the root looked like an
active memory bank and kept inviting initialisation. The product's rules governed work on the
factory, and had to be neutralised with a repo-only override. The installer and the package
needed exclusion filters (`REPO_ONLY_FILES`, a `!` negation in `files`) that had to be kept
in agreement by hand. Humans and agents alike kept mistaking the source repository for a
consumer of itself.

## Decision

The entire payload lives under `template/`, verbatim: `.cursor/rules/`, `.cursor/skills/`,
`memory-bank/` scaffold, `AGENTS.md`. The installer sources from `template/` and maps paths
one-to-one into the target project. `files` in `package.json` is `bin` plus `template`.

The root keeps factory-only files that never ship: a single compact working rule in
`.cursor/rules/`, a factory-facing `AGENTS.md`, `docs/`, and `bin/`. `memory-bank.mdc`
exists only inside `template/` — nothing at the root mentions a memory bank. The CLI
refuses to run when the target directory is the package root itself.

## Consequences

- Repo-specific files cannot leak into the payload by construction. Both exclusion filters
  were deleted rather than maintained.
- Nothing at the repo root looks like a memory bank, so nothing invites writing one.
- Live dogfooding of the product rules in this repo ends. Product behaviour gets exercised
  in scratch consumer projects instead, which tests the real thing — the installed layout.
- The factory works under its own compact rule instead of running the product's. Nothing at
  the root duplicates `template/` content, so there is no copy drift to manage.
- Tarball paths moved under `template/`; installed paths in target projects are unchanged.

## Rejected alternatives

- **Dogfooded root layout** — the original design. One source, no drift, but the drift it
  prevented turned out cheaper than the confusion it caused. Superseded by this decision.
- **`src/` as the directory name.** Implies compilation. These files ship byte-for-byte;
  `template/` says what it is.
- **Keeping the exclusion filters** — the previous fix. Mechanically sound, verified
  working, and still left everyone looking at a memory bank scaffold at the root of a repo
  that must never use one.
