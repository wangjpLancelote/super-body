import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm --filter @repo/gateway dev",
      url: "http://127.0.0.1:8787/health",
      reuseExistingServer: true,
      cwd: "..",
      timeout: 30_000,
    },
    {
      command: "pnpm --filter @repo/web dev",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: true,
      cwd: "..",
      timeout: 30_000,
    },
  ],
});
