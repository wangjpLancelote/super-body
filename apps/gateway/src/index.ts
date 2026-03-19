import Fastify from "fastify";
import { SkeletonAgent } from "@repo/agent";
import { FileMemoryStore } from "@repo/memory";

const app = Fastify();
const agent = new SkeletonAgent();
const memory = new FileMemoryStore("workspace/memory.md");
await memory.init();

app.get("/health", async () => ({ ok: true }));

app.get("/api/state", async () => ({
  gateway: "online",
  agentId: agent.id,
  memoryPath: "workspace/memory.md",
}));

app.post<{ Body: { message: string } }>("/api/chat", async (req) => {
  const result = await agent.reply(req.body.message);
  if (result.memoryNote) await memory.appendNote(result.memoryNote);
  return {
    reply: result.reply,
    memoryUpdated: Boolean(result.memoryNote),
  };
});

await app.listen({ port: 8787, host: "0.0.0.0" });
