# XAC setup and upgrade

For the agent, working with the user. The installer copied XAC into `memory-bank/_xac/` and
changed nothing else. Everything outside that directory is done here, and nothing outside it
changes until the user has approved the summary in step 2.

The same procedure covers a first install, an upgrade, and an older install that used the
Cursor layout. Detection decides which parts apply.

## 1. Detect

Read-only. Check every signal before saying anything:

| Signal | How to check | What it means |
|---|---|---|
| XAC section | root `AGENTS.md` has a line starting `<!-- xac:begin` and a later one starting `<!-- xac:end` | Upgrade |
| Project instructions | root `AGENTS.md` exists without those markers | Merge the section into the user's file |
| No instructions | no root `AGENTS.md` | Create it |
| Legacy Cursor layout | any of the files in *Legacy files* below | An older XAC install to retire |
| Bank | `memory-bank/index.md` and the spine files exist | Keep it; only fill gaps |
| Bank elsewhere | `.cursor/memory-bank/`, `.cursor/rules/memory-bank/` | `memory-migrate` |
| Foreign memory | ADR folders, `notes/`, `.agent/`, exports from another memory tool | Offer `memory-migrate` |
| History | more than a handful of commits, or real `docs/` | Offer `memory-bootstrap` for an empty bank |
| `CLAUDE.md` | `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` exists | Claude Code will ignore `AGENTS.md` unless imported |
| `AGENTS.override.md` | exists at the root | Codex reads it instead of `AGENTS.md` |
| What XAC changed | `git status` and `git diff --stat` on `memory-bank/_xac/` | The content of this upgrade |
| Stale XAC files | the installer's report of `_xac/` files it no longer ships | Remove |

**Legacy files** — XAC's own, from the Cursor layout. Anything else under `.cursor/` belongs to
the project and is not touched:

- `.cursor/rules/core.mdc`, `memory-bank.mdc`, `engineering.mdc`, `agent-permissions.mdc`,
  `caveman.mdc`
- `.cursor/skills/<name>/` for each skill in `memory-bank/_xac/skills/`
- `memory-bank/_templates/`
- Any `.new` file those produced, including `AGENTS.md.new`
- A root `AGENTS.md` whose first heading is `# Agent instructions — XAC` — the old router

## 2. Summarise, then wait

One summary, grouped, before any change. The user approves it whole or in parts.

```text
XAC setup — <fresh install | upgrade | upgrade from the Cursor layout | adoption>

Create    AGENTS.md with the XAC section  |  memory-bank/<family>/ directories  | …
Change    AGENTS.md: <the section, or the diff below>  |  CLAUDE.md: add @AGENTS.md  | …
Migrate   <source> → <destination>, via memory-migrate
Remove    <legacy or stale XAC files, one per line>
Decide    <every question: placement, conflicts, modules, customised legacy rules>
```

Show the `AGENTS.md` change exactly: the full section for a new or merged file, the diff for an
upgrade. For an upgrade, also list which skills and templates changed.

## 3. Apply what was approved

### The `AGENTS.md` section

`memory-bank/_xac/AGENTS.block.md` is the section, markers included. Copy it verbatim.

- **No `AGENTS.md`:** create it with the section alone.
- **`AGENTS.md` without markers:** insert the section where the user chooses — default after the
  project's own introduction. Where the project's instructions contradict XAC's, list each pair
  and ask. Never drop the user's lines silently.
- **Upgrade:** compare the section in `AGENTS.md` with `AGENTS.block.md`. If they match, there
  is nothing to do. If not, the difference is XAC's change plus any local edits. Get XAC's change
  from git — `git diff -- memory-bank/_xac/AGENTS.block.md` while the install is uncommitted, or
  `git log -p -1 -- memory-bank/_xac/AGENTS.block.md` once it is — and apply that change to the
  section. With the file path in that diff rewritten to `AGENTS.md`, `git apply` usually does it
  mechanically; if it refuses, local edits overlap XAC's change. Local edits the change does not
  touch stay; overlapping ones go to the user. Without a git base, show the full difference and
  ask before replacing the section.

Local edits inside the markers are overwritten sooner or later. Offer to move them below the
section, where they are the project's own.

### Harness wiring

- **`CLAUDE.md` exists:** Claude Code reads `AGENTS.md` only when no `CLAUDE.md` does. Offer to
  add `@AGENTS.md` on its own line to the root `CLAUDE.md`.
- **`AGENTS.override.md` exists:** Codex reads it instead of `AGENTS.md`. Say so and ask
  whether the section belongs there too.
- **Size:** Codex stops reading instructions at 32 KiB, counting the user's global file. If
  `AGENTS.md` is past about 24 KiB, say so.

### Modules

Offer each file in `memory-bank/_xac/modules/`, default no. On yes, add one line directly after
`<!-- xac:end -->`, outside the section:

    Chat style: follow @memory-bank/_xac/modules/caveman.md

Leave the path bare, not in backticks. Claude Code treats `@path` as an import and loads the file
every session; elsewhere it is a pointer the agent follows.

### Legacy and stale files

- Before retiring a legacy rule or skill, compare it with its XAC successor. Lines the project
  added are its own: carry them into `AGENTS.md` below the section, or into a project skill,
  with approval.
- Remove only files on the approved list. Leave every other `.cursor/` file alone.
- Remove stale `_xac/` files the installer reported.

### The bank

- **No bank:** create the family directories, each with an empty `.gitkeep` so git keeps it:
  `decisions/`, `gotchas/`, `concepts/`, `procedures/`, `rules/`, `notes/`,
  `tickets/backlog/`, `tickets/active/`, `tickets/archive/`, `designs/`, `sessions/`,
  `_pending/`, `_lint/`. Then either run `memory-bootstrap`, for a repo with history, or fill
  the spine from `memory-bank/_xac/templates/` with the user's answers.
- **Bank exists:** create only missing directories. Pages are not touched.
- **Bank elsewhere, or foreign memory:** hand over to `memory-migrate`.

## 4. Verify

Check each item, then report the list:

- [ ] `AGENTS.md` has exactly one begin marker and one end marker, in that order.
- [ ] The section matches `AGENTS.block.md`, or every difference was approved.
- [ ] `AGENTS.md` is under 32 KiB.
- [ ] `CLAUDE.md`, if any, imports `@AGENTS.md`, or the user declined.
- [ ] No legacy or stale XAC file is left that the user approved removing, and no XAC `.new`
      file remains.
- [ ] Every family directory exists.
- [ ] `git status` shows the approved changes and nothing else.

## 5. Report

One short block: what was created, changed, migrated and removed, and anything still open. If
the bank exists, append to `memory-bank/log.md`:
`## [<ISO8601>] xac-setup | <fresh install | upgrade | legacy upgrade>`.

Committing is the user's call, like any other commit.

## Boundaries

- Nothing outside `memory-bank/_xac/` changes before the summary is approved.
- Never edit files inside `memory-bank/_xac/`. The next install overwrites them.
- Never delete the project's own rules, skills or instructions — only XAC's files, and only from
  the approved list.
- Never invent project facts to fill the spine. Ask, or run `memory-bootstrap`.
