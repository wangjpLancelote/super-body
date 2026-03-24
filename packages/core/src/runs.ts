import { z } from "zod";

export const runStatusSchema = z.enum([
  "queued",
  "running",
  "completed",
  "failed",
]);

export type RunStatus = z.infer<typeof runStatusSchema>;

export const runSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  status: runStatusSchema,
  input: z.string().min(1),
  output: z.string().optional(),
  error: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Run = z.infer<typeof runSchema>;

export const listRunsResponseSchema = z.object({
  runs: z.array(runSchema),
});

export type ListRunsResponse = z.infer<typeof listRunsResponseSchema>;

export const runDetailResponseSchema = runSchema;

export type RunDetailResponse = z.infer<typeof runDetailResponseSchema>;
