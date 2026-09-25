import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { XAC_ROOT, shippablePaths, templateRoot } from "../test-support/helpers.mjs";

// The section every harness loads every session. Codex caps the combined AGENTS.md chain at
// 32 KiB, the user's own instructions included; Claude Code's guidance is about 200 lines.
const BLOCK_PATH = join(templateRoot, XAC_ROOT, "AGENTS.block.md");
const BLOCK_BUDGET_BYTES = 15 * 1024;
const BLOCK_BUDGET_LINES = 250;
const skillsRoot = join(templateRoot, XAC_ROOT, "skills");

function readBlock() {
  return readFileSync(BLOCK_PATH, "utf8");
}

function skillNames() {
  return readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

test("AGENTS.block.md stays inside its always-on budget", () => {
  const block = readBlock();

  const bytes = Buffer.byteLength(block, "utf8");
  const lines = block.split("\n").length;
  assert.ok(bytes <= BLOCK_BUDGET_BYTES, `${bytes} bytes, budget ${BLOCK_BUDGET_BYTES}`);
  assert.ok(lines <= BLOCK_BUDGET_LINES, `${lines} lines, budget ${BLOCK_BUDGET_LINES}`);
});

test("AGENTS.block.md is wrapped in exactly one pair of markers", () => {
  const lines = readBlock().trimEnd().split(/\r?\n/);

  assert.match(lines[0], /^<!-- xac:begin/);
  assert.match(lines.at(-1), /^<!-- xac:end/);
  assert.equal(lines.filter((line) => line.startsWith("<!-- xac:begin")).length, 1);
  assert.equal(lines.filter((line) => line.startsWith("<!-- xac:end")).length, 1);
});

test("the skill catalog lists every shipped skill and nothing else", () => {
  const catalogued = [...readBlock().matchAll(/^\| `([a-z-]+)` \|/gm)].map((match) => match[1]);

  assert.deepEqual([...catalogued].sort(), skillNames());
});

test("every skill's frontmatter name matches its directory", () => {
  for (const name of skillNames()) {
    const body = readFileSync(join(skillsRoot, name, "SKILL.md"), "utf8");
    assert.match(body, new RegExp(`^---\\r?\\nname: ${name}\\r?\\n`), `${name}/SKILL.md`);
  }
});

// A reference to a payload path that does not exist is a broken instruction: the agent is
// told to read a file that is not there. Placeholders such as skills/<name>/ stop the match
// at the angle bracket, leaving the directory, which must exist too.
test("every memory-bank/_xac/ path the payload mentions exists", () => {
  for (const posixPath of shippablePaths()) {
    const body = readFileSync(join(templateRoot, posixPath), "utf8");
    for (const [reference] of body.matchAll(/memory-bank\/_xac\/[\w./-]*/g)) {
      const target = reference.replace(/[.]+$/, "");
      assert.ok(existsSync(join(templateRoot, target)), `${posixPath} mentions ${target}`);
    }
  }
});
