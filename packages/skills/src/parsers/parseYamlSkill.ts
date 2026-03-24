import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { skillManifestSchema, type SkillManifest } from "@repo/core";

export async function parseYamlSkill(filePath: string): Promise<SkillManifest> {
  const raw = await readFile(filePath, "utf8");
  const parsed = YAML.parse(raw);

  return skillManifestSchema.parse({
    ...parsed,
    sourcePath: filePath,
    format: "yaml",
  });
}
