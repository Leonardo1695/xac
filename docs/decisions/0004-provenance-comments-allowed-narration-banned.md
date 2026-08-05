# 4. Provenance comments are allowed, narration is not

Date: 2026-08-05
Status: accepted

## Context

Two defensible positions collided. One holds that comments are noise and code should explain
itself, so an agent should add none. The other holds that agents read comments, benefit from
them, and that comments carry information the code genuinely cannot — which argues for letting an
agent comment freely and never pruning what it wrote.

Both are right about different kinds of comment.

## Decision

Split the rule by what the comment carries.

Allowed, and expected where it applies: provenance. The bug this guards against, the upstream
issue, the business rule that forces this order, the incident that made this necessary.

Banned: narration of what the code does, and explanation of the change being made. The latter
belongs in the commit message.

Refactoring must not strip existing provenance comments — they are the hardest context to
recover and the easiest to delete by reflex.

## Consequences

- The context that is genuinely unrecoverable from code survives refactors.
- Reviewers still do not have to read captions on obvious operations.
- The distinction requires judgment on every comment, which is a slower rule to follow than a
  blanket yes or no.

## Rejected alternatives

- **No comments at all.** Loses the one category of comment that cannot be reconstructed. Also
  causes agents to delete provenance left by earlier work, since removal reads as tidying.
- **Let the agent comment freely and never prune.** Produces captions on obvious lines, which cost
  tokens on every read for no gain, and trains reviewers to skim comments generally.
