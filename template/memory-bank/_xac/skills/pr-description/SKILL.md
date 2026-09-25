---
name: pr-description
description: Writes a pull request description from the actual diff — why the change exists, what changed, how to verify it, and what the risks are. Use when the user asks for a PR description, a PR body, or a summary of branch changes to hand to a reviewer.
disable-model-invocation: true
---

# PR description

Writing a description is not opening a PR. Opening a PR needs explicit approval — see the
gated actions in `AGENTS.md`.

## Read the diff, not the intent

Base the description on `git diff <base>...HEAD` and the commit log across the whole branch,
not on what the work was supposed to do. What actually changed is what the reviewer is
approving.

Read every commit on the branch, not only the latest.

## Format

```markdown
## Why

<!-- The problem this solves, in two or three sentences. A reviewer who knows nothing about
     the ticket should understand why this exists. -->

## What changed

<!-- Grouped by area, not file by file. One bullet per meaningful change. -->

- **<area>** — <what changed and why it needed to>

## How to verify

<!-- Commands the reviewer can run, and what they should see. -->

1.

## Risks

<!-- Behaviour changes, migrations, anything that needs care on deploy, anything not covered
     by tests. Write "none" only if it is true. -->

## Out of scope

<!-- Deliberately left for later, so the reviewer does not flag it as missing. -->
```

Drop any section that would be empty, except Risks — an empty Risks section is a claim worth
making explicitly.

## Rules

- Describe behaviour change separately from behaviour-preserving change. Reviewers care about
  the difference far more than about line counts.
- Name migrations, config changes, and new environment variables explicitly. These are what
  break deploys.
- If tests were not added for something, say so and why. Do not let the reviewer discover it.
- No filler. No "this PR aims to". No restating the title.
- Normal technical English, complete sentences.

## Before handing it over

Check the branch for anything that should not ship: leftover debug output, commented code,
`.env` files, credentials, or unrelated changes swept in. Report them rather than describing
them as features.
