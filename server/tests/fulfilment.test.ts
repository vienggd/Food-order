import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { OrderStatus } from "@prisma/client";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { canTransition, nextStep } from "../src/orders/transitions.js";
import { resetDb } from "./helpers.js";

// F-07 fulfilment. Test IDs follow docs/sprint_2/sprints/F-07-fulfilment.md.
// Orders in every status are inserted directly; orders that become PICKED_UP are seeded as PAID (BR-15 is F-08 work).
const PASS = "test-only-pass"; // test database only
const app = createApp();

let staff: string, alice: string;
const loginCookie = async (email: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
};

async function makeOrder(email: string, status: OrderStatus, createdAt = new Date()) {
  const customer = await prisma.user.findUniqueOrThrow({ where: { email } });
  const latte = await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
  return prisma.order.create({
    data: {
      customerId: customer.id,
      status,
      createdAt,
      paymentStatus: "PAID",
      paidAt: new Date(),
      total: latte.price * 2,
      lines: { create: [{ menuItemId: latte.id, name: latte.name, unitPrice: latte.price, quantity: 2 }] },
    },
  });
}

const advance = (id: number | string, body: unknown, cookie?: string) => {
  const r = request(app).post(`/api/operator/orders/${id}/advance`).send(body as object);
  return cookie ? r.set("Cookie", cookie) : r;
};
const queue = (query: string, cookie = staff) => request(app).get(`/api/operator/orders${query}`).set("Cookie", cookie);
const row = (id: number) => prisma.order.findUniqueOrThrow({ where: { id } });
const OPEN = "PLACED,ACCEPTED,PREPARING,READY";

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
  staff = await loginCookie("staff@cafe.test");
  alice = await loginCookie("alice@cafe.test");
});
afterAll(() => prisma.$disconnect());

describe("F-07 advance (BR-13)", () => {
  it("TEST-F07-01 ACCEPTED -> PREPARING sets preparingAt", async () => {
    const o = await makeOrder("alice@cafe.test", "ACCEPTED");
    const res = await advance(o.id, { from: "ACCEPTED" }, staff);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "PREPARING" });
    expect(res.body.preparingAt).toEqual(expect.any(String));
    expect((await row(o.id)).status).toBe("PREPARING");
  });

  it("TEST-F07-02 PREPARING -> READY sets readyAt", async () => {
    const o = await makeOrder("alice@cafe.test", "PREPARING");
    const res = await advance(o.id, { from: "PREPARING" }, staff);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "READY" });
    expect(res.body.readyAt).toEqual(expect.any(String));
  });

  it("TEST-F07-03 READY -> PICKED_UP sets pickedUpAt and the order leaves the queue", async () => {
    const o = await makeOrder("alice@cafe.test", "READY");
    const res = await advance(o.id, { from: "READY" }, staff);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "PICKED_UP" });
    expect(res.body.pickedUpAt).toEqual(expect.any(String));
    expect((await queue(`?status=${OPEN}`)).body).toEqual([]);
  });

  it("TEST-F07-04 one order walks all three steps, each a separate 200, times set in order", async () => {
    const o = await makeOrder("alice@cafe.test", "ACCEPTED");
    for (const from of ["ACCEPTED", "PREPARING", "READY"]) expect((await advance(o.id, { from }, staff)).status).toBe(200);
    const r = await row(o.id);
    expect(r.status).toBe("PICKED_UP");
    expect(r.preparingAt!.getTime()).toBeLessThanOrEqual(r.readyAt!.getTime());
    expect(r.readyAt!.getTime()).toBeLessThanOrEqual(r.pickedUpAt!.getTime());
  });

  it("TEST-F07-05 PLACED, REJECTED and CANCELLED orders cannot move (409)", async () => {
    for (const status of ["PLACED", "REJECTED", "CANCELLED"] as const) {
      const o = await makeOrder("alice@cafe.test", status);
      const res = await advance(o.id, { from: "ACCEPTED" }, staff);
      expect(res.status, status).toBe(409);
      expect(res.body.error).toMatchObject({ code: "INVALID_STATE", message: `Order #${o.id} is ${status}, so it can't be moved to the next step.` });
      expect((await row(o.id)).status).toBe(status);
    }
  });

  it("TEST-F07-06 a PICKED_UP order cannot move again (409)", async () => {
    const o = await makeOrder("alice@cafe.test", "PICKED_UP");
    const res = await advance(o.id, { from: "READY" }, staff);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe(`Order #${o.id} is already PICKED_UP. Another staff member moved it.`);
    expect((await row(o.id)).status).toBe("PICKED_UP");
  });

  it("TEST-F07-07 no skipping: wrong or invalid `from` is refused and the order stays", async () => {
    const o = await makeOrder("alice@cafe.test", "ACCEPTED");
    expect((await advance(o.id, { from: "READY" }, staff)).status).toBe(409);
    for (const body of [{ from: "PLACED" }, { from: "PICKED_UP" }, { from: "nonsense" }, {}, { from: 5 }]) {
      const res = await advance(o.id, body, staff);
      expect(res.status, JSON.stringify(body)).toBe(400);
      expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", details: { field: "from" } });
    }
    expect((await row(o.id)).status).toBe("ACCEPTED");
  });

  it("TEST-F07-08 a stale second press does not move the order two steps", async () => {
    const o = await makeOrder("alice@cafe.test", "PREPARING");
    const res = await advance(o.id, { from: "ACCEPTED" }, staff);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe(`Order #${o.id} is already PREPARING. Another staff member moved it.`);
    const r = await row(o.id);
    expect([r.status, r.readyAt]).toEqual(["PREPARING", null]);
  });

  it("TEST-F07-09 20 parallel advances of one step: exactly one 200", async () => {
    const o = await makeOrder("alice@cafe.test", "ACCEPTED");
    const results = await Promise.all(Array.from({ length: 20 }, () => advance(o.id, { from: "ACCEPTED" }, staff)));
    const codes = results.map((r) => r.status);
    expect(codes.filter((c) => c === 200)).toHaveLength(1);
    expect(codes.filter((c) => c === 409)).toHaveLength(19);
    expect((await row(o.id)).status).toBe("PREPARING");
  });

  it("TEST-F07-10 unknown id is 404, bad ids are 400", async () => {
    expect((await advance(999999, { from: "ACCEPTED" }, staff)).status).toBe(404);
    expect((await advance("abc", { from: "ACCEPTED" }, staff)).status).toBe(400);
    expect((await advance(3000000000, { from: "ACCEPTED" }, staff)).status).toBe(400);
  });

  it("TEST-F07-11 customer gets 403, anonymous gets 401", async () => {
    const o = await makeOrder("alice@cafe.test", "ACCEPTED");
    expect((await advance(o.id, { from: "ACCEPTED" }, alice)).status).toBe(403);
    expect((await advance(o.id, { from: "ACCEPTED" })).status).toBe(401);
    expect((await row(o.id)).status).toBe("ACCEPTED");
  });

  it("TEST-F07-14 the customer sees the new step and its time", async () => {
    const o = await makeOrder("alice@cafe.test", "ACCEPTED");
    await advance(o.id, { from: "ACCEPTED" }, staff);
    const res = await request(app).get(`/api/orders/${o.id}`).set("Cookie", alice);
    expect(res.body).toMatchObject({ status: "PREPARING" });
    expect(res.body.preparingAt).toEqual(expect.any(String));
  });
});

