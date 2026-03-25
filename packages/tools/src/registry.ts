import {
  toolResultSchema,
  type Tool,
  type ToolCall,
  type ToolResult,
} from "./types";
import { ToolTimeoutError } from "./errors";

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  toolName: string,
) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ToolTimeoutError(toolName, timeoutMs));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export class ToolRegistry {
  private readonly tools = new Map<string, Tool>();

  register(tool: Tool) {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }

    this.tools.set(tool.name, tool);
  }

  list() {
    return [...this.tools.values()].map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      riskLevel: tool.riskLevel,
    }));
  }

  get(name: string) {
    return this.tools.get(name);
  }

  async execute(call: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(call.name);

    if (!tool) {
      return toolResultSchema.parse({
        callId: call.id,
        toolName: call.name,
        ok: false,
        content: "",
        error: `Tool not found: ${call.name}`,
      });
    }

    try {
      const parsedInput = tool.inputSchema.parse(call.arguments);
      const content = await withTimeout(
        tool.execute(parsedInput),
        tool.timeoutMs ?? 10_000,
        tool.name,
      );

      return toolResultSchema.parse({
        callId: call.id,
        toolName: call.name,
        ok: true,
        content,
      });
    } catch (error) {
      const normalized =
        error instanceof Error ? error.message : "Unknown tool execution error";

      return toolResultSchema.parse({
        callId: call.id,
        toolName: call.name,
        ok: false,
        content: "",
        error: normalized,
      });
    }
  }
}
