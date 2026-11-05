import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

const PASS = "test-only-pass"; // test database only
const app = createApp();

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
});
afterAll(() => prisma.$disconnect());

async function cookieFor(email: string) {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
}
const getMenu = (cookie?: string) => {
  const r = request(app).get("/api/menu");
  return cookie ? r.set("Cookie", cookie) : r;
};

describe("F-02 GET /api/menu", () => {
  it("TEST-F02-01 customer gets every item with id, name, integer price and isAvailable, ordered by id", async () => {
    const res = await getMenu(await cookieFor("alice@cafe.test"));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(6);
    const ids = res.body.map((m: { id: number }) => m.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
    for (const item of res.body) {
      expect(Object.keys(item).sort()).toEqual(["id", "isAvailable", "name", "price"]);
      expect(Number.isInteger(item.price) && item.price > 0).toBe(true);
    }
    expect(res.body.find((m: { name: string }) => m.name === "Latte").price).toBe(6500);
  });

  it("TEST-F02-02 sold-out item is still listed with isAvailable false", async () => {
    const res = await getMenu(await cookieFor("alice@cafe.test"));
    const soldOut = res.body.filter((m: { isAvailable: boolean }) => !m.isAvailable);
    expect(soldOut.map((m: { name: string }) => m.name)).toEqual(["Croissant"]);
    expect(res.body.filter((m: { isAvailable: boolean }) => m.isAvailable)).toHaveLength(5);
  });

  it("TEST-F02-03 no session cookie: 401 UNAUTHENTICATED in the shared error shape", async () => {
    const res = await getMenu();
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
    expect(typeof res.body.error.message).toBe("string");
  });

  it("TEST-F02-04 expired session: 401 UNAUTHENTICATED", async () => {
    const cookie = await cookieFor("alice@cafe.test");
    await prisma.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    const res = await getMenu(cookie);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("TEST-F02-05 operator: 403 FORBIDDEN", async () => {
    const res = await getMenu(await cookieFor("staff@cafe.test"));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("TEST-F02-06 empty menu: 200 with []", async () => {
    await prisma.menuItem.deleteMany();
    const res = await getMenu(await cookieFor("alice@cafe.test"));
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
