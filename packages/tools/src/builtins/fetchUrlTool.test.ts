import assert from "node:assert/strict";
import test from "node:test";
import { createFetchUrlTool } from "./fetchUrlTool";

test("formats fetched page content into readable text", async () => {
  const tool = createFetchUrlTool({
    async fetchUrl(url) {
      return {
        url,
        title: "Example Domain",
        content: "Example content for testing.",
      };
    },
  });

  const output = await tool.execute({ url: "https://example.com" });

  assert.match(output, /Title: Example Domain/);
  assert.match(output, /URL: https:\/\/example\.com/);
  assert.match(output, /Example content for testing\./);
});
