import type { FastifyInstance } from "fastify";
import { listRunsResponseSchema, runSchema } from "@repo/core";
import { FileRunStore } from "@repo/runs";

export async function registerRunRoutes(
  app: FastifyInstance,
  runStore: FileRunStore,
) {
  app.get("/api/runs", async () => {
    const runs = await runStore.listRuns();

    return listRunsResponseSchema.parse({
      runs,
    });
  });

  app.get<{ Params: { runId: string } }>(
    "/api/runs/:runId",
    async (req, reply) => {
      const run = await runStore.getRun(req.params.runId);

      if (!run) {
        reply.code(404);
        return {
          error: "Run not found",
        };
      }

      return runSchema.parse(run);
    },
  );
}
