import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import type { OrderStatus } from "@prisma/client";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

// F-11 customer filter. Test IDs follow docs/sprint_2/sprints/F-11-search-filter.md (operator search comes later).
const PASS = "test-only-pass"; // test database only
const app = createApp();

let alice: string;
const loginCookie = async (email: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
};

async function makeOrder(email: string, status: OrderStatus, createdAt: Date) {
  const customer = await prisma.user.findUniqueOrThrow({ where: { email } });
  const latte = await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
  return prisma.order.create({
    data: { customerId: customer.id, status, createdAt, total: latte.price, lines: { create: [{ menuItemId: latte.id, name: latte.name, unitPrice: latte.price, quantity: 1 }] } },
  });
}
const mine = (query = "") => request(app).get(`/api/orders${query}`).set("Cookie", alice);
const ids = (res: { body: { id: number }[] }) => res.body.map((o) => o.id);
const t = (min: number) => new Date(Date.UTC(2026, 10, 7, 3, min));

let placed: number, ready: number, cancelled: number;
beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
  alice = await loginCookie("alice@cafe.test");
  placed = (await makeOrder("alice@cafe.test", "PLACED", t(0))).id;
  ready = (await makeOrder("alice@cafe.test", "READY", t(1))).id;
  cancelled = (await makeOrder("alice@cafe.test", "CANCELLED", t(2))).id;
});
afterAll(() => prisma.$disconnect());

describe("F-11 customer status filter (BR-25, BR-27)", () => {
  it("TEST-F11-01 one status returns only those orders", async () => {
    expect(ids(await mine("?status=READY"))).toEqual([ready]);
  });

  it("TEST-F11-02 a list of statuses returns those orders, newest first", async () => {
    expect(ids(await mine("?status=PLACED,CANCELLED"))).toEqual([cancelled, placed]);
  });

  it("TEST-F11-03 no status returns all own orders (Sprint 1 behaviour)", async () => {
    expect(ids(await mine())).toEqual([cancelled, ready, placed]);
  });

  it("TEST-F11-04 another customer's orders never appear, whatever the filter", async () => {
    const bobs = (await makeOrder("bob@cafe.test", "READY", t(3))).id;
    const res = await mine("?status=READY");
    expect(ids(res)).toEqual([ready]);
    expect(ids(await mine())).not.toContain(bobs);
  });

  it("TEST-F11-05 bad status values are 400 with details.field = status", async () => {
    for (const s of ["nonsense", "placed", "", "PLACED,,READY"]) {
      const res = await mine(`?status=${s}`);
      expect(res.status, s).toBe(400);
      expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", details: { field: "status" } });
    }
  });

  it("TEST-F11-06 a status with no orders is 200 with an empty list", async () => {
    const res = await mine("?status=PICKED_UP");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
