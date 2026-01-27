# subagents.md

Purpose
- Provide a lightweight orchestration contract for running multiple subagents against multiple PLAN.md files in parallel.
- Keep all work aligned with repo_structure.md, agents.yaml, and tasks.yaml.
- Ensure dry-run by default, auditability, and no cross-boundary file writes.

Inputs (authoritative order)
1) repo_structure.md (directory boundaries)
2) agents.yaml (role/permissions)
3) tasks.yaml (task definitions, phases, inputs/outputs)
4) Every PLAN.md found in the repo

PLAN.md discovery
- Treat file names case-insensitively: PLAN.md or plan.md.
- Search the repo tree, including root and docs/, for all PLAN.md files.
- Each PLAN.md is a separate execution stream.

Orchestration workflow
1) Index plans
   - Build a list of all PLAN.md paths.
   - For each plan, extract task IDs referenced in the plan (A1, B2, etc.).
2) Validate tasks
   - For every task ID, verify it exists in tasks.yaml.
   - If a task is missing, mark that plan stream as blocked and request human clarification.
3) Map tasks to agents
   - Use agents.yaml to select the correct agent for each task ID.
   - Enforce agent permissions and constraints.
4) Build a global dependency graph
   - Use tasks.yaml inputs/outputs and phase order as dependencies.
   - Tasks in later phases must not start before earlier phases are complete.
5) Parallelize safely
   - Parallel execution is allowed only when:
     - Tasks are in the same phase, and
     - Output paths do not overlap, and
     - Directory boundaries do not conflict.
6) Execute in dry-run mode
   - All writes are proposed only; no actual write without explicit human approval.
7) Report and audit
   - Summarize proposed changes per task with file targets and rationale.
   - Log all actions and decisions in the task report output.

Parallelization rules
- Allowed:
  - Different tasks in the same phase that write to different directories.
  - Different plans that touch disjoint output paths.
- Not allowed:
  - Any cross-phase parallelization (e.g., B tasks before A tasks finish).
  - Any overlapping output paths or shared file targets.

Conflict resolution
- If two tasks target the same output file or directory, run them sequentially.
- If two plans claim the same task ID, merge into a single execution stream.
- If a plan asks to write outside the allowed directories in repo_structure.md, block it.

Subagent roles (from agents.yaml)
- infra_agent: A1, A2, A3
- backend_agent: B1, B2, B3
- frontend_agent: D1, D2, D3, D4
- ai_agent: C1, C2, C3, C4
- design_agent: F1, F2

Execution contract
- Read-only analysis is always allowed.
- Write operations are dry-run by default.
- No plan modifications without human approval.
- No secrets in code or docs.

Task report template (per task)
- Task ID:
- Plan file:
- Assigned agent:
- Inputs used:
- Outputs proposed:
- Dry-run summary:
- Open questions / blockers:

Definition of Done
- All tasks are validated against tasks.yaml.
- No file writes outside permitted directories.
- All proposed changes are listed with exact output paths.
- Human approval captured before any write is executed.
