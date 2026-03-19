import { promises as fs } from "node:fs";

export class FileMemoryStore {
  constructor(private readonly filePath: string) {}

  async init() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(
        this.filePath,
        "# Identity\n\n# Preferences\n\n# Facts\n\n# Recent Notes\n\n",
        "utf8",
      );
    }
  }

  async read() {
    return fs.readFile(this.filePath, "utf8");
  }

  async appendNote(note: string) {
    const current = await this.read();
    const next = `${current}\n- ${new Date().toISOString()} ${note}\n`;
    await fs.writeFile(this.filePath, next, "utf8");
  }
}
