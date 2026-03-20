import {
  appStateSchema,
  assistantConfigSchema,
  configViewSchema,
  chatResponseSchema,
  type AppState,
  type AssistantConfig,
  type ChatResponse,
  type ConfigView,
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

export async function sendChatMessage(text: string): Promise<ChatResponse> {
  const res = await fetch(`${gatewayUrl}/api/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ text }),
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
