import { readFile } from "node:fs/promises";
import { assistantSecretsSchema, type AssistantSecrets } from "@repo/core";

export class FileSecretStore {
  constructor(private readonly filePath: string) {}

  async read(): Promise<AssistantSecrets> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      return assistantSecretsSchema.parse(parsed);
    } catch {
      return {};
    }
  }
}
