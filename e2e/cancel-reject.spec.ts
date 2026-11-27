import { test, expect, type Page } from "@playwright/test";
import { clearOrders, db, makeOrder } from "./db";
import { loginAs as signIn, logout } from "./helpers";

// Wait until the login finished before the test moves on to another page.
async function loginAs(page: Page, email: string) {
  await signIn(page, email);
  await expect(page).not.toHaveURL(/\/login/);
}

// F-06 UI. Test IDs follow docs/sprint_2/sprints/F-06-cancel-reject.md. Orders are inserted directly in the E2E database.
test.describe("F-06 cancel and reject", () => {
  let orderId: number;

  test.beforeEach(async () => {
    await clearOrders();
    orderId = (await makeOrder("alice@cafe.test", [["Latte", 2]], "PLACED")).id;
  });

  test("TEST-F06-17 Keep order closes the confirm and leaves the order PLACED", async ({ page }) => {
    await loginAs(page, "alice@cafe.test");
    await page.goto(`/orders/${orderId}`);
    await page.getByRole("button", { name: "Cancel order" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText(`Cancel order #${orderId}?`);
    await dialog.getByRole("button", { name: "Keep order" }).click();
    await expect(dialog).toHaveCount(0);
    expect((await db.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe("PLACED");
  });

  test("TEST-F06-18 cancelling shows the toast, the new status and no Cancel button", async ({ page }) => {
    await loginAs(page, "alice@cafe.test");
    await page.goto(`/orders/${orderId}`);
    await page.getByRole("button", { name: "Cancel order" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Cancel order" }).click();
    await expect(page.getByText(`Order #${orderId} cancelled.`)).toBeVisible();
    await expect(page.getByText("You cancelled this order")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel order" })).toHaveCount(0);
    expect((await db.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe("CANCELLED");
  });

  test("TEST-F06-19 a reason under 3 characters is not sent", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await page.getByTestId(`order-${orderId}`).getByRole("button", { name: "Reject", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/Reason/).fill("ab");
    await dialog.getByRole("button", { name: "Reject order" }).click();
    await expect(dialog).toContainText("Write at least 3 characters.");
    expect((await db.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe("PLACED");
  });

  test("TEST-F06-20 operator rejects with a reason and the customer sees it", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await page.getByTestId(`order-${orderId}`).getByRole("button", { name: "Reject", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/Reason/).fill("Out of milk");
    await dialog.getByRole("button", { name: "Reject order" }).click();
    await expect(page.getByText(`Order #${orderId} rejected. The customer can see your reason.`)).toBeVisible();
    await expect(page.getByTestId(`order-${orderId}`)).toHaveCount(0);
    await logout(page);
    await loginAs(page, "alice@cafe.test");
    await page.goto(`/orders/${orderId}`);
    await expect(page.getByText("The café rejected this order")).toBeVisible();
    await expect(page.getByText("Out of milk")).toBeVisible();
  });

  test("TEST-F06-21 order cancelled after the page loaded: accept and reject show the server text", async ({ page }) => {
    const other = (await makeOrder("bob@cafe.test", [["Latte", 1]], "PLACED")).id;
    await loginAs(page, "staff@cafe.test");
    await expect(page.getByTestId(`order-${orderId}`)).toBeVisible();
    await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED", cancelledAt: new Date() } });

    await page.getByTestId(`order-${orderId}`).getByRole("button", { name: "Accept order" }).click();
    await expect(page.getByRole("alert")).toContainText("Only PLACED orders can be accepted.");

    // The list reloaded after the 409; now the second order is cancelled behind the page's back.
    await expect(page.getByTestId(`order-${orderId}`)).toHaveCount(0);
    await db.order.update({ where: { id: other }, data: { status: "CANCELLED", cancelledAt: new Date() } });
    await page.getByTestId(`order-${other}`).getByRole("button", { name: "Reject", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/Reason/).fill("Out of milk");
    await dialog.getByRole("button", { name: "Reject order" }).click();
    await expect(page.getByRole("alert")).toContainText(`Order #${other} was already cancelled by the customer.`);
    await expect(page.getByTestId(/^order-/)).toHaveCount(0);
  });
});
