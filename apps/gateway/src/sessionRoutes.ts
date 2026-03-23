import type { FastifyInstance } from "fastify";
import {
  createSessionRequestSchema,
  createSessionResponseSchema,
  listSessionsResponseSchema,
  sessionTranscriptSchema,
} from "@repo/core";
import { FileSessionStore } from "@repo/session";

export async function registerSessionRoutes(
  app: FastifyInstance,
  sessionStore: FileSessionStore,
) {
  app.get("/api/sessions", async () => {
    const sessions = await sessionStore.listSessions();

    return listSessionsResponseSchema.parse({
      sessions,
    });
  });

  app.post<{ Body: unknown }>("/api/sessions", async (req) => {
    const body = createSessionRequestSchema.parse(req.body);
    const session = await sessionStore.createSession(body.title);

    return createSessionResponseSchema.parse({
      session,
    });
  });

  app.get<{ Params: { sessionId: string } }>(
    "/api/sessions/:sessionId",
    async (req, reply) => {
      const transcript = await sessionStore.getTranscript(req.params.sessionId);

      if (!transcript) {
        reply.code(404);
        return {
          error: "Session not found",
        };
      }

      return sessionTranscriptSchema.parse(transcript);
    },
  );
}
