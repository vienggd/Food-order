import { test, expect, type Page } from "@playwright/test";
import { clearOrders, db } from "./db";
import { loginAs } from "./helpers";
import { E2E_CLOCK_NOW } from "../playwright.config";

// F-09 pickup slot picker. Test IDs follow docs/sprint_2/sprints/F-09-pickup-slots.md.
// The E2E server runs with a fixed clock (E2E_CLOCK_NOW = 10:00 Bangkok), so open/closed slots never depend on the real time.
const DAY = E2E_CLOCK_NOW.slice(0, 10);
const slotIso = (hhmm: string) => new Date(`${DAY}T${hhmm}:00+07:00`);

async function openCart(page: Page, project: string) {
  if (project === "phone") await page.getByRole("button", { name: /View cart/ }).click();
  await expect(page.getByRole("region", { name: "Cart" })).toBeVisible();
}

test.describe("F-09 pickup slot picker", () => {
  test.beforeEach(async () => {
    await clearOrders();
    await db.menuItem.updateMany({ where: { name: "Latte" }, data: { isAvailable: true } });
  });

  async function startCart(page: Page, project: string) {
    await loginAs(page, "alice@cafe.test");
    await page.getByRole("button", { name: "Add Latte" }).click();
    await openCart(page, project);
    return page.getByRole("region", { name: "Cart" });
  }

  test("TEST-F09-15 the cart lists ASAP and the slots; past the cut-off ones are disabled and say Closed", async ({ page }, info) => {
    const cart = await startCart(page, info.project.name);
    const picker = cart.getByLabel("Pickup time");
    await expect(picker.getByRole("option", { name: "ASAP" })).toBeEnabled();
    await expect(picker.getByRole("option")).toHaveCount(37); // ASAP + 36 slots
    for (const closed of ["08:00", "10:00", "10:15"]) {
      await expect(picker.getByRole("option", { name: new RegExp(`^${closed}.*Closed`) })).toBeDisabled();
    }
    await expect(picker.getByRole("option", { name: "10:30" })).toBeEnabled();
    await expect(picker.getByRole("option", { name: "16:45" })).toBeEnabled();
  });

  test("TEST-F09-16 picking 10:30 and placing the order shows Pickup 10:30 on the order", async ({ page }, info) => {
    const cart = await startCart(page, info.project.name);
    await cart.getByLabel("Pickup time").selectOption({ label: "10:30" });
    await cart.getByRole("button", { name: "Place order →" }).click();
    await expect(page).toHaveURL(/\/orders\/\d+$/);
    await expect(page.getByText("Pickup 10:30")).toBeVisible();
  });

  test("TEST-F09-17 slot filled by someone else after the page loaded: the server text shows under the picker, slots reload, cart kept", async ({ page }, info) => {
    const cart = await startCart(page, info.project.name);
    await cart.getByLabel("Pickup time").selectOption({ label: "10:30" });
    const bob = await db.user.findUniqueOrThrow({ where: { email: "bob@cafe.test" } });
    const latte = await db.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
    for (let i = 0; i < 10; i++) {
      await db.order.create({
        data: { customerId: bob.id, total: latte.price, pickupSlot: slotIso("10:30"), lines: { create: [{ menuItemId: latte.id, name: latte.name, unitPrice: latte.price, quantity: 1 }] } },
      });
    }
    await cart.getByRole("button", { name: "Place order →" }).click();
    await expect(cart.getByText(/pickup slot is full/i)).toBeVisible();
    await expect(page).not.toHaveURL(/\/orders\/\d+$/);
    await expect(cart.getByLabel("Pickup time").getByRole("option", { name: /^10:30.*Full/ })).toBeDisabled(); // slots reloaded
    await expect(cart.getByLabel("Quantity of Latte")).toHaveValue("1"); // cart kept
    expect(await db.order.count({ where: { customerId: (await db.user.findUniqueOrThrow({ where: { email: "alice@cafe.test" } })).id } })).toBe(0);
  });
});
