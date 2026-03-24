import type { FastifyInstance } from "fastify";
import { listRunEventsResponseSchema } from "@repo/core";
import { FileRunEventStore } from "@repo/events";

export async function registerEventRoutes(
  app: FastifyInstance,
  eventStore: FileRunEventStore,
) {
  app.get<{ Params: { runId: string } }>(
    "/api/runs/:runId/events",
    async (req) => {
      const events = await eventStore.listEvents(req.params.runId);

      return listRunEventsResponseSchema.parse({
        events,
      });
    },
  );
}
