import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  createPackageCopy,
  createProject,
  installedPaths,
  packageRoot,
  removeProject,
  runInstaller,
  shippablePaths,
} from "../test-support/helpers.mjs";

const STRAY_BODY = "# must never reach a project\n";

test("refuses to install into the XAC source repository itself", () => {
  // --dry-run as well as the guard: if the guard ever regresses, this test fails without
  // scattering the payload across the repo root it is meant to protect.
  const result = runInstaller(packageRoot, ["--dry-run"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing to install into the XAC source repository itself\./);
  assert.ok(!existsSync(join(packageRoot, "memory-bank")), "payload reached the repo root");
});

test("the retired --personal flags are accepted with a notice and change nothing", () => {
  const projectRoot = createProject();
  try {
    const result = runInstaller(projectRoot, ["--no-personal"]);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /--personal and --no-personal are no longer used/);
    assert.deepEqual(installedPaths(projectRoot), shippablePaths());
  } finally {
    removeProject(projectRoot);
  }
});

// The clean-install test only proves the current template is clean. This one proves the
// boundary holds, by planting files outside memory-bank/_xac/ in a throwaway payload copy.
test("a file under template/ but outside memory-bank/_xac/ is never installed", () => {
  const packageCopy = createPackageCopy();
  const projectRoot = createProject();
  try {
    const template = join(packageCopy, "template");
    mkdirSync(join(template, "memory-bank", "notes"), { recursive: true });
    writeFileSync(join(template, "AGENTS.md"), STRAY_BODY);
    writeFileSync(join(template, "memory-bank", "notes", "leaked.md"), STRAY_BODY);

    const result = runInstaller(projectRoot, [], packageCopy);

    assert.equal(result.status, 0, result.stderr);
    const installed = installedPaths(projectRoot);
    assert.ok(!installed.includes("AGENTS.md"), "template/AGENTS.md reached the project");
    assert.ok(!installed.includes("memory-bank/notes/leaked.md"), "a page reached the project");
  } finally {
    removeProject(projectRoot);
    removeProject(packageCopy);
  }
});
