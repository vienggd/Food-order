import { describe, it, expect, afterAll, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe("seed", () => {
  it("AC-1.3 stops with a clear message when SEED_PASSWORD is missing", async () => {
    await expect(seed(prisma, "")).rejects.toThrow(/SEED_PASSWORD is not set/);
  });

  it("AC-1.2 creates 2 customers, 1 operator (bcrypt hash) and exactly one sold-out item; running twice adds nothing", async () => {
    await seed(prisma, "test-only-pass");
    await seed(prisma, "test-only-pass");

    const users = await prisma.user.findMany({ orderBy: { email: "asc" } });
    expect(users.map((u) => [u.email, u.role])).toEqual([
      ["alice@cafe.test", "CUSTOMER"],
      ["bob@cafe.test", "CUSTOMER"],
      ["staff@cafe.test", "OPERATOR"],
    ]);
    expect(users[0].passwordHash).not.toBe("test-only-pass");
    expect(await bcrypt.compare("test-only-pass", users[0].passwordHash)).toBe(true);

    const menu = await prisma.menuItem.findMany();
    expect(menu.length).toBeGreaterThan(1);
    expect(menu.filter((m) => !m.isAvailable)).toHaveLength(1);
    expect(menu.every((m) => Number.isInteger(m.price) && m.price > 0)).toBe(true);
  });

  it("Lab 5 #63 rerunning the seed (every deploy) keeps an operator's price and sold-out changes", async () => {
    await seed(prisma, "test-only-pass", "");
    await prisma.menuItem.update({ where: { name: "Latte" }, data: { price: 7000, isAvailable: false } });
    await seed(prisma, "test-only-pass", "");
    const latte = await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
    expect([latte.price, latte.isAvailable]).toEqual([7000, false]);
  });

  it("Lab 5 #63 adds the smoke-test customer only when a smoke password is given", async () => {
    await seed(prisma, "test-only-pass", "");
    expect(await prisma.user.findUnique({ where: { email: "smoke@cafe.test" } })).toBeNull();
    await seed(prisma, "test-only-pass", "smoke-only-pass");
    const smoke = await prisma.user.findUniqueOrThrow({ where: { email: "smoke@cafe.test" } });
    expect(smoke.role).toBe("CUSTOMER");
    expect(await bcrypt.compare("smoke-only-pass", smoke.passwordHash)).toBe(true);
  });
});
