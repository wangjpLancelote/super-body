import type { PolicyDecision, ToolExecutionContext } from "@repo/core";

export interface PolicyEngine {
  decideToolExecution(context: ToolExecutionContext): PolicyDecision;
}

export class DefaultPolicyEngine implements PolicyEngine {
  decideToolExecution(context: ToolExecutionContext): PolicyDecision {
    if (context.riskLevel === "read") {
      return {
        allowed: true,
        mode: "auto",
        reason: "Read-only tools may run automatically.",
      };
    }

    if (context.riskLevel === "write") {
      return {
        allowed: false,
        mode: "confirm",
        reason: "Write tools require explicit confirmation.",
      };
    }

    return {
      allowed: false,
      mode: "blocked",
      reason: "Sensitive tools are blocked by default.",
    };
  }
}
