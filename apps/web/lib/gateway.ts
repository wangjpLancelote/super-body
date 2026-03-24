import {
  appStateSchema,
  assistantConfigSchema,
  configViewSchema,
  chatResponseSchema,
  skillsViewSchema,
  runDetailResponseSchema,
  type AppState,
  type AssistantConfig,
  type ChatResponse,
  type ConfigView,
  type ToolsView,
  type SkillsView,
  type RunDetailResponse,
  toolsViewSchema,
  listRunsResponseSchema,
  ListRunsResponse,
  listRunEventsResponseSchema,
  type ListRunEventsResponse,
} from "@repo/core";

const gatewayUrl =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://127.0.0.1:8787";

export async function fetchGatewayState(): Promise<AppState> {
  const res = await fetch(`${gatewayUrl}/api/state`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load gateway state: ${res.status}`);
  }

  const json = await res.json();
  return appStateSchema.parse(json);
}

export async function sendChatMessage(
  text: string,
  sessionId?: string,
): Promise<ChatResponse> {
  const res = await fetch(`${gatewayUrl}/api/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ text, sessionId }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send chat message: ${res.status}`);
  }

  const json = await res.json();
  return chatResponseSchema.parse(json);
}

export async function fetchConfig(): Promise<ConfigView> {
  const res = await fetch(`${gatewayUrl}/api/config`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load config: ${res.status}`);
  }

  const json = await res.json();
  return configViewSchema.parse(json);
}

export async function saveConfig(config: AssistantConfig): Promise<ConfigView> {
  const payload = assistantConfigSchema.parse(config);

  const res = await fetch(`${gatewayUrl}/api/config`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to save config: ${res.status}`);
  }

  const json = await res.json();
  return configViewSchema.parse(json);
}

export async function fetchTools(): Promise<ToolsView> {
  const res = await fetch(`${gatewayUrl}/api/tools`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load tools: ${res.status}`);
  }

  const json = await res.json();
  return toolsViewSchema.parse(json);
}

/**
 * 页面显示所需Skills数据
 * 获取Skills
 */
export async function fetchSkills(): Promise<SkillsView> {
  const res = await fetch(`${gatewayUrl}/api/skills`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load skills: ${res.status}`);
  }

  const json = await res.json();
  return skillsViewSchema.parse(json);
}

/**
 * 获取任务的执行编排列表和当前任务
 * @returns
 */
export async function fetchRuns(): Promise<ListRunsResponse> {
  const res = await fetch(`${gatewayUrl}/api/runs`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load runs: ${res.status}`);
  }

  const json = await res.json();
  return listRunsResponseSchema.parse(json);
}

export async function fetchRun(runId: string): Promise<RunDetailResponse> {
  const res = await fetch(`${gatewayUrl}/api/runs/${runId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load run: ${res.status}`);
  }

  const json = await res.json();
  return runDetailResponseSchema.parse(json);
}

/**
 * 获取任务的事件流
 * @param runId
 * @returns
 */
export async function fetchRunEvents(
  runId: string,
): Promise<ListRunEventsResponse> {
  const res = await fetch(`${gatewayUrl}/api/runs/${runId}/events`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load run events: ${res.status}`);
  }

  const json = await res.json();
  return listRunEventsResponseSchema.parse(json);
}
