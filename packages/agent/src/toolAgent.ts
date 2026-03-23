import type { AgentRunInput, AgentRunResult } from "@repo/core";
import type { LlmClient } from "@repo/llm";
import type { ToolResult } from "@repo/tools";
import { ToolRegistry } from "@repo/tools";
import crypto from "node:crypto";
import type { Agent } from "./baseAgent";
import { renderToolCatalog } from "./toolCatalog";
import { tryParseToolCall } from "./toolProtocol";

const MAX_TOOL_CALLS_PER_RUN = 1;
const TOOL_LOOP_GUARD_REPLY =
  "I could not complete the request safely after one tool call. Please try rephrasing or narrowing the request.";

function buildPlanningPrompt(
  input: AgentRunInput,
  toolCatalog: string,
): string {
  return [
    "Current memory document:",
    input.memory || "(empty)",
    "",
    "Available tools:",
    toolCatalog,
    "",
    "Incoming user message:",
    input.message.text,
    "",
    "If a tool is required, respond with ONLY valid JSON in this shape:",
    '{"type":"tool_call","toolName":"web_search","arguments":{"query":"latest OpenAI news"}}',
    "",
    "Use web_search for finding sources or recent information.",
    "Use fetch_url for reading a specific public URL in detail.",
    "",
    "If no tool is required, reply directly with plain text.",
  ].join("\n");
}

function buildFinalPrompt(
  input: AgentRunInput,
  toolResult: ToolResult,
): string {
  return [
    "Current memory document:",
    input.memory || "(empty)",
    "",
    "Incoming user message:",
    input.message.text,
    "",
    "Tool status:",
    toolResult.ok ? "success" : "failure",
    toolResult.error ? `Tool error: ${toolResult.error}` : "",
    toolResult.content ? `Tool result:\n${toolResult.content}` : "",
    "",
    "Use the tool output to answer the user directly.",
    "If the tool failed or returned no results, explain that clearly and answer as helpfully as possible.",
    "Do not call another tool.",
  ].join("\n");
}

export class ToolAgent implements Agent {
  id = "main";

  constructor(
    private readonly llm: LlmClient,
    private readonly systemPrompt: string,
    private readonly registry: ToolRegistry,
  ) {}

  async run(input: AgentRunInput): Promise<AgentRunResult> {
    let toolCallsExecuted = 0;

    const planningOutput = await this.llm.generateText({
      systemPrompt: this.systemPrompt,
      userPrompt: buildPlanningPrompt(input, renderToolCatalog(this.registry)),
    });

    const toolCall = tryParseToolCall(planningOutput);

    if (!toolCall) {
      return {
        reply: planningOutput,
        memoryPatches: [],
      };
    }

    if (toolCallsExecuted >= MAX_TOOL_CALLS_PER_RUN) {
      return {
        reply: TOOL_LOOP_GUARD_REPLY,
        memoryPatches: [],
      };
    }

    toolCallsExecuted += 1;

    const toolResult = await this.registry.execute({
      id: crypto.randomUUID(),
      name: toolCall.toolName,
      arguments: toolCall.arguments,
    });

    const finalReply = await this.llm.generateText({
      systemPrompt: this.systemPrompt,
      userPrompt: buildFinalPrompt(input, toolResult),
    });

    if (tryParseToolCall(finalReply)) {
      return {
        reply: TOOL_LOOP_GUARD_REPLY,
        memoryPatches: [],
      };
    }

    return {
      reply: finalReply,
      memoryPatches: [],
    };
  }
}
