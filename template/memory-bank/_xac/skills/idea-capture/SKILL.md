---
name: idea-capture
description: Parks an idea in the ticket backlog fast, without derailing current work, and refines existing backlog pages toward ready when asked. Use when explicitly asked to save, park, or capture an idea for later, or to refine a backlog item. When the user parks an idea in passing, offer this — never write it unasked.
disable-model-invocation: true
---

# Idea capture

An idea arrives mid-work; the point is to park it fast and get back to what was happening.
Capture is not planning: no specification, no estimation, no design, no feasibility study.

## Capture

One page in `tickets/backlog/` from `memory-bank/_xac/templates/ticket.md`, `state: idea`, holding what the
user actually said plus the obvious context:

- The problem it solves — not the feature description
- Why not now
- Rough shape, a sentence or two
- Open questions
- What it would probably touch

Then add the `index.md` line, announce what was written, and return to the interrupted work.

If the idea duplicates or extends an existing backlog page, update that page instead of
adding a rival. Two pages for one idea is how the backlog stops being trusted.

## Offer, never assume

When the user parks an idea in passing — "would be nice someday", "not part of the MVP",
"save that thought" — offer to capture it. Write nothing until they say yes. A backlog of
ideas nobody asked to keep is the noise problem relocated, not solved.

## Refine

On request, sharpen an existing backlog page and advance its `state`:

- `idea` → `shaped` — problem stated properly, an approach sketched, the biggest open
  questions answered, blast radius named.
- `shaped` → `ready` — the four specification blocks are present and honest. Ready means it
  could be pulled into the next cycle and survive `plan-spec` scrutiny without rework.

Refining never moves a page into `active/`. Pulling work into a cycle is the user's move,
made when a cycle starts.
