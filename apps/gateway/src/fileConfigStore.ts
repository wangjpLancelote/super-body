import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assistantConfigSchema,
  defaultAssistantConfig,
  type AssistantConfig,
} from "@repo/core";

export class FileConfigStore {
  constructor(private readonly filePath: string) {}

  async read(): Promise<AssistantConfig> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      return assistantConfigSchema.parse(parsed);
    } catch {
      return defaultAssistantConfig;
    }
  }

  async write(config: AssistantConfig): Promise<void> {
    const validated = assistantConfigSchema.parse(config);
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(
      this.filePath,
      JSON.stringify(validated, null, 2) + "\n",
      "utf8",
    );
  }
}
