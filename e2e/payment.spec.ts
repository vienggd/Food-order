import { test, expect } from "@playwright/test";
import { clearOrders, db, makeOrder } from "./db";
import { loginAs } from "./helpers";

// F-08 payment (TEST-8.16, TEST-8.18). Orders are inserted directly in the E2E database.
test.describe("F-08 payment", () => {
  let orderId: number;

  test.beforeEach(async () => {
    await clearOrders();
    orderId = (await makeOrder("alice@cafe.test", [["Latte", 2]], "PLACED")).id;
  });

  test("TEST-8.16 customer pays an unpaid order; the Paid badge persists after reload", async ({ page }) => {
    await loginAs(page, "alice@cafe.test");
    await expect(page).toHaveURL(/\/menu$/);
    await page.goto(`/orders/${orderId}`);
    await page.getByRole("button", { name: /^Pay ฿130\.00 \(simulated\)$/ }).click();
    await expect(page.getByText("Paid ฿130.00 (simulated).")).toBeVisible();
    await expect(page.getByLabel("Payment").getByTestId("payment-badge")).toHaveText("Paid");
    await page.reload();
    await expect(page.getByLabel("Payment").getByTestId("payment-badge")).toHaveText("Paid");
    expect((await db.order.findUniqueOrThrow({ where: { id: orderId } })).paymentStatus).toBe("PAID");
  });

  test("TEST-8.18 payment card says Simulated and has no card fields", async ({ page }) => {
    await loginAs(page, "alice@cafe.test");
    await expect(page).toHaveURL(/\/menu$/);
    await page.goto(`/orders/${orderId}`);
    const card = page.getByLabel("Payment");
    await expect(card).toContainText("Simulated");
    await expect(card).toContainText("no real money moves and no card details are asked");
    await expect(card.locator("input")).toHaveCount(0);
  });

  test("TEST-8.17 READY unpaid order disables Mark picked up until paid and refreshed", async ({ page }) => {
    await db.order.update({ where: { id: orderId }, data: { status: "READY", acceptedAt: new Date(), preparingAt: new Date(), readyAt: new Date() } });
    await loginAs(page, "staff@cafe.test");
    await expect(page).toHaveURL(/\/operator\/orders/);
    await page.goto("/operator/orders?tab=ready");
    const card = page.getByTestId(`order-${orderId}`);
    await expect(card).toContainText("Waiting for payment. The customer pays in the app.");
    const btn = card.getByRole("button", { name: "Mark picked up" });
    await expect(btn).toBeDisabled();

    await db.order.update({ where: { id: orderId }, data: { paymentStatus: "PAID", paidAt: new Date() } });
    await page.getByRole("button", { name: "Refresh queue" }).click();
    await expect(btn).toBeEnabled();
    await btn.click();
    await expect(page.getByText(`Order #${orderId} picked up.`)).toBeVisible();
    await expect(page.getByTestId(`order-${orderId}`)).toHaveCount(0);
  });
});
