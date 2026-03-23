import crypto from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  sessionSchema,
  sessionTranscriptSchema,
  type Session,
  type SessionMessage,
  type SessionTranscript,
} from "@repo/core";

interface StoredSessionDocument {
  session: Session;
  messages: SessionMessage[];
}

interface AppendMessageInput {
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
}

export class FileSessionStore {
  constructor(private readonly directoryPath: string) {}

  async init() {
    await mkdir(this.directoryPath, { recursive: true });
  }

  async createSession(title?: string): Promise<Session> {
    await this.init();

    const now = new Date().toISOString();
    const session: Session = sessionSchema.parse({
      id: crypto.randomUUID(),
      title: title?.trim() || "New Session",
      createdAt: now,
      updatedAt: now,
    });

    const document: StoredSessionDocument = {
      session,
      messages: [],
    };

    await writeFile(
      this.getSessionFilePath(session.id),
      JSON.stringify(document, null, 2) + "\n",
      "utf8",
    );

    return session;
  }

  async listSessions(): Promise<Session[]> {
    await this.init();

    const files = await readdir(this.directoryPath);
    const sessions: Session[] = [];

    for (const fileName of files) {
      if (!fileName.endsWith(".json")) {
        continue;
      }

      const transcript = await this.getTranscript(
        fileName.replace(/\.json$/, ""),
      );
      if (transcript) {
        sessions.push(transcript.session);
      }
    }

    return sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getTranscript(sessionId: string): Promise<SessionTranscript | null> {
    await this.init();

    try {
      const raw = await readFile(this.getSessionFilePath(sessionId), "utf8");
      const parsed = JSON.parse(raw);
      return sessionTranscriptSchema.parse(parsed);
    } catch {
      return null;
    }
  }

  async appendMessage(
    sessionId: string,
    input: AppendMessageInput,
  ): Promise<SessionTranscript | null> {
    const transcript = await this.getTranscript(sessionId);
    if (!transcript) {
      return null;
    }

    const nextMessage: SessionMessage = {
      id: crypto.randomUUID(),
      role: input.role,
      content: input.content,
      createdAt: new Date().toISOString(),
      ...(input.toolName ? { toolName: input.toolName } : {}),
    };

    const nextTranscript: SessionTranscript = {
      session: {
        ...transcript.session,
        updatedAt: nextMessage.createdAt,
      },
      messages: [...transcript.messages, nextMessage],
    };

    await writeFile(
      this.getSessionFilePath(sessionId),
      JSON.stringify(nextTranscript, null, 2) + "\n",
      "utf8",
    );

    return nextTranscript;
  }

  private getSessionFilePath(sessionId: string) {
    return path.join(this.directoryPath, `${sessionId}.json`);
  }
}
