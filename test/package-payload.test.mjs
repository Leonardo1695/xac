import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { packageRoot } from "../test-support/helpers.mjs";

// npm adds these three regardless of the `files` allowlist. Everything else must be payload.
const ALWAYS_PACKED = ["package.json", "README.md", "LICENSE"];

// `npm pack` is most of this suite's runtime, and its answer cannot change mid-run.
let packed;

function packedPaths() {
  if (packed) {
    return packed;
  }
  // npm is a .cmd shim on Windows, which Node refuses to spawn without a shell. One command
  // string rather than an argument array, because a shell concatenates arrays unescaped.
  const result = spawnSync("npm pack --dry-run --json", {
    cwd: packageRoot,
    encoding: "utf8",
    windowsHide: true,
    shell: true,
  });
  assert.equal(result.status, 0, `npm pack failed — is npm on PATH?\n${result.stderr}`);

  // npm prints notices around the JSON on some versions; take the array and ignore the rest.
  const json = result.stdout.slice(result.stdout.indexOf("["), result.stdout.lastIndexOf("]") + 1);
  packed = JSON.parse(json)[0].files.map((entry) => entry.path);
  return packed;
}

test("the tarball carries only bin/, template/memory-bank/_xac/, and npm's own three files", () => {
  const packed = packedPaths();

  assert.ok(packed.includes("template/memory-bank/_xac/AGENTS.block.md"), "the payload is missing");
  for (const path of packed) {
    const isPayload = path.startsWith("bin/") || path.startsWith("template/memory-bank/_xac/");
    assert.ok(
      isPayload || ALWAYS_PACKED.includes(path),
      `${path} would ship but is neither payload nor npm metadata`,
    );
  }
});

test("the tarball carries no factory files", () => {
  const packed = packedPaths();

  const factoryPaths = [
    "AGENTS.md",
    "docs/roadmap.md",
    "test/guards.test.mjs",
    "test-support/helpers.mjs",
  ];
  for (const factoryPath of factoryPaths) {
    assert.ok(!packed.includes(factoryPath), `${factoryPath} would ship`);
  }
});
