import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { ToolRegistry } from "./registry";

test("executes a registered tool successfully", async () => {
  const registry = new ToolRegistry();

  registry.register({
    name: "echo",
    description: "Echo text",
    inputSchema: z.object({
      text: z.string(),
    }),
    async execute(input) {
      return (input as { text: string }).text;
    },
  });

  const result = await registry.execute({
    id: "call-1",
    name: "echo",
    arguments: { text: "hello" },
  });

  assert.equal(result.ok, true);
  assert.equal(result.content, "hello");
});

test("returns failure result when tool is missing", async () => {
  const registry = new ToolRegistry();

  const result = await registry.execute({
    id: "call-1",
    name: "missing_tool",
    arguments: {},
  });

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /Tool not found: missing_tool/);
});

test("returns failure result when tool times out", async () => {
  const registry = new ToolRegistry();

  registry.register({
    name: "slow_tool",
    description: "Slow tool",
    inputSchema: z.object({}),
    timeoutMs: 10,
    async execute() {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return "done";
    },
  });

  const result = await registry.execute({
    id: "call-1",
    name: "slow_tool",
    arguments: {},
  });

  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /timed out/i);
});
