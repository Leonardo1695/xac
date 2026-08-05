---
name: memory-write
description: Writes a page into the memory bank with the correct family, frontmatter, links, and index entry, and reconciles it against pages it contradicts. Use when recording a decision, a trap and its fix, durable knowledge about the system, a repeatable procedure, or when a memory bank page needs updating.
---

# Memory write

## Pick the family

| The insight is | Family | Template |
|---|---|---|
| A choice made between real alternatives | `decisions/` | `decision.md` |
| A reproducible trap with a durable cause | `gotchas/` | `gotcha.md` |
| How part of this system actually works | `concepts/` | `concept.md` |
| A workflow where the order matters | `procedures/` | `procedure.md` |
| An always/never instruction for future agents | `rules/` | `note.md` shape, `kind: rule` |
| A unit of planned work, or an idea for later | `tickets/` — `backlog/`, `active/`, or `archive/` | `ticket.md` |
| An approved design direction for a page or flow | `designs/` | `design.md` |
| A useful fact that fits none of the above yet | `notes/` | `note.md` |

If it fits a family, it does not go in `notes/`. `notes/` is the exception, not the default.

File names are lowercase, hyphenated, and describe the content the way someone would search
for it. `gotchas/tls-fingerprint-blocks-http-client.md`, not `gotchas/bug-3.md`.

## Frontmatter

Copy the template, then set every field deliberately.

- `kind` — matches the family.
- `tier` — `semantic` for durable knowledge, `procedural` for procedures, `episodic` for
  anything tied to a moment, `working` for current-state slots.
- `pinned` — only for the spine and pages that must never decay. Pinned pages are not
  rewritten without the user's say.
- `expires_at` — set it whenever the fact is tied to a sprint, a version, or a temporary
  state. An unset TTL on a temporary fact is how stale claims survive.
- `entities` — up to ten lowercase nouns someone might search. This is the recall mechanism;
  a page with no entities is hard to find later.
- `authority` — `canonical` for the current source of truth, `active` for useful but not
  definitive, `superseded` / `historical` for retired, `do-not-answer-from` for pages kept
  only as a record.
- `evidence` — for durable claims, cite where the knowledge came from: a session page and a
  bounded quote, a file path, a command output, an issue link.

## Write order

1. Write the page.
2. Reconcile: search for pages this contradicts, extends, or duplicates. Update them. If it
   replaces one, set the old page's `authority: superseded` and link forward to the new one.
   A new page that leaves a contradiction standing makes the bank less trustworthy, not more.
3. Add the index line last: `- path — what question it answers`.
4. Append a `log.md` line if the page marks a milestone.

## Links

Use `[[decisions/page-name]]`. Two to five chosen links beat exhaustive linking. Zero links
should be rare. A link to a page that does not exist yet is fine; it resolves when it lands.

## Style

- State conclusions, not narration. "Slot inheritance runs on create, not on update" — not
  "we investigated and found that...".
- No invented content. Do not add sections the source material does not support: no
  best-practice lists, no alternatives never actually considered, no consequences nobody
  observed. If a section has nothing real in it, delete the section.
- No invented specifics. Never guess a version, date, path, function name, or error code.
- Keep pages short. One concept per page. Split rather than sprawl.

## Posture

- `gotchas/`, `notes/`, `sessions/`, `tickets/`, `designs/`, `progress.md`,
  `activeContext.md`, `log.md` — write, then say what was recorded.
- `decisions/`, `rules/`, anything pinned, anything in the spine — write to
  `memory-bank/_pending/`, say what is staged, wait for approval.
