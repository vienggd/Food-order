import { test, expect } from "@playwright/test";
import { db } from "./db";
import { loginAs } from "./helpers";

// F-05 operator menu management (TEST-5.15 .. TEST-5.17). The menu is shared with other specs, so every test puts it back.
test.describe("F-05 operator menu", () => {
  let latteId: number, latteBefore: { price: number; isAvailable: boolean };

  test.beforeEach(async () => {
    const latte = await db.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
    latteId = latte.id;
    latteBefore = { price: latte.price, isAvailable: latte.isAvailable };
    await db.menuItem.deleteMany({ where: { name: "E2E Chai" } });
  });
  test.afterEach(async () => {
    await db.menuItem.update({ where: { id: latteId }, data: latteBefore });
    await db.menuItem.deleteMany({ where: { name: "E2E Chai" } });
  });

  test("TEST-5.15 operator opens Menu and sees items, switches and Add item", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await page.getByRole("link", { name: "Menu items" }).locator("visible=true").first().click();
    await expect(page).toHaveURL(/\/operator\/menu$/);
    await expect(page.getByTestId(`menu-${latteId}`)).toContainText("฿65.00");
    await expect(page.getByRole("switch", { name: "Sold out: Latte" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add item" })).toBeVisible();
  });

  test("TEST-5.16 edit a price and toggle sold out; both persist after reload", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await expect(page).toHaveURL(/\/operator\/orders$/);
    await page.goto("/operator/menu");
    await page.getByTestId(`menu-${latteId}`).getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Price (฿)").fill("70");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Latte saved.")).toBeVisible();
    await page.getByRole("switch", { name: "Sold out: Latte" }).click();
    await expect(page.getByText("Latte is sold out for new orders.")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId(`menu-${latteId}`)).toContainText("฿70.00");
    await expect(page.getByRole("switch", { name: "Sold out: Latte" })).toBeChecked();
    const row = await db.menuItem.findUniqueOrThrow({ where: { id: latteId } });
    expect(row).toMatchObject({ price: 7000, isAvailable: false });
  });

  test("TEST-5.17 duplicate name shows the message under Name and keeps typed values", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await expect(page).toHaveURL(/\/operator\/orders$/);
    await page.goto("/operator/menu");
    await page.getByRole("button", { name: "Add item" }).first().click();
    await page.getByLabel(/^Name/).fill("latte");
    await page.getByLabel("Price (฿)").fill("50");
    await page.getByRole("button", { name: "Add item" }).last().click();
    await expect(page.getByText('A menu item named "Latte" already exists.')).toBeVisible();
    await expect(page.getByLabel(/^Name/)).toHaveValue("latte");
    await expect(page.getByLabel("Price (฿)")).toHaveValue("50");
    // a good name is added
    await page.getByLabel(/^Name/).fill("E2E Chai");
    await page.getByRole("button", { name: "Add item" }).last().click();
    await expect(page.getByText("E2E Chai added.")).toBeVisible();
  });
});
