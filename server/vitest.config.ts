import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Tests share one real Postgres test database, so run files one at a time.
    fileParallelism: false,
    globalSetup: ["tests/global-setup.ts"],
    setupFiles: ["tests/env.ts"],
  },
});
