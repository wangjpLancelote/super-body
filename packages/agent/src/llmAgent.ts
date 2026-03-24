import type { AgentRunInput, AgentRunResult } from "@repo/core";
import type { LlmClient } from "@repo/llm";
import type { Agent } from "./baseAgent";
import { SYSTEM_PROMPT } from "./systemPrompt";

function buildUserPrompt(input: AgentRunInput): string {
  return [
    "Current memory document:",
    input.memory || "(empty)",
    "",
    "Recent session transcript:",
    renderTranscript(input.transcript),
    "",
    "Incoming user message:",
    input.message.text,
    "",
    "Reply directly to the user.",
  ].join("\n");
}

function renderTranscript(
  transcript: AgentRunInput["transcript"],
  maxMessages: number = 8,
): string {
  const recentMessages = transcript.slice(-maxMessages);
  if (recentMessages.length === 0) {
    return "(no prior session messages)";
  }
  return recentMessages
    .map((message) => {
      if (message.role === "tool") {
        return `[tool:${message.toolName ?? "unknown"}] ${message.content}`;
      }
      return `[${message.role}: ${message.content}]`;
    })
    .join("\n");
}

export class LlmAgent implements Agent {
  id = "main";

  constructor(
    private readonly llm: LlmClient,
    private readonly systemPrompt: string,
  ) {}

  async run(input: AgentRunInput): Promise<AgentRunResult> {
    const reply = await this.llm.generateText({
      systemPrompt: this.systemPrompt,
      userPrompt: buildUserPrompt(input),
    });

    return {
      reply,
      memoryPatches: [],
    };
  }
}
