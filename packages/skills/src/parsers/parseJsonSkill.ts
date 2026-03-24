import { readFile } from "node:fs/promises";
import { skillManifestSchema, type SkillManifest } from "@repo/core";

/**
 * 解析Skill文件
 * @param filePath
 * @returns
 */
export async function parseJsonSkill(filePath: string): Promise<SkillManifest> {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  return skillManifestSchema.parse({
    ...parsed,
    sourcePath: filePath,
    format: "json",
  });
}
