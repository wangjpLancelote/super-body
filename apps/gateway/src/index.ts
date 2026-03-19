import Fastify from "fastify";
import cors from "@fastify/cors";
import { SkeletonAgent } from "@repo/agent";
import {
  appStateSchema,
  chatRequestSchema,
  chatResponseSchema,
  type InboundMessage,
} from "@repo/core";
import { FileMemoryStore } from "@repo/memory";

const app = Fastify();
await app.register(cors, { origin: true });

const agent = new SkeletonAgent();
const memory = new FileMemoryStore("workspace/memory.md");
await memory.init();

app.get("/health", async () => ({ ok: true }));

app.get("/api/state", async () => {
  return appStateSchema.parse({
    gateway: "online",
    agentId: agent.id,
    memoryPath: "workspace/memory.md",
  });
});

app.post<{ Body: unknown }>("/api/chat", async (req) => {
  const body = chatRequestSchema.parse(req.body);

  const message: InboundMessage = {
    channel: "web",
    userId: "local-web",
    text: body.text,
    timestamp: new Date().toISOString(),
  };

  const currentMemory = await memory.read();

  const result = await agent.run({
    message,
    memory: currentMemory,
  });

  await memory.applyPatches(result.memoryPatches);

  return chatResponseSchema.parse({
    reply: result.reply,
    memoryUpdated: result.memoryPatches.length > 0,
  });
});

await app.listen({ port: 8787, host: "0.0.0.0" });
