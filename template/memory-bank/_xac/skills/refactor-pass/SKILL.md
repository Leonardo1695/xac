---
name: refactor-pass
description: Runs a deliberate cleanup pass over recently changed code — dead code, duplication, oversized units, magic values, missing tests, leaked complexity — without changing behaviour. Use when explicitly asked to refactor, clean up, or tidy code, or after a large feature has landed.
disable-model-invocation: true
---

# Refactor pass

Code accumulates because features get added and nothing gets removed. This pass removes.
Behaviour does not change.

## Precondition

Tests must be green before starting, and there must be tests covering the area being touched.
If there are not, run `test-pass` first or say plainly that this refactor is unverifiable.

Never change behaviour during a refactor. If a bug turns up, note it and leave it — fixing it
is a separate increment with its own test.

## Scope

Refactor what recently changed, not the whole codebase. Ask for the boundary if it is unclear:
last increment, last feature, a directory, a module.

## Checklist

Work through it and report findings before changing anything.

- **Dead code** — unreachable branches, unused exports, commented-out blocks, abandoned flags.
- **Duplication** — the same logic in two or more places. Extract on the second occurrence.
- **Oversized units** — functions past 20 lines, files past 500. Split by responsibility.
- **Mixed responsibility** — a module doing two unrelated jobs. Separate them.
- **Magic values** — unexplained literals. Name them, or document why the value is what it is.
- **Weak names** — anything that greps badly, or that no longer matches what the thing does.
- **Missing types** — implicit `any`, untyped public surfaces, loose return types.
- **Deep nesting** — replace with guard clauses and early returns.
- **Silent failures** — swallowed errors, empty catch blocks, ignored return values.
- **Thin exception messages** — no offending value, no expected shape.
- **Missing tests** — anything touched that has no coverage.
- **Leaked internals** — third-party types crossing a module boundary that should own its own.

## What not to remove

- Provenance comments. The bug reference, the upstream issue, the reason a weird order exists.
  These are the hardest context to recover and the easiest to delete by reflex.
- Defensive checks whose reason is not obvious. Ask before removing one.

## Finishing

1. Run the verification commands from `memory-bank/techContext.md`. Everything green.
2. Report what was removed, what was extracted, and what was deliberately left alone.
3. If the pass revealed a durable trap or a structural decision, record it via `memory-write`.

## Signal to stop and rethink instead

If the same area keeps breaking as it is cleaned up, and each fix breaks a neighbour, this is
not a refactor problem. The structure is wrong. Stop, say so, and propose replacing the
approach rather than continuing to shape it.
