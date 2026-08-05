---
name: memory-migrate
description: Adopts an existing project's memory bank into the current schema without losing accumulated content. Inventories what is already there, adds frontmatter, builds an index, and proposes moving pages into families. Use only when explicitly asked to migrate, adopt, or upgrade an existing memory bank.
disable-model-invocation: true
---

# Memory migrate

One-time adoption of an existing memory bank. The existing content is the valuable part — it
is why this project has continuity at all. Nothing gets deleted, and nothing moves without
approval.

Work through this with the user, a step at a time. Report after each step and wait.

## 1. Locate

Check all of these before creating anything:

- `memory-bank/`
- `.cursor/memory-bank/`
- `.cursor/rules/memory-bank/`

If more than one exists, list what is in each and ask which is authoritative. Never create a
new memory bank next to an existing one.

## 2. Inventory

List every file found with its size and last-modified date. Classify each into one of:

| Class | Meaning |
|---|---|
| Spine | Maps to one of the seven core files |
| Family candidate | A decision, trap, concept, or procedure in disguise |
| Working state | Current focus, sprint notes, in-flight status |
| Episodic | A record of something that happened |
| Unclear | Needs the user to say what it is |

Show the classification as a table. Ask about everything in Unclear. Do not guess.

## 3. Scaffold

Create only what is missing: family directories, `_templates/`, `_pending/`, `_lint/`,
`index.md`, `log.md`, `handoff.md`. Touch no existing file yet.

## 4. Annotate in place

Add frontmatter to existing pages without moving or rewriting them. Infer `kind` and `tier`
from content. Set `entities` from what the page actually talks about. Pin the spine. Set
`authority: canonical` on pages that are clearly current, `historical` on pages that read as a
record of the past.

Where a page's status is genuinely ambiguous, leave `authority` empty and list it for the user.

## 5. Build the index

Write one line per page: path, then what question it answers. Group by family. Keep it under
200 lines — if the existing bank is larger than that, say so and propose merges rather than
truncating.

## 6. Propose moves

Now, and only now, propose relocating pages into families. Present it as a list of
`from → to` with a reason each. Apply only what the user approves. Anything not approved stays
exactly where it is.

For each moved page, leave the original path referenced in the new page's frontmatter
`evidence` so history is traceable.

## 7. Reconcile rules

If the project has customised rule files that were replaced during install, the previous
versions are parked alongside as `.new` files or in a backup directory. Read both, show the
user what differs, and ask which project-specific rules should be carried into the new files.
Never silently drop a project's own rules.

## 8. Record

Write `memory-bank/sessions/<date>-memory-bank-migration.md` covering what was found, what was
annotated, what moved, and what is still unresolved. Append a `log.md` line with the `migrated`
event.

## Boundaries

- Never delete an existing page.
- Never rewrite the body of an existing page during migration. Frontmatter only.
- Never move a file without approval.
- If content contradicts itself across pages, report it as a finding for `memory-maintain` to
  handle later. Migration is not the time to resolve contradictions.
