import { z } from "zod";
import { sessionMessageSchema } from "./session";

export const channelKindSchema = z.enum(["web"]);
export type ChannelKind = z.infer<typeof channelKindSchema>;

export const inboundMessageSchema = z.object({
  channel: channelKindSchema,
  userId: z.string().min(1),
  text: z.string().min(1),
  timestamp: z.string().datetime(),
});

export type InboundMessage = z.infer<typeof inboundMessageSchema>;

export const chatRequestSchema = z.object({
  text: z.string().min(1),
  sessionId: z.string().min(1).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatResponseSchema = z.object({
  reply: z.string(),
  memoryUpdated: z.boolean(),
  sessionId: z.string().min(1),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

export const appStateSchema = z.object({
  gateway: z.enum(["online", "offline"]),
  agentId: z.string(),
  memoryPath: z.string(),
});

export type AppState = z.infer<typeof appStateSchema>;

export const memorySectionSchema = z.enum([
  "Identity",
  "Preferences",
  "Facts",
  "Open Loops",
  "Recent Interactions",
]);

export type MemorySection = z.infer<typeof memorySectionSchema>;

export const memoryPatchSchema = z.object({
  section: memorySectionSchema,
  content: z.string().min(1),
});

export type MemoryPatch = z.infer<typeof memoryPatchSchema>;

export const agentRunInputSchema = z.object({
  message: inboundMessageSchema,
  memory: z.string(),
  transcript: z.array(sessionMessageSchema),
});

export type AgentRunInput = z.infer<typeof agentRunInputSchema>;

export const agentRunResultSchema = z.object({
  reply: z.string(),
  memoryPatches: z.array(memoryPatchSchema),
});

export type AgentRunResult = z.infer<typeof agentRunResultSchema>;

export const memoryPolicyInputSchema = z.object({
  message: inboundMessageSchema,
  assistantReply: z.string().min(1),
  currentMemory: z.string(),
});

export type MemoryPolicyInput = z.infer<typeof memoryPolicyInputSchema>;

export const toolViewSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type ToolView = z.infer<typeof toolViewSchema>;

export const toolsViewSchema = z.object({
  tools: z.array(toolViewSchema),
});

export type ToolsView = z.infer<typeof toolsViewSchema>;
