---
name: session-init-memory
description: Create a compact session initialization memory summary for this repo. Use when the user asks for session init, memory, or a quick context snapshot.
---

# Session Init Memory

Generate a concise memory snapshot to help restart the session quickly.

## Required sections (in order)
- Repo
- Goal
- Constraints
- Current changes
- Next steps
- Open questions (only if any)

## Format
Use the following template:

Session Memory
Repo: <repo name / path>
Goal: <current user goal>
Constraints: <key rules from AGENTS.md or repo_structure.md>
Current changes: <files or areas touched>
Next steps: <1-3 concrete actions>
Open questions: <only if blockers exist>

## Rules
- Keep it under 120 words.
- Avoid secrets, tokens, or credentials.
- If there are no changes yet, state "none" for Current changes.
