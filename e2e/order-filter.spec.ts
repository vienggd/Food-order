import { test, expect, type Page } from "@playwright/test";
import { clearOrders, makeOrder } from "./db";
import { loginAs as signIn } from "./helpers";

// F-11 customer filter UI. Test IDs follow docs/sprint_2/sprints/F-11-search-filter.md. Orders are inserted directly.
async function loginAs(page: Page, email: string) {
  await signIn(page, email);
  await expect(page).not.toHaveURL(/\/login/);
}

test.describe("F-11 customer status filter", () => {
  let placed: number, ready: number, cancelled: number;

  test.beforeEach(async () => {
    await clearOrders();
    const t = (min: number) => new Date(Date.now() - min * 60_000);
    placed = (await makeOrder("alice@cafe.test", [["Latte", 1]], "PLACED", t(6))).id;
    ready = (await makeOrder("alice@cafe.test", [["Latte", 1]], "READY", t(4))).id;
    cancelled = (await makeOrder("alice@cafe.test", [["Latte", 1]], "CANCELLED", t(2))).id;
  });

  test("TEST-F11-16 the Ready chip puts the status in the URL and shows only Ready orders", async ({ page }) => {
    await loginAs(page, "alice@cafe.test");
    await page.goto("/orders");
    const rows = page.locator(".order-row");
    await expect(rows).toHaveCount(3);
    await page.getByRole("button", { name: "Ready", exact: true }).click();
    await expect(page).toHaveURL(/status=READY/);
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(`#${ready}`);
    await page.getByRole("button", { name: "Picked up", exact: true }).click();
    await expect(page.getByText("No orders with this status.")).toBeVisible();
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(rows).toHaveCount(3);
    expect([placed, cancelled].length).toBe(2);
  });
});
