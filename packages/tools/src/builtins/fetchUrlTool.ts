import { z } from "zod";
import type { FetchUrlClient } from "../fetch/fetchUrlClient";
import type { Tool } from "../types";

const fetchUrlInputSchema = z.object({
  url: z
    .string()
    .url()
    .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
      message: "Only http and https URLs are supported.",
    }),
});

export function createFetchUrlTool(
  client: FetchUrlClient,
): Tool<typeof fetchUrlInputSchema> {
  return {
    name: "fetch_url",
    description: "Read a public webpage and return its title and text content.",
    inputSchema: fetchUrlInputSchema,
    timeoutMs: 12_000,
    async execute(input) {
      const result = await client.fetchUrl(input.url);

      return [
        `Title: ${result.title}`,
        `URL: ${result.url}`,
        "",
        "Content:",
        result.content,
      ].join("\n");
    },
  };
}
