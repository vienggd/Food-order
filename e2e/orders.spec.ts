import { test, expect, type Page } from "@playwright/test";
import { clearOrders, db } from "./db";
import { loginAs, shot } from "./helpers";

// Phone shows the cart as its own view (bar / Cart tab); desktop always shows it on the right.
async function openCart(page: Page, project: string) {
  if (project === "phone") await page.getByRole("button", { name: /View cart/ }).click();
  await expect(page.getByRole("region", { name: "Cart" })).toBeVisible();
}

test.describe("F-03 place order", () => {
  test.beforeEach(async () => {
    await clearOrders();
    await db.menuItem.updateMany({ where: { name: "Latte" }, data: { isAvailable: true } });
  });
  test.afterAll(async () => {
    await db.menuItem.updateMany({ where: { name: "Latte" }, data: { isAvailable: true } });
  });

  test("TEST-F03-19 add Latte twice + Thai Milk Tea, place order, see server total and the order in My orders", async ({ page }, info) => {
    await loginAs(page, "alice@cafe.test");
    await expect(page).toHaveURL(/\/menu$/);
    await page.getByRole("button", { name: "Add Latte" }).click();
    await page.getByRole("button", { name: "Add Latte" }).click();
    await page.getByRole("button", { name: "Add Thai Milk Tea" }).click();
    await expect(page.locator("li", { hasText: "Latte" }).first()).toContainText("In cart · 2");

    await openCart(page, info.project.name);
    const cart = page.getByRole("region", { name: "Cart" });
    await expect(cart.getByLabel("Quantity of Latte")).toHaveValue("2");
    await expect(cart).toContainText("฿180.00");
    await shot(page, "F03-cart", info.project.name);

    await cart.getByRole("button", { name: "Place order →" }).click();
    await expect(page).toHaveURL(/\/orders\/\d+$/);
    const id = Number(page.url().split("/").pop());
    await expect(page.getByText(`Order #${id} placed!`)).toBeVisible();
    await expect(page.locator(".order-detail")).toContainText("฿180.00");
    await expect(page.locator(".order-detail")).toContainText("PLACED");
    await shot(page, "F03-order-detail", info.project.name);

    const saved = await db.order.findUniqueOrThrow({ where: { id } });
    expect(saved.total).toBe(18000);

    await page.goto("/orders");
    const row = page.getByRole("button", { name: new RegExp(`#${id}`) });
    await expect(row).toContainText("3 items");
    await expect(row).toContainText("PLACED");
    await shot(page, "F03-my-orders", info.project.name);
  });

  test("TEST-F03-20 item sells out while in the cart: message names it, cart kept, line marked, nothing saved", async ({ page }, info) => {
    await loginAs(page, "alice@cafe.test");
    await page.getByRole("button", { name: "Add Latte" }).click();
    await db.menuItem.updateMany({ where: { name: "Latte" }, data: { isAvailable: false } });

    await openCart(page, info.project.name);
    const cart = page.getByRole("region", { name: "Cart" });
    await cart.getByRole("button", { name: "Place order →" }).click();

    await expect(cart.getByRole("alert")).toContainText("'Latte' is no longer available.");
    await expect(cart.getByLabel("Quantity of Latte")).toHaveValue("1");
    await expect(cart.locator(".cart-line.bad")).toContainText("Sold out");
    await expect(page).toHaveURL(/\/menu/);
    await shot(page, "F03-rejected-sold-out", info.project.name);
    expect(await db.order.count()).toBe(0);
  });
});

test("TEST-F03-24 phone tabs read Menu, Cart, My orders; desktop sidebar unchanged (design Menu.html)", async ({ page }, info) => {
  await loginAs(page, "alice@cafe.test");
  await expect(page).toHaveURL(/\/menu$/);
  const strip = (t: string) => t.replace(/\s*\(?\d+\)?$/, "").trim(); // drop the cart / menu count
  if (info.project.name === "phone") {
    const tabs = (await page.locator("nav.tabs .tab").allInnerTexts()).map(strip);
    expect(tabs).toEqual(["Menu", "Cart", "My orders"]);
  } else {
    const side = (await page.locator("nav.side-links a").allInnerTexts()).map(strip);
    expect(side).toEqual(["Menu", "My orders"]); // desktop: cart is the side panel, no Cart link
  }
});
