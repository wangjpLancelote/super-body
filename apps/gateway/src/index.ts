import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  appStateSchema,
  assistantConfigSchema,
  chatRequestSchema,
  chatResponseSchema,
  configViewSchema,
  RuntimeConfig,
  type InboundMessage,
} from "@repo/core";
import { FileMemoryStore } from "@repo/memory";
import { SkeletonAgent, ToolAgent } from "@repo/agent";
import { OpenAIResponsesClient } from "@repo/llm";
import { runChatRuntime } from "./chatRuntime";
import {
  loadRuntimeConfig,
  resolveGatewayPaths,
  resolveWorkspaceRoot,
} from "./loadRuntimeConfig";
import { FileConfigStore } from "./fileConfigStore";
import {
  ToolRegistry,
  echoTool,
  HttpFetchUrlClient,
  createFetchUrlTool,
  BraveSearchClient,
  createWebSearchTool,
} from "@repo/tools";
import { toolsViewSchema } from "@repo/core";
import path from "node:path";
import { FileSessionStore } from "@repo/session";
import { registerSessionRoutes } from "./sessionRoutes";

const app = Fastify();
await app.register(cors, { origin: true });

const toolRegistry = new ToolRegistry();
toolRegistry.register(echoTool);
toolRegistry.register(createFetchUrlTool(new HttpFetchUrlClient()));

let runtimeConfig = await loadRuntimeConfig();

if (runtimeConfig.braveApiKey) {
  toolRegistry.register(
    createWebSearchTool(new BraveSearchClient(runtimeConfig.braveApiKey)),
  );
}

let agent = createAgent(runtimeConfig);
const { workspaceDir } = resolveWorkspaceRoot();

const sessionsDirectoryPath = path.join(workspaceDir, "sessions");
const sessionStore = new FileSessionStore(sessionsDirectoryPath);
await sessionStore.init();
await registerSessionRoutes(app, sessionStore);

const memoryPath = `${workspaceDir}/memory.md`;
const memory = new FileMemoryStore(memoryPath);
await memory.init();

const paths = resolveGatewayPaths();
const configStore = new FileConfigStore(paths.assistantConfigPath);

function createAgent(runtimeConfig: RuntimeConfig) {
  if (runtimeConfig.openaiApiKey) {
    return new ToolAgent(
      new OpenAIResponsesClient(
        runtimeConfig.openaiApiKey,
        runtimeConfig.model,
      ),
      runtimeConfig.systemPrompt,
      toolRegistry,
    );
  }
  return new SkeletonAgent();
}

app.get("/health", async () => ({ ok: true }));

app.get("/api/state", async () => {
  return appStateSchema.parse({
    gateway: "online",
    agentId: agent.id,
    memoryPath,
  });
});

app.post<{ Body: unknown }>("/api/chat", async (req, reply) => {
  const body = chatRequestSchema.parse(req.body);
  let sessionId = body.sessionId;
  if (sessionId) {
    const existingTranscript = await sessionStore.getTranscript(sessionId);
    if (!existingTranscript) {
      reply.code(404);
      return {
        error: "Session not found",
      };
    }
  } else {
    const session = await sessionStore.createSession("New Chat");
    sessionId = session.id;
  }

  await sessionStore.appendMessage(sessionId, {
    role: "user",
    content: body.text,
  });

  const transcript = await sessionStore.getTranscript(sessionId);
  if (!transcript) {
    reply.code(404);
    return {
      error: "Failed to load session transcript",
    };
  }

  const message: InboundMessage = {
    channel: "web",
    userId: "local-web",
    text: body.text,
    timestamp: new Date().toISOString(),
  };

  const runtimeResult = await runChatRuntime(message, {
    agent,
    memory,
    memoryPolicyConfig: runtimeConfig.memoryPolicy,
    transcript: transcript.messages,
  });

  await sessionStore.appendMessage(sessionId, {
    role: "assistant",
    content: runtimeResult.reply,
  });

  return chatResponseSchema.parse({ ...runtimeResult, sessionId });
});

app.get("/api/config", async () => {
  const config = await configStore.read();
  return configViewSchema.parse({
    ...config,
    hasOpenAiKey: !!runtimeConfig.openaiApiKey,
  });
});

app.put<{ Body: unknown }>("/api/config", async (req) => {
  const nextConfig = assistantConfigSchema.parse(req.body);
  await configStore.write(nextConfig);

  runtimeConfig = {
    ...runtimeConfig,
    ...nextConfig,
  };

  agent = createAgent(runtimeConfig);

  return configViewSchema.parse({
    ...nextConfig,
    hasOpenAiKey: Boolean(runtimeConfig.openaiApiKey),
  });
});

app.get("/api/tools", async () => {
  return toolsViewSchema.parse({
    tools: toolRegistry.list().map((tool) => ({
      name: tool.name,
      description: tool.description,
    })),
  });
});

await app.listen({ port: 8787, host: "0.0.0.0" });
