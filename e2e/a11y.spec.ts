import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { clearOrders, makeOrder } from "./db";
import { loginAs as signIn } from "./helpers";

// NFR-09 accessibility (F-12 contract) and UAT findings #130, #131, #133.
// Rule: no critical or serious axe violation on any screen; dialogs and the cart work by keyboard only.
async function loginAs(page: Page, email: string) {
  await signIn(page, email);
  await expect(page).not.toHaveURL(/\/login/);
}

async function seriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

test.describe("NFR-09 axe: no critical or serious violations", () => {
  let orderId: number;
  test.beforeEach(async () => {
    await clearOrders();
    orderId = (await makeOrder("alice@cafe.test", [["Latte", 2]], "PLACED")).id;
  });

  test("TEST-A11Y-01 login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("TEST-A11Y-02 customer: menu, cart, my orders, order detail", async ({ page }) => {
    await loginAs(page, "alice@cafe.test");
    await page.getByRole("button", { name: "Add Latte" }).click();
    await expect(page.getByRole("button", { name: "Add Latte" })).toBeVisible();
    expect(await seriousViolations(page), "menu").toEqual([]);
    await page.goto("/menu#cart");
    await expect(page.getByRole("region", { name: "Cart" })).toBeVisible();
    expect(await seriousViolations(page), "cart").toEqual([]);
    await page.goto("/orders");
    await expect(page.getByTestId(`order-${orderId}`).first()).toBeVisible();
    expect(await seriousViolations(page), "my orders").toEqual([]);
    await page.goto(`/orders/${orderId}`);
    await expect(page.getByRole("heading", { name: `Order #${orderId}` })).toBeVisible();
    expect(await seriousViolations(page), "order detail").toEqual([]);
  });

  test("TEST-A11Y-03 operator: queue, menu items, sales", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await expect(page.getByTestId(`order-${orderId}`)).toBeVisible();
    expect(await seriousViolations(page), "queue").toEqual([]);
    await page.goto("/operator/menu");
    await expect(page.getByRole("heading", { name: "Menu items" })).toBeVisible();
    expect(await seriousViolations(page), "menu items").toEqual([]);
    await page.goto("/operator/sales");
    await expect(page.getByRole("heading", { name: /Sales/ }).first()).toBeVisible();
    expect(await seriousViolations(page), "sales").toEqual([]);
  });
});

test.describe("NFR-09 keyboard: dialogs", () => {
  let orderId: number;
  test.beforeEach(async () => {
    await clearOrders();
    orderId = (await makeOrder("alice@cafe.test", [["Latte", 2]], "PLACED")).id;
  });

  test("TEST-A11Y-04 cancel dialog: Escape closes it and focus returns to the Cancel order button", async ({ page }) => {
    await loginAs(page, "alice@cafe.test");
    await page.goto(`/orders/${orderId}`);
    const opener = page.getByRole("button", { name: "Cancel order" });
    await opener.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Keep order" })).toBeFocused(); // safe button first
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test("TEST-A11Y-05 reject dialog: Tab stays inside the dialog, Escape returns focus to Reject", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    const row = page.getByTestId(`order-${orderId}`);
    const opener = row.getByRole("button", { name: "Reject" });
    await opener.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((d) => d.contains(document.activeElement)), `Tab press ${i + 1} left the dialog`).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
});

test.describe("UAT findings", () => {
  test("TEST-A11Y-06 #130 opening Cart on a phone moves keyboard focus into the cart", async ({ page }, info) => {
    test.skip(info.project.name !== "phone", "the cart is its own view only on a phone");
    await loginAs(page, "alice@cafe.test");
    await page.getByRole("button", { name: "Add Latte" }).click();
    await page.getByRole("link", { name: /^Cart/ }).click();
    await expect(page.getByRole("region", { name: "Cart" })).toBeVisible();
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest('section[aria-label="Cart"]'))).toBe(true);
  });

  test("TEST-A11Y-07 #131 login field errors are linked to their inputs and announced", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Log in" }).click();
    const email = page.getByLabel("Email");
    const password = page.getByLabel("Password");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    for (const [input, text] of [[email, "Email is required."], [password, "Password is required."]] as const) {
      const id = await input.getAttribute("aria-describedby");
      expect(id, "aria-describedby").toBeTruthy();
      await expect(page.locator(`[id="${id}"]`)).toHaveText(text);
    }
    await expect(page.getByRole("alert").filter({ hasText: "Email is required." })).toHaveCount(1);
  });

  test("TEST-A11Y-08 #133 the email error clears when the email is corrected", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("alice@");
    await page.getByLabel("Password").fill("x");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Enter a valid email.")).toBeVisible();
    await page.getByLabel("Email").fill("alice@cafe.test");
    await page.keyboard.press("Tab");
    await expect(page.getByText("Enter a valid email.")).toHaveCount(0);
    await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "false");
  });
});
