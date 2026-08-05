#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// The product lives under template/, kept apart from the files that run this repo itself.
const templateRoot = join(packageRoot, "template");
const targetRoot = process.cwd();

const isDryRun = process.argv.includes("--dry-run");
const flagPersonal = process.argv.includes("--personal");
const flagNoPersonal = process.argv.includes("--no-personal");

// Lowercased because Windows reports the same directory with either drive-letter case.
if (targetRoot.toLowerCase() === packageRoot.toLowerCase()) {
  console.error("Refusing to install into the XAC source repository itself.");
  console.error("Run from a target project, or from test-install/ for local testing.");
  process.exit(1);
}

if (flagPersonal && flagNoPersonal) {
  console.error("Use only one of --personal or --no-personal.");
  process.exit(1);
}

const PAYLOAD_ROOTS = [".cursor/rules", ".cursor/skills", "memory-bank"];
const PAYLOAD_FILES = ["AGENTS.md"];
// Opt-in modules: asked on a TTY, or forced by --personal / skipped by --no-personal.
const PERSONAL_MODULES = [
  {
    paths: [".cursor/rules/caveman.mdc"],
    prompt: "Install caveman chat style (terse agent prose)? [y/N] ",
  },
];
const PERSONAL_RULES = PERSONAL_MODULES.flatMap((module) => module.paths);
const ALTERNATE_BANK_PATHS = [".cursor/memory-bank", ".cursor/rules/memory-bank"];

function toPosix(pathValue) {
  return pathValue.split(sep).join("/");
}

function listFilesRecursively(absoluteDir) {
  const found = [];
  for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
    const absolutePath = join(absoluteDir, entry.name);
    if (entry.isDirectory()) {
      found.push(...listFilesRecursively(absolutePath));
    } else {
      found.push(absolutePath);
    }
  }
  return found;
}

async function askYesNo(question, defaultYes = false) {
  const rl = createInterface({ input, output });
  try {
    const answer = (await rl.question(question)).trim().toLowerCase();
    if (answer === "") {
      return defaultYes;
    }
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

// Flags win. TTY asks per module (default no). Non-TTY / CI defaults to off.
async function resolvePersonalPaths() {
  if (flagPersonal) {
    return new Set(PERSONAL_RULES);
  }
  if (flagNoPersonal) {
    return new Set();
  }
  if (!input.isTTY || !output.isTTY) {
    return new Set();
  }

  const selected = new Set();
  for (const module of PERSONAL_MODULES) {
    if (await askYesNo(module.prompt, false)) {
      for (const path of module.paths) {
        selected.add(path);
      }
    }
  }
  return selected;
}

// Everything under template/ ships, with two guards: personal style modules are opt-in, and
// memory-bank/ may only ever carry the scaffold — templates and directory markers.
function isShippable(posixPath, personalPaths) {
  if (PERSONAL_RULES.includes(posixPath) && !personalPaths.has(posixPath)) {
    return false;
  }
  if (posixPath.startsWith("memory-bank/")) {
    return posixPath.startsWith("memory-bank/_templates/") || posixPath.endsWith("/.gitkeep");
  }
  return true;
}

function collectPayload(personalPaths) {
  const payload = [];
  for (const root of PAYLOAD_ROOTS) {
    const absoluteRoot = join(templateRoot, root);
    if (!existsSync(absoluteRoot)) {
      continue;
    }
    for (const absolutePath of listFilesRecursively(absoluteRoot)) {
      payload.push(toPosix(relative(templateRoot, absolutePath)));
    }
  }
  for (const file of PAYLOAD_FILES) {
    if (existsSync(join(templateRoot, file))) {
      payload.push(file);
    }
  }
  return payload.filter((posixPath) => isShippable(posixPath, personalPaths)).sort();
}

function classify(posixPath) {
  const targetPath = join(targetRoot, posixPath);
  if (!existsSync(targetPath)) {
    return "create";
  }
  const sourceBytes = readFileSync(join(templateRoot, posixPath));
  if (sourceBytes.equals(readFileSync(targetPath))) {
    return "identical";
  }
  // A customised target stays different forever, so re-parking it on every run would report
  // the same conflict indefinitely.
  const parkedPath = `${targetPath}.new`;
  if (existsSync(parkedPath) && sourceBytes.equals(readFileSync(parkedPath))) {
    return "parked";
  }
  return "conflict";
}

function write(posixPath, action) {
  const sourcePath = join(templateRoot, posixPath);
  const targetPath = join(targetRoot, action === "conflict" ? `${posixPath}.new` : posixPath);
  if (isDryRun) {
    return;
  }
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
}

function findMisplacedBanks() {
  return ALTERNATE_BANK_PATHS.filter((candidate) => existsSync(join(targetRoot, candidate)));
}

function report(created, conflicts, alreadyParked, identical, misplacedBanks) {
  const prefix = isDryRun ? "would " : "";

  if (created.length > 0) {
    console.log(`\n${prefix}created ${created.length} file(s):`);
    for (const path of created) {
      console.log(`  ${path}`);
    }
  }

  if (conflicts.length > 0) {
    console.log(`\n${prefix}parked ${conflicts.length} conflict(s) alongside the existing file:`);
    for (const path of conflicts) {
      console.log(`  ${path}.new`);
    }
    console.log("\nThese targets already exist with different content. Nothing was overwritten.");
    console.log("Ask the agent to run the memory-migrate skill to reconcile them with you.");
  }

  if (alreadyParked.length > 0) {
    console.log(`\nawaiting reconciliation: ${alreadyParked.length} file(s) already parked as .new.`);
  }

  if (identical.length > 0) {
    console.log(`\nunchanged: ${identical.length} file(s) already match.`);
  }

  if (created.length === 0 && conflicts.length === 0) {
    console.log("\nNothing to do.");
  }

  if (misplacedBanks.length > 0) {
    console.log("\nFound a memory bank outside the project root:");
    for (const path of misplacedBanks) {
      console.log(`  ${path}`);
    }
    console.log("The canonical location is memory-bank/ at the project root.");
    console.log("Nothing was moved. The memory-migrate skill will propose consolidating it.");
  }

  console.log("\nNext: open the project in Cursor and ask the agent to initialise the memory");
  console.log("bank from memory-bank/_templates/, or to migrate an existing one.\n");
}

async function main() {
  const personalPaths = await resolvePersonalPaths();
  const buckets = { create: [], conflict: [], parked: [], identical: [] };

  for (const posixPath of collectPayload(personalPaths)) {
    const action = classify(posixPath);
    buckets[action].push(posixPath);
    if (action === "create" || action === "conflict") {
      write(posixPath, action);
    }
  }

  report(buckets.create, buckets.conflict, buckets.parked, buckets.identical, findMisplacedBanks());
}

main();
