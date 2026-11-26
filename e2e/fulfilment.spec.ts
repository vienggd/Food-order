import { test, expect, type Page } from "@playwright/test";
import { clearOrders, db, makeOrder } from "./db";
import { loginAs as signIn, logout } from "./helpers";

// F-07 UI. Test IDs follow docs/sprint_2/sprints/F-07-fulfilment.md. Orders are inserted directly in the E2E database.
async function loginAs(page: Page, email: string) {
  await signIn(page, email);
  await expect(page).not.toHaveURL(/\/login/);
}
const tab = (page: Page, name: string) => page.getByRole("tab", { name: new RegExp(name) });

test.describe("F-07 fulfilment", () => {
  let placed: number, accepted: number, preparing: number, ready: number;

  test.beforeEach(async () => {
    await clearOrders();
    const t = (min: number) => new Date(Date.now() - min * 60_000);
    placed = (await makeOrder("alice@cafe.test", [["Latte", 1]], "PLACED", t(8))).id;
    accepted = (await makeOrder("bob@cafe.test", [["Latte", 1]], "ACCEPTED", t(6))).id;
    preparing = (await makeOrder("alice@cafe.test", [["Latte", 1]], "PREPARING", t(4))).id;
    ready = (await makeOrder("bob@cafe.test", [["Latte", 1]], "READY", t(2))).id;
    await db.order.updateMany({ data: { paymentStatus: "PAID", paidAt: new Date() }, where: { id: { in: [accepted, preparing, ready] } } });
  });

  test("TEST-F07-16 tabs with counts; each card shows only its next button", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await expect(tab(page, "New")).toContainText("1");
    await expect(tab(page, "In progress")).toContainText("2");
    await expect(tab(page, "Ready")).toContainText("1");
    await expect(page.getByTestId(`order-${placed}`).getByRole("button", { name: "Accept order" })).toBeVisible();
    await tab(page, "In progress").click();
    await expect(page.getByTestId(`order-${accepted}`).getByRole("button", { name: "Start preparing" })).toBeVisible();
    await expect(page.getByTestId(`order-${accepted}`).getByRole("button")).toHaveCount(1);
    await expect(page.getByTestId(`order-${preparing}`).getByRole("button", { name: "Mark ready" })).toBeVisible();
    await tab(page, "Ready").click();
    await expect(page.getByTestId(`order-${ready}`).getByRole("button", { name: "Mark picked up" })).toBeVisible();
  });

  test("TEST-F07-17 Start preparing, Mark ready, Mark picked up: toast and card moves each time", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await tab(page, "In progress").click();
    await page.getByTestId(`order-${accepted}`).getByRole("button", { name: "Start preparing" }).click();
    await expect(page.getByText(`Order #${accepted} is now Preparing.`)).toBeVisible();
    await page.getByTestId(`order-${accepted}`).getByRole("button", { name: "Mark ready" }).click();
    await expect(page.getByText(`Order #${accepted} is ready.`)).toBeVisible();
    await expect(page.getByTestId(`order-${accepted}`)).toHaveCount(0);
    await tab(page, "Ready").click();
    await page.getByTestId(`order-${accepted}`).getByRole("button", { name: "Mark picked up" }).click();
    await expect(page.getByText(`Order #${accepted} picked up.`)).toBeVisible();
    await expect(page.getByTestId(`order-${accepted}`)).toHaveCount(0);
    expect((await db.order.findUniqueOrThrow({ where: { id: accepted } })).status).toBe("PICKED_UP");
  });

  test("TEST-F07-18 order moved by another staff member: the 409 text shows and the list reloads", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await tab(page, "In progress").click();
    await expect(page.getByTestId(`order-${accepted}`)).toBeVisible();
    await db.order.update({ where: { id: accepted }, data: { status: "PREPARING", preparingAt: new Date() } });
    await page.getByTestId(`order-${accepted}`).getByRole("button", { name: "Start preparing" }).click();
    await expect(page.getByRole("alert")).toContainText(`Order #${accepted} is already PREPARING. Another staff member moved it.`);
    await expect(page.getByTestId(`order-${accepted}`).getByRole("button", { name: "Mark ready" })).toBeVisible();
  });

  test("TEST-F07-19 the customer sees the step the operator set", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await tab(page, "In progress").click();
    await page.getByTestId(`order-${accepted}`).getByRole("button", { name: "Start preparing" }).click();
    await expect(page.getByText(`Order #${accepted} is now Preparing.`)).toBeVisible();
    await logout(page);
    await loginAs(page, "bob@cafe.test");
    await page.goto(`/orders/${accepted}`);
    await expect(page.locator(".pill")).toContainText("PREPARING");
    await expect(page.getByText("Your order is being prepared.")).toBeVisible();
  });
});
