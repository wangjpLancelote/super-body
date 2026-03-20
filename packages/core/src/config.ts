import { z } from "zod";

export const memoryPolicyConfigSchema = z.object({
  capturePreferences: z.boolean(),
  captureFacts: z.boolean(),
  captureOpenLoops: z.boolean(),
  captureRecentInteractions: z.boolean(),
});

export type MemoryPolicyConfig = z.infer<typeof memoryPolicyConfigSchema>;

export const assistantConfigSchema = z.object({
  model: z.string().min(1),
  systemPrompt: z.string().min(1),
  memoryPolicy: memoryPolicyConfigSchema,
});

export type AssistantConfig = z.infer<typeof assistantConfigSchema>;

export const assistantSecretsSchema = z.object({
  openaiApiKey: z.string().optional(),
  braveApiKey: z.string().optional(),
});

export type AssistantSecrets = z.infer<typeof assistantSecretsSchema>;

export const configViewSchema = assistantConfigSchema.extend({
  hasOpenAiKey: z.boolean(),
});

export type ConfigView = z.infer<typeof configViewSchema>;

export const runtimeConfigSchema = z.object({
  model: z.string().min(1),
  systemPrompt: z.string().min(1),
  memoryPolicy: memoryPolicyConfigSchema,
  openaiApiKey: z.string().optional(),
  braveApiKey: z.string().optional(),
});

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>;

export const defaultAssistantConfig: AssistantConfig = {
  model: "gpt-5.4",
  systemPrompt: [
    "You are a personal AI assistant.",
    "Be concise, practical, and helpful.",
    "Use the memory document as background context, but do not mention it unless needed.",
  ].join("\n"),
  memoryPolicy: {
    capturePreferences: true,
    captureFacts: true,
    captureOpenLoops: true,
    captureRecentInteractions: true,
  },
};
