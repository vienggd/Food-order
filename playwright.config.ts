import { defineConfig, devices } from "@playwright/test";

// End-to-end tests (Issue #10). Own database and ports, so dev data and dev servers are untouched.
export const E2E_DATABASE_URL = "postgresql://cafe:cafe@localhost:5433/cafe_e2e";
const env = { DATABASE_URL: E2E_DATABASE_URL, PORT: "3100", API_PORT: "3100" };

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  workers: 1, // one shared database
  use: { baseURL: "http://localhost:5174", trace: "retain-on-failure" },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } } },
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: [
    { command: "npm run dev -w server", url: "http://localhost:3100/api/health", env, reuseExistingServer: false },
    { command: "npm run dev -w client -- --port 5174 --strictPort", url: "http://localhost:5174", env, reuseExistingServer: false },
  ],
});
