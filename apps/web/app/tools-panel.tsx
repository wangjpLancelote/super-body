"use client";

import { useEffect, useState } from "react";
import type { ToolsView } from "@repo/core";
import { fetchTools } from "../lib/gateway";

export function ToolsPanel() {
  const [data, setData] = useState<ToolsView | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchTools();
        if (!cancelled) {
          setData(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tools");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section style={{ marginTop: 32, padding: 20, border: "1px solid #ddd" }}>
      <h2>Available Tools</h2>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      {!data ? <p>Loading tools...</p> : null}

      {data ? (
        <ul data-testid="tools-list">
          {data.tools.map((tool) => (
            <li key={tool.name}>
              <strong>{tool.name}</strong>: {tool.description}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
