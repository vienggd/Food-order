import { test, expect } from "@playwright/test";
import { clearOrders, db, makeOrder } from "./db";
import { loginAs, logout } from "./helpers";

test.describe("Lab 6 UAT defect regressions", () => {
  test.beforeEach(async () => {
    await clearOrders();
    await db.menuItem.updateMany({ where: { name: "Latte" }, data: { isAvailable: true } });
  });

  test("TEST-L6-123 phone cart bar does not cover the last menu item (#123)", async ({ page }, info) => {
    test.skip(info.project.name !== "phone", "phone viewport only");
    await loginAs(page, "alice@cafe.test");
    await page.getByRole("button", { name: "Add Latte" }).click();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const addLast = page.getByRole("button", { name: "Add Basil Chicken Rice" });
    const cartBar = page.locator(".cart-bar");
    await expect(addLast).toBeVisible();
    await expect(cartBar).toBeVisible();

    const btnBox = await addLast.boundingBox();
    const barBox = await cartBar.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(barBox).not.toBeNull();
    expect(btnBox!.y + btnBox!.height).toBeLessThanOrEqual(barBox!.y);

    await addLast.click();
    await expect(page.locator("li.menu-item", { hasText: "Basil Chicken Rice" })).toContainText("In cart · 1");
  });

  test("TEST-L6-122 access warning clears on logout and on next navigation (#122)", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "tested on desktop flow");
    await loginAs(page, "alice@cafe.test");
    await expect(page).toHaveURL(/\/menu$/);
    await page.goto("/operator/orders");
    await expect(page).toHaveURL(/\/menu$/);
    await expect(page.getByText("You don't have access to that page.")).toBeVisible();

    // Case A: logout clears the warning on /login
    await logout(page);
    await expect(page.getByText("You don't have access to that page.")).toHaveCount(0);

    // Case B: placing an order navigates to /orders/:id without keeping the warning
    await loginAs(page, "alice@cafe.test");
    await expect(page).toHaveURL(/\/menu$/);
    await page.goto("/operator/orders");
    await expect(page).toHaveURL(/\/menu$/);
    await expect(page.getByText("You don't have access to that page.")).toBeVisible();
    await page.getByRole("button", { name: "Add Latte" }).click();
    await page.getByRole("button", { name: "Place order →" }).click();
    await expect(page).toHaveURL(/\/orders\/\d+$/);
    await expect(page.getByText("You don't have access to that page.")).toHaveCount(0);
  });

  test("TEST-L6-124 Order placed banner disappears after reload and after status becomes ACCEPTED (#124)", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "desktop", "tested on desktop flow");
    await loginAs(page, "alice@cafe.test");
    await page.getByRole("button", { name: "Add Latte" }).click();
    await page.getByRole("button", { name: "Place order →" }).click();
    await expect(page).toHaveURL(/\/orders\/\d+$/);
    const id1 = Number(page.url().split("/").pop());
    await expect(page.getByText(`Order #${id1} placed!`)).toBeVisible();

    await page.reload();
    await expect(page.getByText(`Order #${id1} placed!`)).toHaveCount(0);

    await page.goto("/menu");
    await page.getByRole("button", { name: "Add Latte" }).click();
    await page.getByRole("button", { name: "Place order →" }).click();
    await expect(page).toHaveURL(/\/orders\/\d+$/);
    const id2 = Number(page.url().split("/").pop());
    await expect(page.getByText(`Order #${id2} placed!`)).toBeVisible();

    await db.order.update({ where: { id: id2 }, data: { status: "ACCEPTED", acceptedAt: new Date() } });
    await page.getByRole("button", { name: "Refresh status" }).click();
    await expect(page.locator(".order-detail")).toContainText("ACCEPTED");
    await expect(page.getByText(`Order #${id2} placed!`)).toHaveCount(0);
  });

  test("TEST-L6-125 desktop split view keeps list status synced when Refresh status runs (#125)", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "desktop", "desktop split view only");
    await loginAs(page, "alice@cafe.test");
    await page.getByRole("button", { name: "Add Latte" }).click();
    await page.getByRole("button", { name: "Place order →" }).click();
    await expect(page).toHaveURL(/\/orders\/\d+$/);
    const id = Number(page.url().split("/").pop());
    await expect(page.locator(".order-list button", { hasText: `#${id}` })).toContainText("PLACED");

    await db.order.update({ where: { id }, data: { status: "ACCEPTED", acceptedAt: new Date() } });
    await page.getByRole("button", { name: "Refresh status" }).click();

    await expect(page.locator(".order-detail")).toContainText("ACCEPTED");
    await expect(page.locator(".order-list button", { hasText: `#${id}` })).toContainText("ACCEPTED");
  });

  test("TEST-L6-126 login 400 shows server validation message instead of generic network error (#126)", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "desktop", "same login form on desktop and phone");
    await page.goto("/login");
    await page.getByLabel("Email").fill("alice@cafe.test");
    await page.getByLabel("Password").fill("x".repeat(201));
    await page.getByRole("button", { name: "Log in" }).click();
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).not.toContainText("Something went wrong");

    await page.getByLabel("Email").fill("a..b@cafe.test");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(alert).toBeVisible();
    await expect(alert).not.toContainText("Something went wrong");
  });

  test("TEST-L6-128 cart badge counts cart lines rather than total item quantities (#128)", async ({ page }, info) => {
    await loginAs(page, "alice@cafe.test");
    await page.getByRole("button", { name: "Add Latte" }).click();
    await page.getByRole("button", { name: "Add Latte" }).click();

    if (info.project.name === "phone") {
      await expect(page.locator("nav.tabs a", { hasText: "Cart" })).toHaveText("Cart (1)");
    } else {
      await expect(page.locator("nav.side-links .count")).toHaveText("1");
    }

    await page.getByRole("button", { name: "Add Thai Milk Tea" }).click();
    if (info.project.name === "phone") {
      await expect(page.locator("nav.tabs a", { hasText: "Cart" })).toHaveText("Cart (2)");
    } else {
      await expect(page.locator("nav.side-links .count")).toHaveText("2");
    }
  });

  test("TEST-L6-129 phone top bar displays Campus Café brand without horizontal overflow (#129)", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "phone", "phone viewport only");
    await loginAs(page, "alice@cafe.test");
    await expect(page.locator("header.top")).toContainText("Campus Café");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("TEST-L6-132 desktop operator queue uses a semantic table with column headers (#132)", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "desktop table layout only");
    const order = await makeOrder("alice@cafe.test", [["Latte", 1]], "PLACED");
    await loginAs(page, "staff@cafe.test");
    const table = page.getByRole("table");
    await expect(table).toBeVisible();
    for (const col of ["Order", "Customer", "Items", "Placed", "Total", "Action"]) {
      await expect(table.getByRole("columnheader", { name: col })).toBeVisible();
    }
    await expect(table.getByTestId(`order-${order.id}`)).toContainText("Alice");
  });
});
