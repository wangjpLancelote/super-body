"use client";

import { useEffect, useState } from "react";
import type { AssistantConfig, ConfigView } from "@repo/core";
import { fetchConfig, saveConfig } from "../lib/gateway";

export function ConfigPanel() {
  const [config, setConfig] = useState<ConfigView | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextConfig = await fetchConfig();
        if (!cancelled) {
          setConfig(nextConfig);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load config",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateConfig(next: Partial<AssistantConfig>) {
    setConfig((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        ...next,
      };
    });
  }

  async function handleSave() {
    if (!config) {
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const saved = await saveConfig({
        model: config.model,
        systemPrompt: config.systemPrompt,
        memoryPolicy: config.memoryPolicy,
      });

      setConfig(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save config");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section>
        <p>Loading config...</p>
      </section>
    );
  }

  if (!config) {
    return (
      <section>
        <p>Config unavailable.</p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: 32, padding: 20, border: "1px solid #ddd" }}>
      <h2>Debug Config</h2>
      <p data-testid="config-openai-key-status">
        OpenAI key: {config.hasOpenAiKey ? "configured" : "missing"}
      </p>

      <label style={{ display: "block", marginTop: 12 }}>
        Model
        <input
          data-testid="config-model"
          value={config.model}
          onChange={(event) => updateConfig({ model: event.target.value })}
          style={{ width: "100%", marginTop: 6, padding: 8 }}
        />
      </label>

      <label style={{ display: "block", marginTop: 12 }}>
        System Prompt
        <textarea
          data-testid="config-system-prompt"
          value={config.systemPrompt}
          onChange={(event) =>
            updateConfig({ systemPrompt: event.target.value })
          }
          rows={6}
          style={{ width: "100%", marginTop: 6, padding: 8 }}
        />
      </label>

      <label style={{ display: "block", marginTop: 12 }}>
        <input
          type="checkbox"
          checked={config.memoryPolicy.capturePreferences}
          onChange={(event) =>
            updateConfig({
              memoryPolicy: {
                ...config.memoryPolicy,
                capturePreferences: event.target.checked,
              },
            })
          }
        />
        Capture Preferences
      </label>

      <label style={{ display: "block", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={config.memoryPolicy.captureFacts}
          onChange={(event) =>
            updateConfig({
              memoryPolicy: {
                ...config.memoryPolicy,
                captureFacts: event.target.checked,
              },
            })
          }
        />
        Capture Facts
      </label>

      <label style={{ display: "block", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={config.memoryPolicy.captureOpenLoops}
          onChange={(event) =>
            updateConfig({
              memoryPolicy: {
                ...config.memoryPolicy,
                captureOpenLoops: event.target.checked,
              },
            })
          }
        />
        Capture Open Loops
      </label>

      <label style={{ display: "block", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={config.memoryPolicy.captureRecentInteractions}
          onChange={(event) =>
            updateConfig({
              memoryPolicy: {
                ...config.memoryPolicy,
                captureRecentInteractions: event.target.checked,
              },
            })
          }
        />
        Capture Recent Interactions
      </label>

      <button
        data-testid="config-save"
        onClick={handleSave}
        disabled={isSaving}
        style={{ marginTop: 16 }}
      >
        {isSaving ? "Saving..." : "Save Config"}
      </button>

      {error ? (
        <p
          data-testid="config-error"
          style={{ color: "crimson", marginTop: 12 }}
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
