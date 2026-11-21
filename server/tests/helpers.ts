import { prisma } from "../src/db.js";
import { assertLocalTestDb } from "./global-setup.js";

// Empty every table in the local test database. Call in beforeEach of DB tests.
export async function resetDb() {
  assertLocalTestDb(process.env.DATABASE_URL!);
  await prisma.$executeRawUnsafe(
    'TRUNCATE "order_lines", "orders", "sessions", "menu_items", "users" RESTART IDENTITY CASCADE',
  );
}
