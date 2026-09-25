#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// The product lives under template/, kept apart from the files that run this repo itself.
const templateRoot = join(packageRoot, "template");
const targetRoot = process.cwd();
const isDryRun = process.argv.includes("--dry-run");

// The one directory XAC owns in a project. The installer writes here and nowhere else;
// everything outside it is set up by the agent with the user (ADR 12).
const XAC_ROOT = "memory-bank/_xac";
const RETIRED_FLAGS = ["--personal", "--no-personal"];

// Lowercased because Windows reports the same directory with either drive-letter case.
if (targetRoot.toLowerCase() === packageRoot.toLowerCase()) {
  console.error("Refusing to install into the XAC source repository itself.");
  console.error("Run from a target project, or from test-install/ for local testing.");
  process.exit(1);
}

function toPosix(pathValue) {
  return pathValue.split(sep).join("/");
}

function listFilesRecursively(absoluteDir) {
  if (!existsSync(absoluteDir)) {
    return [];
  }
  const found = [];
  for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
    const absolutePath = join(absoluteDir, entry.name);
    found.push(...(entry.isDirectory() ? listFilesRecursively(absolutePath) : [absolutePath]));
  }
  return found;
}

function relativePaths(root, absoluteDir) {
  return listFilesRecursively(absoluteDir).map((absolutePath) => toPosix(relative(root, absolutePath)));
}

// Anything under template/ outside the owned directory is never shipped, so a stray file
// there cannot reach a user's project.
function collectPayload() {
  return relativePaths(templateRoot, templateRoot)
    .filter((posixPath) => posixPath.startsWith(`${XAC_ROOT}/`))
    .sort();
}

// git with core.autocrlf checks these files out with CRLF endings. That is the same content,
// and reporting it as an update on every run would bury the real ones.
function withoutCarriageReturns(bytes) {
  return Buffer.from(bytes.toString("utf8").replaceAll("\r\n", "\n"), "utf8");
}

function classify(posixPath) {
  const targetPath = join(targetRoot, posixPath);
  if (!existsSync(targetPath)) {
    return "create";
  }
  const sourceBytes = readFileSync(join(templateRoot, posixPath));
  const targetBytes = readFileSync(targetPath);
  const isSame =
    sourceBytes.equals(targetBytes) ||
    withoutCarriageReturns(sourceBytes).equals(withoutCarriageReturns(targetBytes));
  return isSame ? "identical" : "update";
}

function write(posixPath) {
  if (isDryRun) {
    return;
  }
  const targetPath = join(targetRoot, posixPath);
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(join(templateRoot, posixPath), targetPath);
}

// Files a previous version shipped and this one does not. Reported, never deleted:
// removing them is part of the guided upgrade.
function findStale(payload) {
  const shipped = new Set(payload);
  return relativePaths(targetRoot, join(targetRoot, XAC_ROOT)).filter((path) => !shipped.has(path));
}

function printList(heading, paths) {
  if (paths.length === 0) {
    return;
  }
  console.log(`\n${heading}`);
  for (const path of paths) {
    console.log(`  ${path}`);
  }
}

function report(buckets, stale) {
  const prefix = isDryRun ? "would " : "";
  printList(`${prefix}create ${buckets.create.length} file(s):`, buckets.create);
  printList(`${prefix}update ${buckets.update.length} file(s):`, buckets.update);
  if (buckets.update.length > 0) {
    console.log(`\n${XAC_ROOT}/ belongs to XAC and is overwritten on upgrade.`);
    console.log(`git diff ${XAC_ROOT}/ shows exactly what changed.`);
  }
  if (buckets.identical.length > 0) {
    console.log(`\nunchanged: ${buckets.identical.length} file(s) already match.`);
  }
  printList(`no longer shipped, left in place: ${stale.length} file(s):`, stale);
  if (buckets.create.length === 0 && buckets.update.length === 0) {
    console.log("\nNothing to copy.");
  }
}

function printNextSteps() {
  console.log("\nNext — nothing outside memory-bank/_xac/ has changed yet. Ask your agent:\n");
  console.log(`  Read ${XAC_ROOT}/SETUP.md and set up XAC.\n`);
  console.log("It works out whether this is a fresh install or an upgrade, shows you every");
  console.log("change it would make, and waits for your approval.\n");
}

function main() {
  console.log(isDryRun ? "\nXAC — dry-run (no files written)" : `\nXAC — copying into ${XAC_ROOT}/`);
  if (RETIRED_FLAGS.some((flag) => process.argv.includes(flag))) {
    console.log("--personal and --no-personal are no longer used: setup offers opt-in modules.");
  }

  const payload = collectPayload();
  const buckets = { create: [], update: [], identical: [] };
  for (const posixPath of payload) {
    const action = classify(posixPath);
    buckets[action].push(posixPath);
    if (action !== "identical") {
      write(posixPath);
    }
  }

  report(buckets, findStale(payload));
  printNextSteps();
  console.log(isDryRun ? "XAC dry-run complete.\n" : "XAC copy complete.\n");
}

main();
