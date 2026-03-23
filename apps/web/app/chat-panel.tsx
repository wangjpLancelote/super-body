"use client";

import { useEffect, useState } from "react";
import type { AppState } from "@repo/core";
import { fetchGatewayState, sendChatMessage } from "../lib/gateway";
import { ConfigPanel } from "./config-panel";
import { ToolsPanel } from "./tools-panel";

export function ChatPanel() {
  const [state, setState] = useState<AppState | null>(null);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      try {
        setError("");
        const nextState = await fetchGatewayState();
        if (!cancelled) {
          setState(nextState);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load gateway state",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingState(false);
        }
      }
    }

    void loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();
    if (!text) {
      return;
    }

    try {
      setIsSending(true);
      setError("");
      const result = await sendChatMessage(text);
      setReply(result.reply);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
      <ConfigPanel />
      <ToolsPanel />
      <h1>Personal AI Assistant</h1>
      <p data-testid="gateway-status">
        Gateway: {isLoadingState ? "loading..." : (state?.gateway ?? "offline")}
      </p>
      <p>Agent: {state?.agentId ?? "-"}</p>
      <p>Memory: {state?.memoryPath ?? "-"}</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <input
          data-testid="chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Say something"
          style={{ width: "100%", padding: 12 }}
        />
        <button
          data-testid="chat-submit"
          type="submit"
          disabled={isSending}
          style={{ marginTop: 12 }}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>

      {reply ? (
        <section style={{ marginTop: 24 }}>
          <h2>Reply</h2>
          <p data-testid="chat-reply">{reply}</p>
        </section>
      ) : null}

      {error ? (
        <p data-testid="chat-error" style={{ marginTop: 24, color: "crimson" }}>
          {error}
        </p>
      ) : null}
    </main>
  );
}
