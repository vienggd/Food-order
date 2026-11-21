import { execSync } from "node:child_process";

// Once per test run: bring the test database up to the latest migration (never deletes data).
export default function setup() {
  process.loadEnvFile?.(".env");
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is not set in server/.env");
  assertLocalTestDb(url);
  execSync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: url }, stdio: "inherit" });
}

// Tests empty tables, so only allow a local database whose name ends in _test.
export function assertLocalTestDb(url: string) {
  const u = new URL(url);
  if (!["localhost", "127.0.0.1"].includes(u.hostname) || !u.pathname.endsWith("_test")) {
    throw new Error(`Refusing to run tests against ${u.hostname}${u.pathname}: use a local *_test database.`);
  }
}
