import type { FastifyInstance } from "fastify";
import { skillsViewSchema } from "@repo/core";
import { SkillRegistry } from "@repo/skills";

export async function registerSkillRoutes(
  app: FastifyInstance,
  skillRegistry: SkillRegistry,
) {
  app.get("/api/skills", async () => {
    return skillsViewSchema.parse({
      skills: skillRegistry.list(),
    });
  });
}
