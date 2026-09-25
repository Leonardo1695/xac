// Lives outside test/ because Node's test runner treats every file under a directory named
// `test` as a test file. Kept here, it stays a library instead of a phantom passing suite.

import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const templateRoot = join(packageRoot, "template");

// The one directory the installer may write, restated rather than imported (see below).
export const XAC_ROOT = "memory-bank/_xac";

// A throwaway copy of bin/ + template/, so a test can put a file in the payload without
// touching the real product tree and racing every other test that installs from it.
export function createPackageCopy() {
  const copyRoot = mkdtempSync(join(tmpdir(), "xac-pkg-"));
  cpSync(join(packageRoot, "bin"), join(copyRoot, "bin"), { recursive: true });
  cpSync(templateRoot, join(copyRoot, "template"), { recursive: true });
  return copyRoot;
}

export function toPosix(pathValue) {
  return pathValue.split(sep).join("/");
}

export function createProject() {
  return mkdtempSync(join(tmpdir(), "xac-test-"));
}

export function removeProject(projectRoot) {
  rmSync(projectRoot, { recursive: true, force: true });
}

export function runInstaller(projectRoot, args = [], fromPackageRoot = packageRoot) {
  const cliPath = join(fromPackageRoot, "bin", "cli.mjs");
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot,
    encoding: "utf8",
    windowsHide: true,
  });
}

export function listFiles(absoluteDir) {
  const found = [];
  for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
    const absolutePath = join(absoluteDir, entry.name);
    if (entry.isDirectory()) {
      found.push(...listFiles(absolutePath));
    } else {
      found.push(absolutePath);
    }
  }
  return found;
}

export function templatePaths() {
  return listFiles(templateRoot).map((absolutePath) => toPosix(relative(templateRoot, absolutePath)));
}

export function installedPaths(projectRoot) {
  return listFiles(projectRoot)
    .map((absolutePath) => toPosix(relative(projectRoot, absolutePath)))
    .sort();
}

// Restated rather than imported from bin/cli.mjs on purpose. A test that reuses the
// implementation's own filter only proves the implementation agrees with itself.
export function shippablePaths() {
  return templatePaths()
    .filter((posixPath) => posixPath.startsWith(`${XAC_ROOT}/`))
    .sort();
}
