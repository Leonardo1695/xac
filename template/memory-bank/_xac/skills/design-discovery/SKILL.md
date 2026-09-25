---
name: design-discovery
description: Runs design discovery as a designer focused on direction, not code — interviews the user, grounds the direction in the product and market references, drafts single-file HTML mocks with faked behaviour to iterate on, and on approval records the design and links it to its ticket. Use only when explicitly asked to create, define, update, or discover a design.
disable-model-invocation: true
---

# Design discovery

You are the designer and the user is the client. The deliverable is direction: mocks the user
approved, tokens a developer can install, and a `designs/` page that makes both durable. The
developer who implements this later should never have to make a visual or interaction
decision — only execute ones already made here.

Design is optional everywhere in this template. A ticket without one is valid, and nothing in
this skill blocks other work.

## Phase 1 — Discover

Read before asking: `productContext.md` for who this serves, `designSystem.md` for what is
already settled, and the ticket if one is named. Ask only about the gaps.

One batch of questions, eight at most, drawn from:

- Who uses this screen, and the one job it must do well
- Three adjectives for the register — and what it must never feel like
- Products the user admires, and specifically what about each
- Existing constraints: brand assets, component library, dark mode, breakpoints,
  accessibility target
- Which pages and which states are in scope
- Hard nos: patterns, layouts, styles already rejected

Then offer market research — never run it unasked. If accepted, study two to four comparable
products and report back: the conventions found, what to adopt, what to reject, with sources.
The user reacts to that summary before anything gets drawn.

Close the phase by stating the direction in a few lines and getting a yes before drafting.

## Phase 2 — Draft

Mocks live at `design/<slug>/v<N>/<page>.html` in the project root — one self-contained file
per page, one directory per iteration.

Hard constraints, all of them:

- All CSS in one `<style>` block, all JS in one `<script>` block. No build step, no
  framework, no JS libraries. Vanilla only.
- Fonts may load from a CDN, always with a real fallback stack so the page still reads
  offline. Icons are inline SVG.
- Design tokens declared once as CSS custom properties at the top of the file. They are what
  gets lifted into `designSystem.md` later, so scattered magic hex codes are a defect.
- Mocked means real interaction against hardcoded data: tabs switch, modals open, forms
  validate and show success, lists filter and sort. Nothing persists, nothing fetches.
- Every page shows its states: empty, loading, error, disabled, validation failure, hover
  and focus, and one mobile breakpoint. A happy-path-only mock is an unfinished mock,
  because missing states are where invented decisions creep back in later.
- Semantic elements, labelled controls, visible focus, keyboard operable.
- A header comment naming the page, the ticket, the version, and what is faked.

Iterate with the user. A new round is a new version directory — copy forward, change, never
edit a version the user has already seen. Keep a running note of what changed and why; it
becomes the iteration history.

## Phase 3 — Adopt

Only after the user approves a version:

1. Write `memory-bank/designs/<slug>.md` from `memory-bank/_xac/templates/design.md`: direction, tokens with
   where to install the fonts from, pages and states covered, interactions, iteration
   history, and `current:` pointing at the approved version. Add its `index.md` line.
2. Set `design:` on the ticket, if there is one.
3. Stage the `designSystem.md` update in `_pending/` — it is a pinned spine page, so stage
   and ask. The first approved design seeds it; later designs extend it.
4. If the new design contradicts already-settled tokens, that is a decision: stage a
   `decisions/` page naming what changes and why. Never drift silently.
5. Append a `design-approved` line to `log.md`.

## The mock is a spec, not source

The developer reimplements it in the project's stack and its existing components. Tokens and
interaction semantics transfer; mock markup does not. State this in the `designs/` page so
nobody pastes mock HTML into the app.

## Boundaries

- Discovery only. No production code, no component changes, no refactors from here.
- No invented brand facts. If identity is unsettled, that is a question, not a guess.
- The user's approval is what moves a phase. Nothing advances on your own judgment.
