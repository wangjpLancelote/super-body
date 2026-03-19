export interface Agent {
    id: string;
    reply(input: string): Promise<{ reply: string; memoryNote?: string }>;
  }
  
  export class SkeletonAgent implements Agent {
    id = "main";
  
    async reply(input: string) {
      return {
        reply: `MVP skeleton online. You said: ${input}`,
        memoryNote: `User said: ${input}`,
      };
    }
  }
  