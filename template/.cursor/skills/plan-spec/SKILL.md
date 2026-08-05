---
name: plan-spec
description: Turns a request into a specified, verifiable task and gates it before execution. Covers the four required blocks of a specification, sizing increments, approval gates for destructive work, and when to propose alternatives instead of following instructions literally. Use when starting non-trivial work, when a request is vague, when scope is unclear, or when planning a change that touches many files or cannot be easily undone.
---

# Plan and specify

## The four blocks

Every non-trivial task needs all four. Any missing block is a question to ask, not a gap to
fill with assumptions.

**1. What is wanted.** The goal in plain language.

**2. How, in broad strokes.** Enough direction to stay aligned, loose enough that a better
approach can still be proposed.

**3. What is not wanted.** The block most often skipped and the one that matters most. It is
where the unspoken assumptions live — the library not to use, the pattern already rejected,
the file not to touch, the scope not to expand into.

**4. How we verify it landed.** The concrete done signal: a command that passes, an output
that changes, a behaviour that can be checked. Without it there is nothing to verify against,
so "done" becomes an opinion.

Scale the effort to the stakes. A throwaway experiment needs a sentence. Anything that ships
needs all four blocks stated properly.

## Method, not just outcome

For multi-step or long-running work, specify how it is structured, not only what it produces:

- Break it into numbered, independently runnable steps.
- Make each step idempotent so a crash or interruption resumes rather than restarts.
- Keep progress in durable storage, not in memory.
- Declare what the work is allowed to write, and what it must never touch.

## Increment size

One coherent change per increment. It should be describable in one sentence, verifiable on its
own, and revertible without unpicking anything else. If the sentence needs an "and", it is two
increments.

## Gates

**Plan gate.** State the full plan before touching anything. Wait for approval. Do not fold
extra work in along the way — if something else needs doing, say so and let the user decide.

**Apply gate for destructive work.** Anything that deletes, overwrites, moves in bulk, or
cannot be easily undone splits into two phases:

1. Plan phase — produce the exact list of what would change, and show it.
2. Apply phase — runs only after explicit approval of that list.

Declare a hard boundary before starting: what may be written, and what is off limits
regardless of what the plan says. Anything not explicitly in scope stays untouched.

## Propose, do not just comply

Once the context is established, stop waiting for instructions and start offering judgment.
Given the goal and constraints, say what the best approach looks like, what the alternatives
cost, and which one is recommended. Following a weak instruction literally when a better path
is visible wastes the one thing worth having here.

Say something immediately when:

- the requested solution is more complex than the problem needs
- an assumption in the request is wrong
- the goal is achievable a materially simpler way
- the work is heading somewhere that will be expensive to reverse

## During execution

- Report progress at each increment. Do not go quiet and return with everything at once.
- Verify green before claiming anything is done.
- Stop and say so if the same area keeps breaking as it gets patched. Repeated patching that
  keeps breaking neighbouring behaviour is brittleness; it needs a different approach, not
  another patch.
- Write to the memory bank at the milestones in `memory-bank.mdc`, not continuously.
