import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  createProject,
  installedPaths,
  removeProject,
  runInstaller,
  shippablePaths,
  templateRoot,
} from "../test-support/helpers.mjs";

const CUSTOMISED_BODY = "# my own rules, do not touch\n";
const CONFLICT_PATH = ".cursor/rules/core.mdc";

function writeCustomised(projectRoot, posixPath, body) {
  const absolutePath = join(projectRoot, posixPath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, body);
  return absolutePath;
}

test("clean install creates every shippable file byte for byte", () => {
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
    assert.match(result.stdout, /created \d+ file\(s\)/);
    assert.match(result.stdout, /XAC install complete\./);
  } finally {
    removeProject(projectRoot);
  }
});

test("--no-personal leaves the opt-in style module out", () => {
  const projectRoot = createProject();
  try {
    runInstaller(projectRoot);

    assert.ok(!installedPaths(projectRoot).includes(".cursor/rules/caveman.mdc"));
  } finally {
    removeProject(projectRoot);
  }
});

test("--personal installs the opt-in style module", () => {
  const projectRoot = createProject();
  try {
    const result = runInstaller(projectRoot, ["--personal"]);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(installedPaths(projectRoot), shippablePaths({ personal: true }));
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
    assert.match(result.stdout, /Nothing to do\./);
  } finally {
    removeProject(projectRoot);
  }
});

test("a customised payload file is parked as .new and left alone", () => {
  const projectRoot = createProject();
  try {
    const customised = writeCustomised(projectRoot, CONFLICT_PATH, CUSTOMISED_BODY);

    const result = runInstaller(projectRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(customised, "utf8"), CUSTOMISED_BODY, "the user's file was overwritten");
    assert.deepEqual(
      readFileSync(`${customised}.new`),
      readFileSync(join(templateRoot, CONFLICT_PATH)),
    );
    assert.match(result.stdout, /parked 1 XAC conflict\(s\) as \*\.new/);
  } finally {
    removeProject(projectRoot);
  }
});

test("an already-parked conflict is recognised, not parked again", () => {
  const projectRoot = createProject();
  try {
    const customised = writeCustomised(projectRoot, CONFLICT_PATH, CUSTOMISED_BODY);
    runInstaller(projectRoot);
    const before = installedPaths(projectRoot);

    const result = runInstaller(projectRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(installedPaths(projectRoot), before, "a second .new file appeared");
    assert.equal(readFileSync(customised, "utf8"), CUSTOMISED_BODY);
    assert.match(result.stdout, /awaiting reconciliation: 1 file\(s\) already parked as \.new\./);
    assert.doesNotMatch(result.stdout, /parked 1 XAC conflict/);
  } finally {
    removeProject(projectRoot);
  }
});

test("--dry-run reports the work and writes nothing", () => {
  const projectRoot = createProject();
  try {
    const result = runInstaller(projectRoot, ["--dry-run", "--no-personal"]);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(installedPaths(projectRoot), []);
    assert.match(result.stdout, /XAC dry-run complete\./);
  } finally {
    removeProject(projectRoot);
  }
});
