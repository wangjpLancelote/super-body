import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { skillManifestSchema, type SkillManifest } from "@repo/core";

function splitFrontmatter(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match?.[1]) {
    throw new Error("Markdown skill is missing frontmatter.");
  }

  return {
    frontmatter: YAML.parse(match[1]),
    body: match[2]?.trim() ?? "",
  };
}

export async function parseMarkdownSkill(
  filePath: string,
): Promise<SkillManifest> {
  const raw = await readFile(filePath, "utf8");
  const { frontmatter, body } = splitFrontmatter(raw);

  return skillManifestSchema.parse({
    ...frontmatter,
    sourcePath: filePath,
    body,
  });
}
