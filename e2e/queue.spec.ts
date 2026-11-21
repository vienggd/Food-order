import { test, expect } from "@playwright/test";
import { clearOrders, db, makeOrder } from "./db";
import { loginAs, shot } from "./helpers";

test.describe("F-04 operator queue", () => {
  let first: number, second: number;

  test.beforeEach(async () => {
    await clearOrders();
    first = (await makeOrder("alice@cafe.test", [["Latte", 2], ["Americano", 1]], "PLACED", new Date(Date.now() - 6 * 60_000))).id;
    second = (await makeOrder("bob@cafe.test", [["Thai Milk Tea", 1]], "PLACED", new Date(Date.now() - 2 * 60_000))).id;
  });

  test("TEST-F04-11 operator sees PLACED orders oldest first with the count", async ({ page }, info) => {
    await loginAs(page, "staff@cafe.test");
    const cards = page.getByTestId(/^order-/);
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText(`#${first}`);
    await expect(cards.nth(0)).toContainText("Alice");
    await expect(cards.nth(0)).toContainText("Latte ×2, Americano ×1");
    await expect(cards.nth(1)).toContainText(`#${second}`);
    await expect(page.locator(".count")).toHaveText("2");
    await shot(page, "F04-queue", info.project.name);
  });

  test("TEST-F04-12 accept shows success and removes the card", async ({ page }, info) => {
    await loginAs(page, "staff@cafe.test");
    await page.getByTestId(`order-${first}`).getByRole("button", { name: "Accept order" }).click();
    await expect(page.getByText(`Order #${first} accepted.`)).toBeVisible();
    await expect(page.getByTestId(/^order-/)).toHaveCount(1);
    await shot(page, "F04-accepted", info.project.name);
    expect((await db.order.findUniqueOrThrow({ where: { id: first } })).status).toBe("ACCEPTED");
  });

  test("TEST-F04-13 order accepted elsewhere: 409 message and the list reloads", async ({ page }, info) => {
    await loginAs(page, "staff@cafe.test");
    await expect(page.getByTestId(`order-${first}`)).toBeVisible();
    // Another staff member accepts it after this page loaded.
    await db.order.update({ where: { id: first }, data: { status: "ACCEPTED", acceptedAt: new Date() } });

    await page.getByTestId(`order-${first}`).getByRole("button", { name: "Accept order" }).click();
    await expect(page.getByRole("alert")).toHaveText(`Order #${first}: Already accepted by another staff member.`);
    await expect(page.getByTestId(`order-${first}`)).toHaveCount(0);
    await expect(page.getByTestId(/^order-/)).toHaveCount(1);
    await shot(page, "F04-409-already-accepted", info.project.name);
  });
});
