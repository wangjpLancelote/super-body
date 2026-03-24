import crypto from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { runSchema, type Run, type RunStatus } from "@repo/core";

export class FileRunStore {
  constructor(private readonly directoryPath: string) {}

  async init() {
    await mkdir(this.directoryPath, { recursive: true });
  }

  async createRun(sessionId: string, input: string): Promise<Run> {
    await this.init();

    const now = new Date().toISOString();
    const run: Run = runSchema.parse({
      id: crypto.randomUUID(),
      sessionId,
      status: "running",
      input,
      createdAt: now,
      updatedAt: now,
    });

    await this.writeRun(run);
    return run;
  }

  async getRun(runId: string): Promise<Run | null> {
    await this.init();

    try {
      const raw = await readFile(this.getRunFilePath(runId), "utf8");
      const parsed = JSON.parse(raw);
      return runSchema.parse(parsed);
    } catch {
      return null;
    }
  }

  async listRuns(): Promise<Run[]> {
    await this.init();

    const files = await readdir(this.directoryPath);
    const runs: Run[] = [];

    for (const fileName of files) {
      if (!fileName.endsWith(".json")) {
        continue;
      }

      const runId = fileName.replace(/\.json$/, "");
      const run = await this.getRun(runId);

      if (run) {
        runs.push(run);
      }
    }

    return runs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async updateRun(
    runId: string,
    patch: {
      status?: RunStatus;
      output?: string;
      error?: string;
    },
  ): Promise<Run | null> {
    const existing = await this.getRun(runId);

    if (!existing) {
      return null;
    }

    const next: Run = runSchema.parse({
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    });

    await this.writeRun(next);
    return next;
  }

  private async writeRun(run: Run) {
    await writeFile(
      this.getRunFilePath(run.id),
      JSON.stringify(run, null, 2) + "\n",
      "utf8",
    );
  }

  private getRunFilePath(runId: string) {
    return path.join(this.directoryPath, `${runId}.json`);
  }
}
