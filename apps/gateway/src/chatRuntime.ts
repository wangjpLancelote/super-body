import type { Agent } from "@repo/agent";
import { buildMemoryPatches } from "@repo/agent";
import type {
  InboundMessage,
  MemoryPolicyConfig,
  SessionMessage,
} from "@repo/core";

export interface MemoryStoreLike {
  read(): Promise<string>;
  applyPatches(
    patches: Array<{ section: string; content: string }>,
  ): Promise<void>;
}

export interface ChatRuntimeDeps {
  agent: Agent;
  memory: MemoryStoreLike;
  memoryPolicyConfig: MemoryPolicyConfig;
  transcript: Array<SessionMessage>;
}

export interface ChatRuntimeResult {
  reply: string;
  memoryUpdated: boolean;
}

export async function runChatRuntime(
  message: InboundMessage,
  deps: ChatRuntimeDeps,
): Promise<ChatRuntimeResult> {
  const currentMemory = await deps.memory.read();

  const result = await deps.agent.run({
    message,
    memory: currentMemory,
    transcript: deps.transcript,
  });

  const memoryPatches = buildMemoryPatches(
    {
      message,
      assistantReply: result.reply,
      currentMemory,
    },
    deps.memoryPolicyConfig,
  );

  await deps.memory.applyPatches(memoryPatches);

  return {
    reply: result.reply,
    memoryUpdated: memoryPatches.length > 0,
  };
}
