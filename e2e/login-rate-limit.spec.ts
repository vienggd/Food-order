import { test, expect } from "@playwright/test";
import { db } from "./db";

// F-12 login rate limit (TEST-12.8). The failure rows are cleared before and after so other specs can log in.
test.describe("F-12 login rate limit", () => {
  test.beforeEach(async () => {
    await db.loginFailure.deleteMany();
  });
  test.afterEach(async () => {
    await db.loginFailure.deleteMany();
  });

  test("TEST-12.8 five wrong logins show the message and disable Log in", async ({ page }) => {
    await page.goto("/login");
    for (let i = 0; i < 5; i++) {
      await page.getByLabel("Email").fill("alice@cafe.test");
      await page.getByLabel("Password").fill("wrong-password");
      await page.getByRole("button", { name: "Log in" }).click();
      await expect(page.getByRole("alert")).toContainText("Incorrect email or password.");
    }
    // The sixth attempt is refused, even with a password; the message comes from the server.
    await page.getByLabel("Email").fill("alice@cafe.test");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("alert")).toContainText(/Too many failed logins\. Try again in \d+ minutes?\./);
    await expect(page.getByRole("button", { name: "Log in" })).toBeDisabled();
  });
});
