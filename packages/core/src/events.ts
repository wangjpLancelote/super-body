import { z } from "zod";

export const runEventTypeSchema = z.enum([
  "run.started",
  "message.user",
  "agent.started",
  "tool.called",
  "tool.completed",
  "message.assistant",
  "run.completed",
  "run.failed",
]);

export type RunEventType = z.infer<typeof runEventTypeSchema>;

export const runEventSchema = z.object({
  id: z.string().min(1),
  runId: z.string().min(1),
  sessionId: z.string().min(1),
  type: runEventTypeSchema,
  createdAt: z.string().datetime(),
  data: z.record(z.string(), z.unknown()),
});

export type RunEvent = z.infer<typeof runEventSchema>;

export const listRunEventsResponseSchema = z.object({
  events: z.array(runEventSchema),
});

export type ListRunEventsResponse = z.infer<typeof listRunEventsResponseSchema>;
