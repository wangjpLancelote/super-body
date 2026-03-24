"use client";

import { useEffect, useState } from "react";
import type {
  ListRunEventsResponse,
  ListRunsResponse,
  RunDetailResponse,
} from "@repo/core";
import { fetchRun, fetchRunEvents, fetchRuns } from "../lib/gateway";

export function RunsPanel() {
  const [runs, setRuns] = useState<ListRunsResponse | null>(null);
  const [selectedRun, setSelectedRun] = useState<RunDetailResponse | null>(
    null,
  );
  const [events, setEvents] = useState<ListRunEventsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextRuns = await fetchRuns();
        if (!cancelled) {
          setRuns(nextRuns);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load runs");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSelect(runId: string) {
    try {
      setError("");
      const [run, events] = await Promise.all([
        fetchRun(runId),
        fetchRunEvents(runId),
      ]);

      setSelectedRun(run);
      setEvents(events);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load run detail",
      );
    }
  }

  return (
    <section style={{ marginTop: 32, padding: 20, border: "1px solid #ddd" }}>
      <h2>Runs</h2>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      {!runs ? <p>Loading runs...</p> : null}

      {runs ? (
        <ul data-testid="runs-list">
          {runs.runs.map((run) => (
            <li key={run.id}>
              <button type="button" onClick={() => handleSelect(run.id)}>
                {run.status} | {run.sessionId} | {run.input}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {selectedRun ? (
        <div style={{ marginTop: 16 }}>
          <h3>Run Detail</h3>
          <p>Run ID: {selectedRun.id}</p>
          <p>Session ID: {selectedRun.sessionId}</p>
          <p>Status: {selectedRun.status}</p>
          <p>Input: {selectedRun.input}</p>
          <p>Output: {selectedRun.output ?? "-"}</p>
          <p>Error: {selectedRun.error ?? "-"}</p>
        </div>
      ) : null}

      {events ? (
        <div style={{ marginTop: 16 }}>
          <h3>Events</h3>
          <ul>
            {events.events.map((event) => (
              <li key={event.id}>
                {event.type} | {event.createdAt}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
