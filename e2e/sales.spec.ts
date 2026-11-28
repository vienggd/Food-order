import { test, expect } from "@playwright/test";
import { clearOrders, db } from "./db";
import { loginAs } from "./helpers";

// F-10 sales summary (TEST-10.9). Orders are inserted directly in the E2E database.
async function sale(items: [string, number][], pickedUpAt: string, paymentStatus: "PAID" | "UNPAID" = "PAID") {
  const alice = await db.user.findUniqueOrThrow({ where: { email: "alice@cafe.test" } });
  const menu = await db.menuItem.findMany({ where: { name: { in: items.map(([n]) => n) } } });
  const lines = items.map(([name, quantity]) => {
    const m = menu.find((x) => x.name === name)!;
    return { menuItemId: m.id, name: m.name, unitPrice: m.price, quantity };
  });
  await db.order.create({
    data: {
      customerId: alice.id,
      status: "PICKED_UP",
      paymentStatus,
      pickedUpAt: new Date(pickedUpAt),
      total: lines.reduce((t, l) => t + l.unitPrice * l.quantity, 0),
      lines: { create: lines },
    },
  });
}

test.describe("F-10 sales summary", () => {
  test.beforeEach(async () => {
    await clearOrders();
  });

  test("TEST-10.9 operator sees cards, per-day table and top 3 for a date range", async ({ page }) => {
    await sale([["Latte", 2], ["Americano", 1]], "2026-11-10T05:00:00Z"); // 13000 + 5500
    await sale([["Latte", 1]], "2026-11-12T05:00:00Z"); // 6500
    await sale([["Thai Milk Tea", 9]], "2026-11-12T05:00:00Z", "UNPAID"); // not counted
    await loginAs(page, "staff@cafe.test");
    await expect(page).toHaveURL(/\/operator\/orders/);
    await page.goto("/operator/sales");
    await page.getByLabel("From").fill("2026-11-01");
    await page.getByLabel("To").fill("2026-11-30");
    await page.getByRole("button", { name: "Show" }).click();
    await expect(page.getByTestId("sales-orders")).toHaveText("2");
    await expect(page.getByTestId("sales-total")).toHaveText("฿250.00");
    await expect(page.getByTestId("day-2026-11-10")).toContainText("฿185.00");
    await expect(page.getByTestId("top-items").locator("li").first()).toContainText("Latte");
    await expect(page.getByTestId("top-items")).not.toContainText("Thai Milk Tea");
  });

  test("TEST-10.9 empty period shows the empty message; a bad range shows the server message", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await expect(page).toHaveURL(/\/operator\/orders/);
    await page.goto("/operator/sales");
    await expect(page.getByText("No sales in this period.")).toBeVisible();
    await page.getByLabel("From").fill("2026-11-30");
    await page.getByLabel("To").fill("2026-11-01");
    await page.getByRole("button", { name: "Show" }).click();
    await expect(page.getByText("From must not be after to.")).toBeVisible();
  });
});
