export class ToolNotFoundError extends Error {
  constructor(toolName: string) {
    super(`Tool not found: ${toolName}`);
    this.name = "ToolNotFoundError";
  }
}

// 工具超时错误
export class ToolTimeoutError extends Error {
  constructor(toolName: string, timeoutMs: number) {
    super(`Tool timed out: ${toolName} after ${timeoutMs}ms`);
    this.name = "ToolTimeoutError";
  }
}

// 工具执行错误
export class ToolExecutionError extends Error {
  constructor(toolName: string, message: string) {
    super(`Tool execution failed: ${toolName} - ${message}`);
    this.name = "ToolExecutionError";
  }
}
