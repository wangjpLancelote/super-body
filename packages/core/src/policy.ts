import { z } from "zod";

export const toolRiskLevelSchema = z.enum(["read", "write", "sensitive"]);

export type ToolRiskLevel = z.infer<typeof toolRiskLevelSchema>;

export const executionModeSchema = z.enum(["auto", "confirm", "blocked"]);

export type ExecutionMode = z.infer<typeof executionModeSchema>;

export const toolExecutionContextSchema = z.object({
  toolName: z.string().min(1),
  riskLevel: toolRiskLevelSchema,
  channel: z.string().min(1),
});

export type ToolExecutionContext = z.infer<typeof toolExecutionContextSchema>;

export const policyDecisionSchema = z.object({
  allowed: z.boolean(),
  mode: executionModeSchema,
  reason: z.string().min(1),
});

export type PolicyDecision = z.infer<typeof policyDecisionSchema>;
