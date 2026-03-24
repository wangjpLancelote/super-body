import { z } from "zod";

export const skillManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean().default(true),
  tools: z.array(z.string()).default([]),
  sourcePath: z.string().min(1),
  body: z.string().min(1),
});

export type SkillManifest = z.infer<typeof skillManifestSchema>;

export const skillsViewSchema = z.object({
  skills: z.array(skillManifestSchema),
});

export type SkillsView = z.infer<typeof skillsViewSchema>;
