import { z } from "zod";

export const sessionIdSchema = z.string().min(1);

export const sessionSchema = z.object({
  id: sessionIdSchema,
  title: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Session = z.infer<typeof sessionSchema>;

export const sessionMessageRoleSchema = z.enum(["user", "assistant", "tool"]);

export type SessionMessageRole = z.infer<typeof sessionMessageRoleSchema>;

export const sessionMessageSchema = z.object({
  id: z.string().min(1),
  role: sessionMessageRoleSchema,
  content: z.string().min(1),
  createdAt: z.string().datetime(),
  toolName: z.string().min(1).optional(),
});

export type SessionMessage = z.infer<typeof sessionMessageSchema>;

export const sessionTranscriptSchema = z.object({
  session: sessionSchema,
  messages: z.array(sessionMessageSchema),
});

export type SessionTranscript = z.infer<typeof sessionTranscriptSchema>;

export const createSessionRequestSchema = z.object({
  title: z.string().min(1).optional(),
});

export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;

export const createSessionResponseSchema = z.object({
  session: sessionSchema,
});

export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;

export const listSessionsResponseSchema = z.object({
  sessions: z.array(sessionSchema),
});

export type ListSessionsResponse = z.infer<typeof listSessionsResponseSchema>;
