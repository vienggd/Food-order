import { defineConfig } from "@playwright/test";

// End-to-end tests (Issue #10). Starts API + client, then drives a real browser.
export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:5173" },
  webServer: { command: "npm run dev", url: "http://localhost:5173", reuseExistingServer: true },
});
