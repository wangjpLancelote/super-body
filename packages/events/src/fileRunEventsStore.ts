import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  listRunEventsResponseSchema,
  runEventSchema,
  type RunEvent,
  type RunEventType,
} from "@repo/core";

export class FileRunEventStore {
  constructor(private readonly directoryPath: string) {}

  async init() {
    await mkdir(this.directoryPath, { recursive: true });
  }

  async listEvents(runId: string): Promise<RunEvent[]> {
    await this.init();

    try {
      const raw = await readFile(this.getEventFilePath(runId), "utf8");
      const parsed = JSON.parse(raw);
      return listRunEventsResponseSchema.parse(parsed).events;
    } catch {
      return [];
    }
  }

  async appendEvent(input: {
    runId: string;
    sessionId: string;
    type: RunEventType;
    data: Record<string, unknown>;
  }): Promise<RunEvent> {
    const existing = await this.listEvents(input.runId);

    const event: RunEvent = runEventSchema.parse({
      id: crypto.randomUUID(),
      runId: input.runId,
      sessionId: input.sessionId,
      type: input.type,
      createdAt: new Date().toISOString(),
      data: input.data,
    });

    const next = [...existing, event];

    await writeFile(
      this.getEventFilePath(input.runId),
      JSON.stringify({ events: next }, null, 2) + "\n",
      "utf8",
    );

    return event;
  }

  private getEventFilePath(runId: string) {
    return path.join(this.directoryPath, `${runId}.json`);
  }
}
