import { test, expect } from "@playwright/test";
import { loginAs, logout, shot } from "./helpers";

test.describe("F-01 login, logout, guards", () => {
  test("TEST-F01-12 customer and operator land on their home; logout ends the session", async ({ page }, info) => {
    await loginAs(page, "alice@cafe.test");
    await expect(page).toHaveURL(/\/menu$/);
    await expect(page.getByText("Alice").locator("visible=true").first()).toBeVisible();
    await shot(page, "F01-customer-home", info.project.name);

    await logout(page);
    await page.goto("/menu");
    await expect(page).toHaveURL(/\/login$/);

    await loginAs(page, "staff@cafe.test");
    await expect(page).toHaveURL(/\/operator\/orders$/);
    await expect(page.getByText("Staff").locator("visible=true").first()).toBeVisible();
  });

  test("TEST-F01-13 wrong password shows the message, clears the password, keeps the email", async ({ page }, info) => {
    await loginAs(page, "alice@cafe.test", "definitely-wrong");
    await expect(page.getByRole("alert")).toHaveText("Incorrect email or password.");
    await expect(page.getByLabel("Password")).toHaveValue("");
    await expect(page.getByLabel("Email")).toHaveValue("alice@cafe.test");
    await shot(page, "F01-login-wrong-password", info.project.name);
  });

  test("TEST-F01-14 guards: logged out -> /login; customer on operator page -> own home with notice", async ({ page }, info) => {
    await page.goto("/menu");
    await expect(page).toHaveURL(/\/login$/);

    await loginAs(page, "alice@cafe.test");
    await expect(page).toHaveURL(/\/menu$/);
    await page.goto("/operator/orders");
    await expect(page).toHaveURL(/\/menu$/);
    await expect(page.getByText("You don't have access to that page.")).toBeVisible();
    await shot(page, "F01-forbidden-redirect", info.project.name);
  });
});
