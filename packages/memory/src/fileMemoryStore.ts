import { promises as fs } from "node:fs";
import type { MemoryPatch, MemorySection } from "@repo/core";

const sections: MemorySection[] = [
  "Identity",
  "Preferences",
  "Facts",
  "Open Loops",
  "Recent Interactions",
];

function createInitialMemoryDocument() {
  return sections.map((section) => `# ${section}\n\n`).join("\n");
}

export class FileMemoryStore {
  constructor(private readonly filePath: string) {}

  async init() {
    try {
      const content = await fs.readFile(this.filePath, "utf8");
      if (content.trim().length === 0) {
        await fs.writeFile(
          this.filePath,
          createInitialMemoryDocument(),
          "utf8",
        );
      }
    } catch {
      await fs.writeFile(this.filePath, createInitialMemoryDocument(), "utf8");
    }
  }

  async read() {
    return fs.readFile(this.filePath, "utf8");
  }

  async applyPatches(patches: MemoryPatch[]) {
    let content = await this.read();

    for (const patch of patches) {
      content = this.insertIntoSection(
        content,
        patch.section,
        `- ${patch.content}`,
      );
    }

    await fs.writeFile(this.filePath, content, "utf8");
  }

  private insertIntoSection(
    document: string,
    section: MemorySection,
    line: string,
  ) {
    const heading = `# ${section}`;
    const nextSectionIndex =
      sections.findIndex((value) => value === section) + 1;
    const nextHeading =
      nextSectionIndex < sections.length
        ? `# ${sections[nextSectionIndex]}`
        : null;

    const start = document.indexOf(heading);
    if (start === -1) {
      return `${document.trimEnd()}\n\n${heading}\n\n${line}\n`;
    }

    const insertAt = nextHeading
      ? document.indexOf(nextHeading, start + heading.length)
      : -1;

    if (insertAt === -1) {
      return `${document.trimEnd()}\n${line}\n`;
    }

    return `${document.slice(0, insertAt).trimEnd()}\n${line}\n\n${document.slice(insertAt)}`;
  }
}
