import assert from "node:assert/strict";
import test from "node:test";
import { runChatRuntime } from "./chatRuntime";

test("runChatRuntime returns reply and writes memory patches", async () => {
  const applied: Array<{ section: string; content: string }> = [];

  const result = await runChatRuntime(
    {
      channel: "web",
      userId: "user-1",
      text: "I prefer concise replies",
      timestamp: "2026-03-20T00:00:00.000Z",
    },
    {
      agent: {
        id: "main",
        async run() {
          return {
            reply: "Understood.",
            memoryPatches: [],
          };
        },
      },
      memory: {
        async read() {
          return "# Preferences\n\n";
        },
        async applyPatches(patches) {
          applied.push(...patches);
        },
      },
      memoryPolicyConfig: {
        capturePreferences: true,
        captureFacts: true,
        captureOpenLoops: true,
        captureRecentInteractions: true,
      },
      transcript: [],
    },
  );

  assert.equal(result.reply, "Understood.");
  assert.equal(result.memoryUpdated, true);
  assert.equal(
    applied.some((patch) => patch.section === "Preferences"),
    true,
  );
});
