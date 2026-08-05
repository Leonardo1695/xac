---
name: test-pass
description: Closes test gaps for recently changed code and makes the suite runnable headless from one command. Covers what to test, what not to, and how to structure fakes. Use when explicitly asked to add or improve tests, before a refactor of untested code, or when the verification loop is unreliable.
disable-model-invocation: true
---

# Test pass

The suite is the feedback loop. Without it, every change is a guess that needs manual review,
which costs more than writing the test would have.

## First: is the loop usable?

Check `memory-bank/techContext.md` for the verification commands and run them. The suite must:

- run from one documented command
- need no manual database seeding, no interactive prompts, no real credentials
- produce predictable, parseable output
- finish fast enough to run on every change

If any of those fail, fixing that comes first. Then update `techContext.md` with the correct
commands.

## Scope

Recently changed code, not the whole codebase. Ask for the boundary if unclear.

## Priority order

1. **Regression tests for fixed bugs.** Every fix gets one, pinning the exact failure.
2. **Business logic.** The rules that make this project what it is.
3. **Boundary and error paths.** Empty, null, zero, maximum, malformed, timeout, denied.
4. **Contracts.** Anything another module or service depends on.

## Not worth testing

- Framework behaviour, language behaviour, third-party internals.
- Getters, trivial pass-throughs, generated code.
- Anything where the test would just restate the implementation.

A test that cannot fail is worse than no test — it costs time to run and creates false
confidence.

## Structure

- One behaviour per test. The name says the behaviour and the expected outcome.
- Fast, independent, repeatable, self-validating. No ordering dependencies, no shared mutable
  state, no reliance on wall-clock time or network.
- Mock external I/O with named fake classes, not inline stubs. A named fake is reusable and
  readable; an inline stub is neither.
- Assert on behaviour, not on internal call sequences. Tests that assert implementation break
  on every refactor and protect nothing.

## Finishing

1. Full suite green.
2. Report what was covered, what was deliberately left, and any gap that needs a decision.
3. If a test exposed a durable trap, record it via `memory-write` as a `gotchas/` page.
