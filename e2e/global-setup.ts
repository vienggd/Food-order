import { execSync } from "node:child_process";
import { E2E_DATABASE_URL } from "../playwright.config";
import { assertLocalE2eDb, db } from "./db";

// Once per run: migrate the E2E database (never deletes data), empty it, seed it.
export default async function setup() {
  process.loadEnvFile("server/.env"); // SEED_PASSWORD for the seed and for logging in
  assertLocalE2eDb(E2E_DATABASE_URL);
  const env = { ...process.env, DATABASE_URL: E2E_DATABASE_URL };
  execSync("npx prisma migrate deploy", { cwd: "server", env, stdio: "inherit" });
  await db.$executeRawUnsafe('TRUNCATE "order_lines", "orders", "sessions", "menu_items", "users" RESTART IDENTITY CASCADE');
  execSync("npx tsx prisma/seed.ts", { cwd: "server", env, stdio: "inherit" });
  await db.$disconnect();
}
