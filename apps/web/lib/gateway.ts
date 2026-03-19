import {
  appStateSchema,
  chatResponseSchema,
  type AppState,
  type ChatResponse,
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