describe("F-07 queue status list", () => {
  const seedAll = async () => {
    const t = (min: number) => new Date(Date.UTC(2026, 10, 7, 3, min));
    const ids: Record<string, number> = {};
    const plan: [OrderStatus, string, number][] = [
      ["READY", "alice@cafe.test", 0], ["PLACED", "bob@cafe.test", 1], ["PREPARING", "alice@cafe.test", 2], ["ACCEPTED", "bob@cafe.test", 3],
      ["PICKED_UP", "alice@cafe.test", 4], ["REJECTED", "bob@cafe.test", 5], ["CANCELLED", "alice@cafe.test", 6],
    ];
    for (const [status, email, min] of plan) ids[status] = (await makeOrder(email, status, t(min))).id;
    return ids;
  };

  it("TEST-F07-12 one call returns the four open statuses, oldest first, with customer and lines", async () => {
    const ids = await seedAll();
    const res = await queue(`?status=${OPEN}`);
    expect(res.status).toBe(200);
    expect(res.body.map((o: { id: number }) => o.id)).toEqual([ids.READY, ids.PLACED, ids.PREPARING, ids.ACCEPTED]);
    expect(res.body[0]).toMatchObject({ customer: { name: "Alice" }, lines: [{ name: "Latte", quantity: 2 }] });
  });

  it("TEST-F07-13 status values: missing and PLACED give PLACED only; READY gives READY; junk is 400 (closed statuses are valid since F-11)", async () => {
    const ids = await seedAll();
    expect((await queue("")).body.map((o: { id: number }) => o.id)).toEqual([ids.PLACED]);
    expect((await queue("?status=PLACED")).body.map((o: { id: number }) => o.id)).toEqual([ids.PLACED]);
    expect((await queue("?status=READY")).body.map((o: { id: number }) => o.id)).toEqual([ids.READY]);
    for (const s of ["nonsense", "", "PLACED,,READY"]) {
      const res = await queue(`?status=${s}`);
      expect(res.status, s).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    }
  });
});

describe("F-07 status transitions", () => {
  it("TEST-F07-15 only the chain ACCEPTED -> PREPARING -> READY -> PICKED_UP is added; nextStep follows it", () => {
    const all = Object.values(OrderStatus);
    const allowed: string[] = [];
    for (const from of all) for (const to of all) if (canTransition(from, to)) allowed.push(`${from}->${to}`);
    expect(allowed.sort()).toEqual([
      "ACCEPTED->PREPARING", "PLACED->ACCEPTED", "PLACED->CANCELLED", "PLACED->REJECTED", "PREPARING->READY", "READY->PICKED_UP",
    ]);
    expect(canTransition("ACCEPTED", "READY")).toBe(false);
    expect(canTransition("READY", "PREPARING")).toBe(false);
    expect(all.map((s) => nextStep(s))).toEqual(all.map((s) => ({ ACCEPTED: "PREPARING", PREPARING: "READY", READY: "PICKED_UP" } as Record<string, string>)[s] ?? null));
  });
});
