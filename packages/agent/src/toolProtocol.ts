import { z } from "zod";

export const modelToolCallSchema = z.object({
  type: z.literal("tool_call"),
  toolName: z.string().min(1),
  arguments: z.record(z.string(), z.unknown()),
});

export type ModelToolCall = z.infer<typeof modelToolCallSchema>;

export function tryParseToolCall(text: string): ModelToolCall | null {
  const trimmed = text.trim();

  try {
    const parsed = JSON.parse(trimmed);
    return modelToolCallSchema.parse(parsed);
  } catch {
    return null;
  }
}
