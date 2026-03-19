import type { AgentRunInput, AgentRunResult } from "@repo/core";

export interface Agent {
  id: string;
  run(input: AgentRunInput): Promise<AgentRunResult>;
}

export class SkeletonAgent implements Agent {
  id = "main";

  async run(input: AgentRunInput): Promise<AgentRunResult> {
    const { message } = input;

    return {
      reply: `MVP runtime online. [${message.channel}] ${message.text}`,
      memoryPatches: [
        {
          section: "Recent Interactions",
          content: `${message.timestamp} | ${message.userId} | ${message.text}`,
        },
      ],
    };
  }
}
