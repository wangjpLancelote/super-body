import assert from "node:assert/strict";
import test from "node:test";
import { createWebSearchTool } from "./webSearchTool";

test("formats search results into readable text", async () => {
  const tool = createWebSearchTool({
    async search() {
      return [
        {
          title: "OpenAI News",
          url: "https://example.com/openai",
          snippet: "Latest update",
        },
      ];
    },
  });

  const output = await tool.execute({ query: "openai" });

  assert.match(output, /OpenAI News/);
  assert.match(output, /https:\/\/example.com\/openai/);
});

test("returns no-results message when empty", async () => {
  const tool = createWebSearchTool({
    async search() {
      return [];
    },
  });

  const output = await tool.execute({ query: "nothing" });

  assert.match(output, /No search results found/i);
});
