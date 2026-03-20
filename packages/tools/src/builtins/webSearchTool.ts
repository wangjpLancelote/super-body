import { z } from "zod";
import type { SearchClient } from "../search/searchClient";
import type { Tool } from "../types";

const webSearchInputSchema = z.object({
  query: z.string().min(1),
});

export function createWebSearchTool(
  client: SearchClient,
): Tool<typeof webSearchInputSchema> {
  return {
    name: "web_search",
    description: "Search the web for recent or factual information.",
    inputSchema: webSearchInputSchema,
    timeoutMs: 12_000,
    async execute(input) {
      const results = await client.search(input.query);

      if (results.length === 0) {
        return `No search results found for query: ${input.query}`;
      }

      return results
        .map(
          (item, index) =>
            `${index + 1}. ${item.title}\nURL: ${item.url}\nSnippet: ${item.snippet}`,
        )
        .join("\n\n");
    },
  };
}
