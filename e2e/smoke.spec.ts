import { expect, test } from "@playwright/test";

test("web can talk to gateway", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("gateway-status")).toContainText("online", {
    timeout: 15_000,
  });

  await page.getByTestId("chat-input").fill("hello from e2e");
  await page.getByTestId("chat-submit").click();

  await expect(page.getByTestId("chat-reply")).toContainText(
    "MVP skeleton online.",
  );
  await expect(page.getByTestId("chat-reply")).toContainText("hello from e2e");
});
