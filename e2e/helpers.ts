import { expect, type Page } from "@playwright/test";

process.loadEnvFile("server/.env");
const PASSWORD = process.env.SEED_PASSWORD!; // local seed password, never logged

export async function loginAs(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Log out" }).locator("visible=true").first().click();
  await expect(page).toHaveURL(/\/login$/);
}

// Screenshots for the PDF (Part F): docs/evidence/screenshots/<name>-<phone|desktop>.png
export const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `docs/evidence/screenshots/${name}-${project}.png`, fullPage: true });
