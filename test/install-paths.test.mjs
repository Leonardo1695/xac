import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  XAC_ROOT,
  createProject,
  installedPaths,
  removeProject,
  runInstaller,
  shippablePaths,
  templateRoot,
} from "../test-support/helpers.mjs";

const EDITED_BODY = "# edited inside _xac, which upgrades overwrite\n";
const EDITED_PATH = `${XAC_ROOT}/skills/plan-spec/SKILL.md`;
const RETIRED_PATH = `${XAC_ROOT}/skills/retired-skill/SKILL.md`;

// What a real project already has before XAC arrives, including an older Cursor-layout
// install. The installer must leave every one of these byte for byte.
const PROJECT_FILES = {
  "AGENTS.md": "# My project\nBuild with make.\n",
  "CLAUDE.md": "# Claude notes\n",
  ".cursor/rules/core.mdc": "---\nalwaysApply: true\n---\n# older XAC core\n",
  "memory-bank/index.md": "# Index\n- decisions/0001-db.md — which database?\n",
};

function writeFile(projectRoot, posixPath, body) {
  const absolutePath = join(projectRoot, posixPath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, body);
  return absolutePath;
}

test("clean install copies every payload file byte for byte, and nothing else", () => {
  const projectRoot = createProject();
  try {
    const result = runInstaller(projectRoot);

    assert.equal(result.status, 0, result.stderr);
    const expected = shippablePaths();
    assert.deepEqual(installedPaths(projectRoot), expected);
    for (const posixPath of expected) {
      assert.deepEqual(
        readFileSync(join(projectRoot, posixPath)),
        readFileSync(join(templateRoot, posixPath)),
        `${posixPath} does not match the template`,
      );
    }
    assert.ok(expected.includes(`${XAC_ROOT}/modules/caveman.md`), "opt-in modules are copied");
    assert.match(result.stdout, /create \d+ file\(s\)/);
    assert.match(result.stdout, /Read memory-bank\/_xac\/SETUP\.md and set up XAC\./);
    assert.match(result.stdout, /XAC copy complete\./);
  } finally {
    removeProject(projectRoot);
  }
});

test("nothing outside memory-bank/_xac/ is written, even into a project with its own files", () => {
  const projectRoot = createProject();
  try {
    for (const [posixPath, body] of Object.entries(PROJECT_FILES)) {
      writeFile(projectRoot, posixPath, body);
    }

    const result = runInstaller(projectRoot);

    assert.equal(result.status, 0, result.stderr);
    for (const [posixPath, body] of Object.entries(PROJECT_FILES)) {
      assert.equal(readFileSync(join(projectRoot, posixPath), "utf8"), body, `${posixPath} changed`);
    }
    const expected = [...Object.keys(PROJECT_FILES), ...shippablePaths()].sort();
    assert.deepEqual(installedPaths(projectRoot), expected, "a file appeared outside the payload");
  } finally {
    removeProject(projectRoot);
  }
});

test("re-running an identical install reports unchanged and writes nothing new", () => {
  const projectRoot = createProject();
  try {
    runInstaller(projectRoot);
    const before = installedPaths(projectRoot);

    const result = runInstaller(projectRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(installedPaths(projectRoot), before);
    assert.match(result.stdout, /unchanged: \d+ file\(s\) already match\./);
    assert.match(result.stdout, /Nothing to copy\./);
  } finally {
    removeProject(projectRoot);
  }
});

test("an edited file inside memory-bank/_xac/ is overwritten on upgrade, with no .new", () => {
  const projectRoot = createProject();
  try {
    runInstaller(projectRoot);
    const edited = writeFile(projectRoot, EDITED_PATH, EDITED_BODY);

    const result = runInstaller(projectRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(readFileSync(edited), readFileSync(join(templateRoot, EDITED_PATH)));
    assert.ok(!existsSync(`${edited}.new`), "a .new file was parked");
    assert.match(result.stdout, /update 1 file\(s\):/);
    assert.match(result.stdout, /git diff memory-bank\/_xac\/ shows exactly what changed\./);
  } finally {
    removeProject(projectRoot);
  }
});

// A clone on a machine with core.autocrlf checks every payload file out with CRLF endings.
test("a payload file that differs only in line endings counts as unchanged", () => {
  const projectRoot = createProject();
  try {
    runInstaller(projectRoot);
    const crlfPath = join(projectRoot, EDITED_PATH);
    const crlfBody = readFileSync(crlfPath, "utf8").replaceAll("\n", "\r\n");
    writeFileSync(crlfPath, crlfBody);

    const result = runInstaller(projectRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(crlfPath, "utf8"), crlfBody, "the checkout's endings were rewritten");
    assert.match(result.stdout, /Nothing to copy\./);
  } finally {
    removeProject(projectRoot);
  }
});

test("a file the payload no longer ships is reported and left in place", () => {
  const projectRoot = createProject();
  try {
    runInstaller(projectRoot);
    const retired = writeFile(projectRoot, RETIRED_PATH, EDITED_BODY);

    const result = runInstaller(projectRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(retired, "utf8"), EDITED_BODY, "the stale file was touched");
    assert.match(result.stdout, /no longer shipped, left in place: 1 file\(s\):/);
    assert.match(result.stdout, /memory-bank\/_xac\/skills\/retired-skill\/SKILL\.md/);
  } finally {
    removeProject(projectRoot);
  }
});

test("--dry-run reports the work and writes nothing", () => {
  const projectRoot = createProject();
  try {
    const result = runInstaller(projectRoot, ["--dry-run"]);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(installedPaths(projectRoot), []);
    assert.match(result.stdout, /would create \d+ file\(s\)/);
    assert.match(result.stdout, /XAC dry-run complete\./);
  } finally {
    removeProject(projectRoot);
  }
});

test("--dry-run over an edited file reports the update and leaves the file alone", () => {
  const projectRoot = createProject();
  try {
    runInstaller(projectRoot);
    const edited = writeFile(projectRoot, EDITED_PATH, EDITED_BODY);

    const result = runInstaller(projectRoot, ["--dry-run"]);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(edited, "utf8"), EDITED_BODY, "--dry-run overwrote a file");
    assert.match(result.stdout, /would update 1 file\(s\):/);
  } finally {
    removeProject(projectRoot);
  }
});
