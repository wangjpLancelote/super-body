import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import type { LlmClient } from "@repo/llm";
import type { Tool } from "@repo/tools";
import { ToolRegistry } from "@repo/tools";
import { ToolAgent } from "./toolAgent";

class FakeLlmClient implements LlmClient {
  private index = 0;

  constructor(private readonly outputs: string[]) {}

  async generateText(): Promise<string> {
    const output = this.outputs[this.index];

    if (output == null) {
      throw new Error("No more fake LLM outputs available.");
    }

    this.index += 1;
    return output;
  }

  get callCount() {
    return this.index;
  }
}

function createInput(text: string) {
  return {
    message: {
      channel: "web" as const,
      userId: "user-1",
      text,
      timestamp: "2026-03-23T00:00:00.000Z",
    },
    memory: "# Recent Interactions\n\n",
    transcript: [],
  };
}

const echoInputSchema = z.object({
  text: z.string(),
});

const echoTool: Tool<typeof echoInputSchema> = {
  name: "echo",
  description: "Echo text",
  inputSchema: echoInputSchema,
  async execute(input) {
    return input.text;
  },
};

test("returns direct reply when model does not request a tool", async () => {
  const llm = new FakeLlmClient(["Direct answer"]);
  const registry = new ToolRegistry();
  const agent = new ToolAgent(llm, "system", registry);

  const result = await agent.run(createInput("hello"));

  assert.equal(result.reply, "Direct answer");
  assert.equal(llm.callCount, 1);
});

test("executes one tool call and returns the final model answer", async () => {
  const llm = new FakeLlmClient([
    '{"type":"tool_call","toolName":"echo","arguments":{"text":"hello tool"}}',
    "Final answer from tool output",
  ]);
  const registry = new ToolRegistry();
  registry.register(echoTool);

  const agent = new ToolAgent(llm, "system", registry);
  const result = await agent.run(createInput("use a tool"));

  assert.equal(result.reply, "Final answer from tool output");
  assert.equal(llm.callCount, 2);
});

test("blocks a second tool call from leaking back to the user", async () => {
  const llm = new FakeLlmClient([
    '{"type":"tool_call","toolName":"echo","arguments":{"text":"hello tool"}}',
    '{"type":"tool_call","toolName":"echo","arguments":{"text":"loop again"}}',
  ]);
  const registry = new ToolRegistry();
  registry.register(echoTool);

  const agent = new ToolAgent(llm, "system", registry);
  const result = await agent.run(createInput("use a tool"));

  assert.match(result.reply, /could not complete the request safely/i);
  assert.equal(llm.callCount, 2);
});
