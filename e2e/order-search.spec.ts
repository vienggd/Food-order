import { test, expect, type Page } from "@playwright/test";
import { clearOrders, makeOrder } from "./db";
import { loginAs as signIn } from "./helpers";

// F-11 operator search UI. Test IDs follow docs/sprint_2/sprints/F-11-search-filter.md. Orders are inserted directly.
async function loginAs(page: Page, email: string) {
  await signIn(page, email);
  await expect(page).not.toHaveURL(/\/login/);
}

test.describe("F-11 operator search", () => {
  let aliceReady: number, alicePlaced: number, bobReady: number;

  test.beforeEach(async () => {
    await clearOrders();
    const t = (min: number) => new Date(Date.now() - min * 60_000);
    aliceReady = (await makeOrder("alice@cafe.test", [["Latte", 1]], "READY", t(6))).id;
    alicePlaced = (await makeOrder("alice@cafe.test", [["Latte", 1]], "PLACED", t(4))).id;
    bobReady = (await makeOrder("bob@cafe.test", [["Latte", 1]], "READY", t(2))).id;
  });

  test("TEST-F11-17 search by name and status shows matching cards; Clear brings the queue back", async ({ page }) => {
    await loginAs(page, "staff@cafe.test");
    await expect(page.getByTestId(`order-${alicePlaced}`)).toBeVisible();
    await page.getByLabel("Order number or customer name").fill("ali");
    await page.getByLabel("Status").selectOption("READY");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.getByTestId(`order-${aliceReady}`)).toBeVisible();
    await expect(page.getByTestId(/^order-/)).toHaveCount(1);
    await expect(page.getByTestId(`order-${bobReady}`)).toHaveCount(0);

    await page.getByLabel("Order number or customer name").fill("zzz");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.getByText("No orders match your search.")).toBeVisible();

    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByTestId(`order-${alicePlaced}`)).toBeVisible();
    await expect(page.getByLabel("Order number or customer name")).toHaveValue("");
  });
});
