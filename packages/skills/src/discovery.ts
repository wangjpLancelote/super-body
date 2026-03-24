import { readdir } from "node:fs/promises";
import path from "node:path";
import type { SkillManifest } from "@repo/core";
import { parseJsonSkill } from "./parsers/parseJsonSkill";
import { parseMarkdownSkill } from "./parsers/parseMarkdownSkill";
import { parseYamlSkill } from "./parsers/parseYamlSkill";

/**
 * 可能出现的skill文件名
 */
const SKILL_FILE_NAMES = new Set(["SKILL.md", "skill.md"]);

async function walk(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true }).catch(
    () => [],
  );
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (SKILL_FILE_NAMES.has(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function parseSkillFile(filePath: string): Promise<SkillManifest> {
  return parseMarkdownSkill(filePath);
}

export class FilesystemSkillDiscovery {
  constructor(private readonly rootPaths: string[]) {}

  async discover(): Promise<SkillManifest[]> {
    const discovered: SkillManifest[] = [];
    const seenIds = new Set<string>();

    for (const rootPath of this.rootPaths) {
      const files = await walk(rootPath);

      for (const filePath of files) {
        try {
          const skill = await parseSkillFile(filePath);

          if (seenIds.has(skill.id)) {
            console.warn(
              `[skills] duplicate skill id "${skill.id}" ignored from ${filePath}`,
            );
            continue;
          }

          discovered.push(skill);
          seenIds.add(skill.id);
        } catch (error) {
          console.warn(
            `[skills] failed to load skill from ${filePath}:`,
            error,
          );
        }
      }
    }

    return discovered;
  }
}
