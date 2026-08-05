---
name: memory-migrate
description: Migrates any existing project memory into the XAC memory-bank schema, and reconciles parked *.new rule/skill conflicts from an XAC install. Asks where the source memory lives first — XAC-style paths or elsewhere — then inventories, maps into families, and applies only with approval. Use when asked to migrate, adopt, or upgrade existing memory, or to reconcile parked XAC files.
disable-model-invocation: true
---

# Memory migrate

Bring whatever memory this project already has into XAC. The source may be an older
XAC-shaped bank, a Cursor variant path, or an entirely different layout or tool. The
existing content is the valuable part — nothing is deleted, and nothing moves or is
rewritten without approval.

Work through this with the user, a step at a time. Report after each step and wait.

## 1. Ask where the source is

**Do this before scanning or creating anything.** Ask the user which applies:

1. **XAC-style location** — memory already lives under one of:
   - `memory-bank/`
   - `.cursor/memory-bank/`
   - `.cursor/rules/memory-bank/`
2. **Elsewhere** — a different folder, tool export, docs tree, ticket tracker dump, or
   custom layout. Ask them to **point at the path** (or describe it clearly enough to find).

Do not invent a source tree. Do not assume the project already uses XAC layout.

If they choose (1) and more than one of those three paths exists, list what is in each and
ask which is authoritative.

If they choose (2) and have not given a path, only then offer common places to check
(`docs/`, `notes/`, `tickets/`, `.agent/`, ADR directories, and similar) — still wait for them
to confirm or correct before treating anything as source.

If they only need parked `*.new` rule/skill reconcile and have no prior memory to import,
skip to step 7.

## 2. Inventory

List every file under the agreed source with its size and last-modified date. Classify each
by **role**, not by filename:

| Class | Meaning |
|---|---|
| Spine | Project brief, product context, patterns, tech, progress, design system, active focus |
| Decision | A choice made, with or without rejected alternatives |
| Trap / gotcha | Something that went wrong and how it was fixed |
| Concept | Durable knowledge about how the system works |
| Procedure | A workflow where the sequence matters |
| Ticket / work item | Idea, backlog item, in-flight task, or closed work |
| Working state | Current focus, sprint notes, handoff |
| Episodic | Session log or record of something that happened |
| Unclear | Needs the user to say what it is |

Show the classification as a table. Ask about everything in Unclear. Do not guess.

## 3. Map into XAC

Propose a `source → memory-bank/…` mapping for each item. Target families:

| Role | Typical XAC target |
|---|---|
| Spine | Matching spine file under `memory-bank/` |
| Decision | `memory-bank/decisions/` |
| Trap | `memory-bank/gotchas/` |
| Concept | `memory-bank/concepts/` |
| Procedure | `memory-bank/procedures/` |
| Ticket | `memory-bank/tickets/backlog/`, `active/`, or `archive/` |
| Working state | `activeContext.md`, `handoff.md`, or a note |
| Episodic | `memory-bank/sessions/` |

Present the full mapping. Adjust until the user approves. Nothing is written yet.

## 4. Scaffold

Ensure the XAC `memory-bank/` shape exists at the project root: family directories,
`_templates/`, `_pending/`, `_lint/`, and spine files that are still missing. Create only
what is missing. Touch no existing content yet.

If the source was a Cursor variant path, the destination remains `memory-bank/` at the
project root — do not leave the bank under `.cursor/`.

## 5. Apply (two cases)

### Near-XAC (source was already under an XAC-style path)

- Add frontmatter in place where pages stay put: infer `kind` and `tier`, set `entities`
  from content, pin the spine, set `authority` when clear (`canonical` / `historical`),
  leave ambiguous `authority` empty and list it for the user.
- Then propose relocating pages into families as `from → to`. Apply only approved moves.
- Never rewrite page bodies during this path — frontmatter and approved moves only.

### Foreign (source was elsewhere)

- Create XAC pages under `memory-bank/` from the approved mapping. Prefer carrying content
  over faithfully; synthesise only when the user agrees a rewrite is clearer.
- Link each new page’s `evidence` back to the source path so origin stays traceable.
- Leave the foreign originals untouched until the user explicitly asks to archive or remove
  them. Never delete source files as part of migration.

In both cases: if content contradicts itself across pages, report it for `memory-maintain`
later. Migration is not the time to resolve contradictions.

## 6. Build the index

Write `memory-bank/index.md`: one line per page, path, then what question it answers.
Group by family. Keep it under 200 lines — if larger, say so and propose merges rather than
truncating.

## 7. Reconcile parked XAC files (rules and skills too)

After an XAC install or upgrade, differing files are parked as `<name>.new` beside the
original. The existing path is the project's copy. The `.new` file is the incoming XAC
version. Nothing was overwritten.

Find every parked file under `.cursor/rules/`, `.cursor/skills/`, and the project root
(for example `AGENTS.md.new`). For each pair:

1. Read both versions.
2. Show the user what differs.
3. Ask what to keep: adopt XAC, keep the project copy, or merge specific lines.
4. Apply only what they approve. Delete the `.new` file once reconciled.

Never silently drop a project's own rules or skills. Do not stop at `memory-bank/` — rule
and skill conflicts are part of this step.

## 8. Record

Write `memory-bank/sessions/<date>-memory-bank-migration.md` covering: where the source was,
what was found, the approved mapping, what was created or moved, parked files reconciled,
and what is still unresolved. Append a `log.md` line with the `migrated` event.

## Boundaries

- Always ask where the source memory is before acting (step 1).
- Never delete a source page or foreign original unless the user explicitly asks.
- Never move, overwrite, or synthesise without approval.
- Never invent project facts to fill spine gaps — ask.
- Destination schema is always XAC `memory-bank/` at the project root.
