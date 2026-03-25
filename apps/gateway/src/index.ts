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
import {
  SkillRegistry,
  FilesystemSkillDiscovery,
} from "@repo/skills";
import { registerSkillRoutes } from "./skillRoutes";
import { registerRunRoutes } from "./runRoutes";
import { FileRunStore } from "@repo/runs";
import { registerEventRoutes } from "./eventRoutes";
import { FileRunEventStore } from "@repo/events";
import { DefaultPolicyEngine } from "@repo/policy";

/**
 * 创建Fastify应用实例并加载注册器
 */
const app = Fastify();
await app.register(cors, { origin: true });

/**
 * 创建Agent 封装方法
 * @param runtimeConfig
 * @returns
 */
function createAgent(runtimeConfig: RuntimeConfig) {
  if (runtimeConfig.openaiApiKey) {
    return new ToolAgent(
      new OpenAIResponsesClient(
        runtimeConfig.openaiApiKey,
        runtimeConfig.model,
      ),
      runtimeConfig.systemPrompt,
      toolRegistry,
      policyEngine,
    );
  }
  return new SkeletonAgent();
}

/**
 * 初始化并注册Tools
 */
const toolRegistry = new ToolRegistry();
toolRegistry.register(echoTool);
toolRegistry.register(createFetchUrlTool(new HttpFetchUrlClient()));

/**
 * 加载并验证Runtime配置
 */
let runtimeConfig = await loadRuntimeConfig();

if (runtimeConfig.braveApiKey) {
  toolRegistry.register(
    createWebSearchTool(new BraveSearchClient(runtimeConfig.braveApiKey)),
  );
}

/**
 * 初始化Policy Engine
 */
const policyEngine = new DefaultPolicyEngine();

/**
 * 创建Agent
 */
let agent = createAgent(runtimeConfig);

/**
 * 当前目录路径
 */
const { workspaceDir } = resolveWorkspaceRoot();

/**
 * Skill 路径发现并注册到SkillRegistry
 */
const repoRoot = path.resolve(workspaceDir, "..");

const skillRegistry = new SkillRegistry();
const skillDiscovery = new FilesystemSkillDiscovery([
  path.join(repoRoot, ".agents"),
  path.join(repoRoot, ".super-body"),
]);

const discoveredSkills = await skillDiscovery.discover();

for (const skill of discoveredSkills) {
  skillRegistry.register(skill);
}

await registerSkillRoutes(app, skillRegistry);

/**
 * 初始化Runs 编排
 */
const runsDirectoryPath = path.join(workspaceDir, "runs");
const runStore = new FileRunStore(runsDirectoryPath);
await runStore.init();
await registerRunRoutes(app, runStore);

/**
 * 初始化Events 事件流
 */
const eventsDirectoryPath = path.join(workspaceDir, "events");
const eventStore = new FileRunEventStore(eventsDirectoryPath);
await eventStore.init();
await registerEventRoutes(app, eventStore);

/**
 * 初始化SessionStore
 */
const sessionsDirectoryPath = path.join(workspaceDir, "sessions");
const sessionStore = new FileSessionStore(sessionsDirectoryPath);
await sessionStore.init();
await registerSessionRoutes(app, sessionStore);

/**
 * 初始化Memory
 */
const memoryPath = `${workspaceDir}/memory.md`;
const memory = new FileMemoryStore(memoryPath);
await memory.init();

/**
 * 初始化Config
 */
const paths = resolveGatewayPaths();
const configStore = new FileConfigStore(paths.assistantConfigPath);

/**
 * 心跳检查路由
 */
app.get("/health", async () => ({ ok: true }));

/**
 * 状态检查路由
 */
app.get("/api/state", async () => {
  return appStateSchema.parse({
    gateway: "online",
    agentId: agent.id,
    memoryPath,
  });
});

/**
 * 聊天路由
 */
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

  /**
   * 任务开始
   */
  const run = await runStore.createRun(sessionId, body.text);

  /**
   *  每次任务执行都会写入事件流
   */
  await eventStore.appendEvent({
    runId: run.id,
    sessionId,
    type: "run.started",
    data: {
      input: body.text,
    },
  });

  try {
    /**
     * 提问前添加事件流
     */
    await eventStore.appendEvent({
      runId: run.id,
      sessionId,
      type: "message.user",
      data: {
        content: body.text,
      },
    });

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

    /**
     * 任务开始写入事件流
     */
    await eventStore.appendEvent({
      runId: run.id,
      sessionId,
      type: "agent.started",
      data: {
        input: agent.id,
      },
    });

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

    /**
     * 提问后添加事件流
     */
    await eventStore.appendEvent({
      runId: run.id,
      sessionId,
      type: "message.assistant",
      data: {
        content: runtimeResult.reply,
      },
    });

    /**
     * 任务成功结束
     */
    await runStore.updateRun(run.id, {
      status: "completed",
      output: runtimeResult.reply,
    });

    /**
     * 任务成功结束写入事件流
     */
    await eventStore.appendEvent({
      runId: run.id,
      sessionId,
      type: "run.completed",
      data: {
        output: runtimeResult.reply,
      },
    });

    return chatResponseSchema.parse({
      ...runtimeResult,
      sessionId,
      runId: run.id, // 任务ID
    });
  } catch (error) {
    /**
     * 任务失败结束
     */
    await runStore.updateRun(run.id, {
      status: "failed",
      error:
        error instanceof Error ? error.message : "Unknown chat runtime error",
    });

    /**
     * 任务失败结束写入事件流
     */
    await eventStore.appendEvent({
      runId: run.id,
      sessionId,
      type: "run.failed",
      data: {
        error:
          error instanceof Error ? error.message : "Unknown chat runtime error",
      },
    });

    throw error;
  }
});

/**
 * 配置路由
 */
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

/**
 * Tools路由
 */
app.get("/api/tools", async () => {
  return toolsViewSchema.parse({
    tools: toolRegistry.list().map((tool) => ({
      name: tool.name,
      description: tool.description,
      riskLevel: tool.riskLevel,
    })),
  });
});

await app.listen({ port: 8787, host: "0.0.0.0" });
