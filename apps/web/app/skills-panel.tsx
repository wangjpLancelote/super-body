"use client";

import { useEffect, useState } from "react";
import type { SkillsView } from "@repo/core";
import { fetchSkills } from "../lib/gateway";

export function SkillsPanel() {
  const [data, setData] = useState<SkillsView | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchSkills();
        if (!cancelled) {
          setData(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load skills",
          );
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
      <h2>Available Skills</h2>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {!data ? <p>Loading skills...</p> : null}

      {data ? (
        <ul data-testid="skills-list">
          {data.skills.map((skill) => (
            <li key={skill.id}>
              <strong>{skill.name}</strong>: {skill.description}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
