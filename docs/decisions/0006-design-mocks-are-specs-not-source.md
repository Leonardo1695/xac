# 6. Design mocks are executable specs, not source

Date: 2026-08-05
Status: accepted

## Context

Developer agents invent visual and interaction decisions whenever no direction exists, and
they invent differently every session. Real design handoffs fail most often on missing
states — empty, loading, error — which the implementer then improvises. The template needed
a way to settle design before implementation without adding designers, design tools, or a
build step.

## Decision

The `design-discovery` skill produces single-file HTML mocks at
`design/<slug>/v<N>/<page>.html` in the project root: all CSS and JS inline, vanilla only,
real interactions against hardcoded data, every page showing empty, loading, error,
disabled, validation, hover and focus, and one mobile breakpoint. Tokens are declared once
as CSS custom properties. Fonts may load from a CDN with a mandatory fallback stack; icons
are inline SVG. Iterations are new version directories, never edits to a version the user
has seen.

The approved direction is recorded at `memory-bank/designs/<slug>.md` and linked from its
ticket via `design:`. Token changes to `designSystem.md` are staged, not applied. An always-
on clause in `engineering.mdc` makes the linked mock the spec: match layout, states, and
interactions; reimplement in the project's stack; ask where the mock is silent. Design stays
optional everywhere.

## Consequences

- The developer agent executes a look and behaviour already decided, instead of designing
  mid-implementation.
- Mocks are large files, and keeping them out of `memory-bank/` keeps the read protocol
  cheap. The bank holds the spec page; the artifact lives with the code.
- CDN fonts mean full fidelity needs a connection. The fallback stack keeps the mock
  readable offline, and the design page records what to install for production.
- The copy-paste temptation is named and banned: tokens and interaction semantics transfer,
  markup does not.

## Rejected alternatives

- **Mocks inside `memory-bank/designs/`.** A 40–80KB HTML file in the bank wrecks the
  "small enough to stay worth reading" rule.
- **Fully offline mocks.** More portable, visibly worse type. Fidelity with fallbacks won.
- **Separate CSS and JS files.** A spec should open with a double click and travel as one
  file.
- **Enforcing design-following only inside the skill.** The developer agent may never load
  that skill; the consumption contract had to be always-on.
