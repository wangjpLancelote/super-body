import { z } from "zod";

export const toolCallSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  arguments: z.record(z.string(), z.unknown()),
});

export type ToolCall = z.infer<typeof toolCallSchema>;

export const toolResultSchema = z.object({
  callId: z.string().min(1),
  toolName: z.string().min(1),
  ok: z.boolean(),
  content: z.string(),
  error: z.string().optional(),
});

export type ToolResult = z.infer<typeof toolResultSchema>;

export interface Tool<Input extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: Input;
  timeoutMs?: number;
  execute(input: z.infer<Input>): Promise<string>;
}
