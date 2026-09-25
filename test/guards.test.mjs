import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  createPackageCopy,
  createProject,
  installedPaths,
  packageRoot,
  removeProject,
  runInstaller,
} from "../test-support/helpers.mjs";

const STRAY_BODY = "# a bank in the wrong place\n";

test("refuses to install into the XAC source repository itself", () => {
  // --dry-run as well as the guard: if the guard ever regresses, this test fails without
  // scattering the payload across the repo root it is meant to protect.
  const result = runInstaller(packageRoot, ["--dry-run", "--no-personal"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing to install into the XAC source repository itself\./);
  assert.ok(!existsSync(join(packageRoot, "memory-bank")), "payload reached the repo root");
  assert.ok(!existsSync(join(packageRoot, "AGENTS.md.new")), "payload reached the repo root");
});

test("rejects --personal and --no-personal together", () => {
  const projectRoot = createProject();
  try {
    const result = runInstaller(projectRoot, ["--personal", "--no-personal"]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Use only one of --personal or --no-personal\./);
    assert.deepEqual(installedPaths(projectRoot), []);
  } finally {
    removeProject(projectRoot);
  }
});

test("reports a memory bank outside the project root without moving it", () => {
  const projectRoot = createProject();
  try {
    const strayPage = join(projectRoot, ".cursor", "memory-bank", "index.md");
    mkdirSync(dirname(strayPage), { recursive: true });
    writeFileSync(strayPage, STRAY_BODY);

    const result = runInstaller(projectRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Found a memory bank outside the project root:/);
    assert.match(result.stdout, /\.cursor\/memory-bank/);
    assert.equal(readFileSync(strayPage, "utf8"), STRAY_BODY, "the stray bank was touched");
  } finally {
    removeProject(projectRoot);
  }
});

test("installs no memory bank content beyond the scaffold", () => {
  const projectRoot = createProject();
  try {
    runInstaller(projectRoot);

    const bankPaths = installedPaths(projectRoot).filter((posixPath) =>
      posixPath.startsWith("memory-bank/"),
    );
    assert.ok(bankPaths.length > 0, "no memory bank scaffold was installed at all");
    for (const posixPath of bankPaths) {
      const isScaffold =
        posixPath.startsWith("memory-bank/_templates/") || posixPath.endsWith("/.gitkeep");
      assert.ok(isScaffold, `${posixPath} is memory bank content, not scaffold`);
    }
  } finally {
    removeProject(projectRoot);
  }
});

// The guard above only proves the current template is clean. This one proves the filter
// works, by putting a page in a throwaway copy of the payload and installing from that.
test("a page committed under template/memory-bank/ is still never installed", () => {
  const packageCopy = createPackageCopy();
  const projectRoot = createProject();
  try {
    writeFileSync(join(packageCopy, "template", "memory-bank", "notes", "leaked.md"), STRAY_BODY);

    const result = runInstaller(projectRoot, ["--no-personal"], packageCopy);

    assert.equal(result.status, 0, result.stderr);
    assert.ok(
      !installedPaths(projectRoot).includes("memory-bank/notes/leaked.md"),
      "a page under template/memory-bank/ reached the target project",
    );
  } finally {
    removeProject(projectRoot);
    removeProject(packageCopy);
  }
});
