import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { OrderStatus } from "@prisma/client";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

// F-11 operator search. Test IDs follow docs/sprint_2/sprints/F-11-search-filter.md.
const PASS = "test-only-pass"; // test database only
const app = createApp();

let staff: string, alice: string;
const loginCookie = async (email: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
};

async function makeOrder(email: string, status: OrderStatus, createdAt: Date, id?: number) {
  const customer = await prisma.user.findUniqueOrThrow({ where: { email } });
  const latte = await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
  return prisma.order.create({
    data: { ...(id ? { id } : {}), customerId: customer.id, status, createdAt, total: latte.price, lines: { create: [{ menuItemId: latte.id, name: latte.name, unitPrice: latte.price, quantity: 1 }] } },
  });
}
const search = (query: string, cookie = staff) => request(app).get(`/api/operator/orders${query}`).set("Cookie", cookie);
const ids = (res: { body: { id: number }[] }) => res.body.map((o) => o.id);
const t = (min: number) => new Date(Date.UTC(2026, 10, 7, 3, min));

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
  staff = await loginCookie("staff@cafe.test");
  alice = await loginCookie("alice@cafe.test");
});
afterAll(() => prisma.$disconnect());

describe("F-11 operator search (BR-26, BR-27)", () => {
  const seedNumbers = async () => {
    await makeOrder("alice@cafe.test", "PLACED", t(0), 12);
    await makeOrder("bob@cafe.test", "PLACED", t(1), 13);
    await makeOrder("alice@cafe.test", "PLACED", t(2), 120);
  };

  it("TEST-F11-07 an order number matches that order exactly (12 does not match 120)", async () => {
    await seedNumbers();
    expect(ids(await search("?q=12"))).toEqual([12]);
  });

  it("TEST-F11-08 a leading # is ignored", async () => {
    await seedNumbers();
    expect(ids(await search("?q=%23120"))).toEqual([120]);
  });

  it("TEST-F11-09 part of a customer name matches, ignoring upper and lower case", async () => {
    await seedNumbers();
    expect(ids(await search("?q=ALI"))).toEqual([12, 120]);
    expect(ids(await search("?q=ali"))).toEqual([12, 120]);
  });

  it("TEST-F11-10 q and status combine with AND", async () => {
    await makeOrder("alice@cafe.test", "READY", t(0));
    await makeOrder("alice@cafe.test", "PLACED", t(1));
    const bobReady = await makeOrder("bob@cafe.test", "READY", t(2));
    const res = await search("?q=ali&status=READY");
    expect(ids(res)).toHaveLength(1);
    expect(ids(res)).not.toContain(bobReady.id);
    expect(res.body[0]).toMatchObject({ status: "READY", customer: { name: "Alice" } });
  });

  it("TEST-F11-11 all 7 statuses are valid filters; junk is 400", async () => {
    const made: Record<string, number> = {};
    for (const [i, status] of Object.values(OrderStatus).entries()) made[status] = (await makeOrder("alice@cafe.test", status, t(i))).id;
    expect(ids(await search("?status=PICKED_UP"))).toEqual([made.PICKED_UP]);
    expect(ids(await search("?status=REJECTED,CANCELLED"))).toEqual([made.REJECTED, made.CANCELLED]);
    const bad = await search("?status=nonsense");
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("TEST-F11-12 blank q and a too long q are 400; a percent sign is plain text", async () => {
    await seedNumbers();
    for (const q of ["", "%20%20", "x".repeat(61)]) {
      const res = await search(`?q=${q}`);
      expect(res.status, q).toBe(400);
      expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", details: { field: "q" } });
    }
    const pct = await search("?q=%25");
    expect(pct.status).toBe(200);
    expect(pct.body).toEqual([]);
  });

  it("TEST-F11-13 a q of 60 characters with no match is 200 and empty", async () => {
    await seedNumbers();
    const res = await search(`?q=${"x".repeat(60)}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("TEST-F11-14 at most 200 orders are returned, oldest first", async () => {
    const customer = await prisma.user.findUniqueOrThrow({ where: { email: "alice@cafe.test" } });
    await prisma.order.createMany({
      data: Array.from({ length: 201 }, (_, i) => ({ customerId: customer.id, status: "PLACED" as const, total: 100, createdAt: new Date(Date.UTC(2026, 10, 7, 0, 0, i)) })),
    });
    const res = await search("?q=ali");
    expect(res.body).toHaveLength(200);
    const first = await prisma.order.findFirstOrThrow({ orderBy: { createdAt: "asc" } });
    const newest = await prisma.order.findFirstOrThrow({ orderBy: { createdAt: "desc" } });
    expect(res.body[0].id).toBe(first.id);
    expect(ids(res)).not.toContain(newest.id);
  });

  it("TEST-F11-15 customer gets 403, anonymous gets 401", async () => {
    expect((await search("?q=ali", alice)).status).toBe(403);
    expect((await request(app).get("/api/operator/orders?q=ali")).status).toBe(401);
  });
});
