import assert from "node:assert/strict";
import test from "node:test";
import { buildMemoryPatches } from "./memoryPolicy";

const defaultPolicyConfig = {
  capturePreferences: true,
  captureFacts: true,
  captureOpenLoops: true,
  captureRecentInteractions: true,
};

const baseInput = {
  message: {
    channel: "web" as const,
    userId: "user-1",
    text: "",
    timestamp: "2026-03-20T00:00:00.000Z",
  },
  assistantReply: "ok",
  currentMemory: "",
};

test("captures preferences", () => {
  const patches = buildMemoryPatches(
    {
      ...baseInput,
      message: { ...baseInput.message, text: "I prefer concise replies" },
    },
    defaultPolicyConfig,
  );

  assert.equal(patches.some((patch) => patch.section === "Preferences"), true);
});

test("captures facts", () => {
  const patches = buildMemoryPatches(
    {
      ...baseInput,
      message: { ...baseInput.message, text: "My name is Lorenzo" },
    },
    defaultPolicyConfig,
  );

  assert.equal(patches.some((patch) => patch.section === "Facts"), true);
});

test("captures open loops", () => {
  const patches = buildMemoryPatches(
    {
      ...baseInput,
      message: { ...baseInput.message, text: "remind me to buy milk" },
    },
    defaultPolicyConfig,
  );

  assert.equal(patches.some((patch) => patch.section === "Open Loops"), true);
});

test("does not duplicate existing memory", () => {
  const patches = buildMemoryPatches(
    {
      ...baseInput,
      currentMemory: "# Preferences\n\n- I prefer concise replies\n",
      message: { ...baseInput.message, text: "I prefer concise replies" },
    },
    defaultPolicyConfig,
  );

  assert.equal(
    patches.some((patch) => patch.section === "Preferences"),
    false,
  );
});
