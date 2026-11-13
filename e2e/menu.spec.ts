import { test, expect } from "@playwright/test";
import { loginAs, shot } from "./helpers";

test.describe("F-02 menu", () => {
  test("TEST-F02-08 prices in baht; sold-out item greyed with a disabled add button", async ({ page }, info) => {
    await loginAs(page, "alice@cafe.test");
    await expect(page).toHaveURL(/\/menu$/);
    const latte = page.locator("li", { hasText: "Latte" }).first();
    await expect(latte).toContainText("฿65.00");
    const croissant = page.locator("li", { hasText: "Croissant" }).first();
    await expect(croissant).toContainText(/sold out/i);
    await expect(page.getByRole("button", { name: "Add Croissant" })).toBeDisabled();
    await shot(page, "F02-menu-sold-out", info.project.name);
  });

  test("TEST-F02-09 menu load error shows the message; Reload menu loads it", async ({ page }) => {
    await loginAs(page, "alice@cafe.test");
    await expect(page).toHaveURL(/\/menu$/);
    await page.route("**/api/menu", (route) => route.fulfill({ status: 500, body: "boom" }));
    await page.reload();
    await expect(page.getByText("Couldn't load the menu. Check your connection.")).toBeVisible();

    await page.unroute("**/api/menu");
    await page.getByRole("button", { name: "Reload menu" }).click();
    await expect(page.locator("li", { hasText: "Latte" }).first()).toBeVisible();
  });
});
