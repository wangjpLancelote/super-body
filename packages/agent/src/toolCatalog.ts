import type { ToolRegistry } from "@repo/tools";

export function renderToolCatalog(registry: ToolRegistry): string {
  const tools = registry.list();

  if (tools.length === 0) {
    return "No tools available.";
  }

  return tools.map((tool) => `- ${tool.name}: ${tool.description}`).join("\n");
}
