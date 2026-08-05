---
name: security-audit
description: Audits changed code for leaked secrets, dangerous permissions, destructive operations, injection and traversal, missing validation, and unhandled failure paths. Use when explicitly asked for a security review, before a release, or before making a repository public.
disable-model-invocation: true
---

# Security audit

An agent implements the protections it is asked for and rarely proposes the ones it was not.
This pass asks for them explicitly.

Security is a process, not a ritual. This audit removes common mistakes. It does not make the
code safe, and saying otherwise is worse than not running it.

## Scope

Everything changed since the last audit, or the whole surface before a release or a repo going
public. Ask which.

## Checklist

Report findings before changing anything. Group by severity, cite file and line.

**Secrets**
- Credentials, tokens, keys, connection strings in source, config, fixtures, or tests.
- Real values in `.example` files.
- Secrets in log output, error messages, or exception payloads.
- Anything sensitive that is tracked by git. Check history, not just the working tree.

**Permissions and blast radius**
- Operations that write outside their intended directory.
- Destructive commands without a confirmation path.
- Overly broad file, network, or database permissions.
- Anything that reaches production from code paths that should not.

**Input handling**
- SQL, shell, and template injection.
- Path traversal on any user- or config-supplied path.
- Unvalidated deserialisation.
- Missing bounds on size, count, depth, or rate.

**Failure paths**
- Unwrapped or force-unwrapped values that can fail.
- Swallowed errors that hide a security-relevant failure.
- Fail-open defaults where fail-closed is correct.
- Missing timeouts on outbound calls.

**Authorisation**
- Endpoints or handlers with no ownership check.
- Checks on the client that are not repeated on the server.
- Role checks that permit more than intended.

**Dependencies**
- Known advisories in the dependency tree, if a scanner is available.
- Unpinned versions where a pin is warranted.

## Two passes find more than one

A single review misses things regardless of who runs it. Where it matters, suggest the user
run the same audit again with a different model. Findings differ between them.

## Finishing

1. Report every finding with severity, location, and the concrete fix.
2. Apply only the fixes the user approves. Security fixes still ship with tests.
3. If a finding revealed a durable trap, record it via `memory-write` as a `gotchas/` page.
4. State plainly what was not covered.
