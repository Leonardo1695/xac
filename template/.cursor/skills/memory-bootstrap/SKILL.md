---
name: memory-bootstrap
description: Seeds an empty memory bank from a codebase that already has history — mining the repo's own docs, its manifests, and its git log for decisions, traps, and conventions, then drafting the spine and a first set of pages for approval. Use only when explicitly asked to bootstrap, seed, or cold-start a memory bank in an existing project.
disable-model-invocation: true
---

# Memory bootstrap

Installing XAC into a project with two years of history leaves fifty empty files that nobody
fills. This is the fix: read what the repository already knows and write it down.

Distinct from `memory-migrate`, which adopts *existing memory pages* in some other layout. This
adopts *the codebase itself*, and runs when there is no prior memory at all.

## The gate that matters

Everything here is reconstruction, and reconstruction invites invention. The whole skill is
worthless — worse than worthless — if it produces confident pages about decisions nobody made.

- Every claim carries `evidence`: a commit SHA, a file path and line, or a quoted line from the
  repo's own docs.
- A claim you cannot source is a **question for the user**, not a page.
- Everything lands in `memory-bank/_pending/`. Nothing is applied without approval, including
  the pages that would normally be write-and-announce.
- When the repo and your inference disagree, the repo wins.

Say this to the user before starting, so they know what they are reviewing.

## 1. Inventory

Read, in this order, and stop when you have enough:

| Source | What it yields |
|---|---|
| `README`, `CONTRIBUTING`, `docs/` | Purpose, audience, setup, the project's own vocabulary |
| Existing ADRs or `decisions/` in any form | Decisions already written — adopt, do not rewrite |
| Package manifests, lockfiles, framework config | Stack, versions, boundaries for `techContext.md` |
| CI config, scripts, test setup | The verification commands, which `techContext.md` must carry |
| Directory layout | Module boundaries for `systemPatterns.md` |
| `.env.example`, config schemas | Integration points — never the real values |

## 2. Mine the history

Git is the largest untapped source of durable knowledge in most repositories.

```powershell
git log --oneline -n 400
git log --pretty=format:"%h %s" --grep="revert" -i
git log --pretty=format:"%h %s" --grep="fix" -i -n 100
```

The most-changed files — the same count in either shell:

```powershell
git log --format="" --name-only -n 400 | Sort-Object | Group-Object | Sort-Object Count -Descending | Select-Object -First 20
```

```sh
git log --format="" --name-only -n 400 | sort | uniq -c | sort -rn | head -20
```

Read the signal, not the volume:

- **Revert chains and fix-of-a-fix sequences** are gotcha candidates by construction. Three
  commits fighting the same file is a trap someone already paid for.
- **Files changed far more often than their neighbours** are either the system's hot core or its
  brittle spot. Both belong in `systemPatterns.md` or a `concepts/` page.
- **Commits that introduce a dependency, then remove it** are a decision with a rejected
  alternative already attached — the most valuable shape a `decisions/` page can have.
- **Long-lived TODO and FIXME comments** are backlog tickets, not knowledge.

Read the diffs of the handful of commits that look load-bearing. Commit subjects alone are not
evidence; they are a pointer to it.

## 3. Interview

The repository cannot tell you why. Ask, and keep it short — a handful of questions, not a
form:

- What is this project for, and who uses it?
- What is the one thing a new contributor always gets wrong?
- Which parts are you confident in, and which are held together with tape?
- What has been tried and abandoned?
- What must never happen in production?

Answers to these are the spine. They are also the pages with no other source, so quote the user
as their evidence.

## 4. Draft

Write in this order, because each one narrows the next:

1. `projectbrief.md` and `productContext.md` — from the interview and the README.
2. `techContext.md` — stack, versions, and the **verification commands**. Run them. A command
   that does not work is not a verification command, and this file is the one every later
   session trusts.
3. `systemPatterns.md` — module boundaries and the conventions the code actually follows, not
   the ones it should.
4. `decisions/` — only where a real alternative was visibly rejected.
5. `gotchas/` — only reproducible traps with a durable cause, from revert and fix chains.
6. `concepts/` — the two or three subsystems someone must understand to work here.
7. `activeContext.md` and `progress.md` — where the project is right now.
8. `index.md` — last, one line per page, phrased as the question that page answers.

Leave `designSystem.md` empty unless the project has a real design language. An invented design
system is worse than none.

## 5. Hand over

Report what was staged, grouped by family, with the evidence for each in one line. Then stop.
The user promotes what they recognise and rejects what they do not — and the rejections are the
useful part, because they say where your reading of the repo was wrong.

## Boundaries

- Six to twelve pages is a good bootstrap. Thirty is a bad one: volume is not fidelity, and a
  bank nobody trusts gets ignored wholesale.
- Never write a `sessions/` page. Nothing happened; there was no session.
- Never invent a version, a date, an owner, or a rationale.
- Never bootstrap over an existing bank. That is `memory-migrate`.
