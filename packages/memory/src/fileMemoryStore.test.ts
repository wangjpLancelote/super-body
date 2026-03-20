import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { FileMemoryStore } from "./fileMemoryStore";

test("init seeds the memory document", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "memory-store-"));
  const filePath = path.join(dir, "memory.md");
  const store = new FileMemoryStore(filePath);

  await store.init();

  const content = await readFile(filePath, "utf8");
  assert.match(content, /# Identity/);
  assert.match(content, /# Recent Interactions/);

  await rm(dir, { recursive: true, force: true });
});

test("applyPatches writes into the target section", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "memory-store-"));
  const filePath = path.join(dir, "memory.md");
  const store = new FileMemoryStore(filePath);

  await store.init();
  await store.applyPatches([
    { section: "Facts", content: "My name is Lorenzo" },
  ]);

  const content = await readFile(filePath, "utf8");
  assert.match(content, /# Facts\s+- My name is Lorenzo/s);

  await rm(dir, { recursive: true, force: true });
});
