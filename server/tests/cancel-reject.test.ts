import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { OrderStatus } from "@prisma/client";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { canTransition } from "../src/orders/transitions.js";
import { resetDb } from "./helpers.js";

// F-06 cancel and reject. Test IDs follow docs/sprint_2/sprints/F-06-cancel-reject.md.
// Orders in every status are inserted directly, so these tests do not depend on F-07 code.
const PASS = "test-only-pass"; // test database only
const app = createApp();

let staff: string, alice: string, bob: string;
const loginCookie = async (email: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
};

async function makeOrder(email: string, status: OrderStatus = "PLACED", extra: { rejectReason?: string } = {}) {
  const customer = await prisma.user.findUniqueOrThrow({ where: { email } });
  const latte = await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
  return prisma.order.create({
    data: {
      customerId: customer.id,
      status,
      ...extra,
      total: latte.price * 2,
      lines: { create: [{ menuItemId: latte.id, name: latte.name, unitPrice: latte.price, quantity: 2 }] },
    },
  });
}

const cancel = (id: number | string, cookie?: string) => {
  const r = request(app).post(`/api/orders/${id}/cancel`);
  return cookie ? r.set("Cookie", cookie) : r;
};
const reject = (id: number | string, body: unknown, cookie?: string) => {
  const r = request(app).post(`/api/operator/orders/${id}/reject`).send(body as object);
  return cookie ? r.set("Cookie", cookie) : r;
};
const accept = (id: number) => request(app).post(`/api/operator/orders/${id}/accept`).set("Cookie", staff);
const row = (id: number) => prisma.order.findUniqueOrThrow({ where: { id } });

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
  staff = await loginCookie("staff@cafe.test");
  alice = await loginCookie("alice@cafe.test");
  bob = await loginCookie("bob@cafe.test");
});
afterAll(() => prisma.$disconnect());

describe("F-06 customer cancel (BR-11)", () => {
  it("TEST-F06-01 cancels own PLACED order and it leaves the queue", async () => {
    const o = await makeOrder("alice@cafe.test");
    const res = await cancel(o.id, alice);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: o.id, status: "CANCELLED" });
    expect(res.body.cancelledAt).toEqual(expect.any(String));
    expect((await row(o.id)).status).toBe("CANCELLED");
    const queue = await request(app).get("/api/operator/orders?status=PLACED").set("Cookie", staff);
    expect(queue.body).toEqual([]);
  });

  it("TEST-F06-02 refuses after the café accepted it (409)", async () => {
    for (const status of ["ACCEPTED", "PREPARING", "READY", "PICKED_UP"] as const) {
      const o = await makeOrder("alice@cafe.test", status);
      const res = await cancel(o.id, alice);
      expect(res.status, status).toBe(409);
      expect(res.body.error).toMatchObject({ code: "INVALID_STATE", message: "This order was already accepted, so it can't be cancelled." });
      expect((await row(o.id)).status).toBe(status);
    }
  });

  it("TEST-F06-03 refuses a REJECTED or CANCELLED order (409)", async () => {
    const rejected = await makeOrder("alice@cafe.test", "REJECTED");
    const cancelled = await makeOrder("alice@cafe.test", "CANCELLED");
    const a = await cancel(rejected.id, alice);
    const b = await cancel(cancelled.id, alice);
    expect([a.status, b.status]).toEqual([409, 409]);
    expect(a.body.error.message).toBe("This order was already rejected, so it can't be cancelled.");
    expect(b.body.error.message).toBe("This order is already cancelled.");
    expect((await row(rejected.id)).status).toBe("REJECTED");
  });

  it("TEST-F06-04 someone else's order looks like a missing one (404)", async () => {
    const o = await makeOrder("bob@cafe.test");
    const res = await cancel(o.id, alice);
    const missing = await cancel(999999, alice);
    expect(res.status).toBe(404);
    expect(res.body).toEqual(missing.body);
    expect((await row(o.id)).status).toBe("PLACED");
  });

  it("TEST-F06-05 unknown id is 404, bad ids are 400", async () => {
    expect((await cancel(999999, alice)).status).toBe(404);
    expect((await cancel("abc", alice)).status).toBe(400);
    expect((await cancel(3000000000, alice)).status).toBe(400);
  });

  it("TEST-F06-06 operator gets 403, anonymous gets 401", async () => {
    const o = await makeOrder("alice@cafe.test");
    expect((await cancel(o.id, staff)).status).toBe(403);
    expect((await cancel(o.id)).status).toBe(401);
    expect((await row(o.id)).status).toBe("PLACED");
  });
});

describe("F-06 operator reject (BR-12)", () => {
  it("TEST-F06-07 rejects a PLACED order with a reason and it leaves the queue", async () => {
    const o = await makeOrder("alice@cafe.test");
    const res = await reject(o.id, { reason: "Out of milk" }, staff);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "REJECTED", rejectReason: "Out of milk" });
    expect(res.body.rejectedAt).toEqual(expect.any(String));
    const r = await row(o.id);
    expect([r.status, r.rejectReason]).toEqual(["REJECTED", "Out of milk"]);
    const queue = await request(app).get("/api/operator/orders?status=PLACED").set("Cookie", staff);
    expect(queue.body).toEqual([]);
  });

  it("TEST-F06-08 reason must be 3-200 characters after trimming", async () => {
    const cases: [unknown, number][] = [
      ["ab", 400], ["abc", 200], ["x".repeat(200), 200], ["x".repeat(201), 400],
      ["   ab   ", 400], [undefined, 400], ["", 400], [123, 400],
    ];
    for (const [reason, expected] of cases) {
      const o = await makeOrder("alice@cafe.test");
      const res = await reject(o.id, reason === undefined ? {} : { reason }, staff);
      expect(res.status, String(reason)).toBe(expected);
      if (expected === 400) {
        expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", details: { field: "reason" } });
        const r = await row(o.id);
        expect([r.status, r.rejectReason]).toEqual(["PLACED", null]);
      }
    }
  });

  it("TEST-F06-09 saves the trimmed reason", async () => {
    const o = await makeOrder("alice@cafe.test");
    const res = await reject(o.id, { reason: "  Out of milk  " }, staff);
    expect(res.body.rejectReason).toBe("Out of milk");
    expect((await row(o.id)).rejectReason).toBe("Out of milk");
  });

  it("TEST-F06-10 refuses ACCEPTED, CANCELLED and REJECTED orders (409) and keeps the old reason", async () => {
    const accepted = await makeOrder("alice@cafe.test", "ACCEPTED");
    const cancelled = await makeOrder("alice@cafe.test", "CANCELLED");
    const rejected = await makeOrder("alice@cafe.test", "REJECTED", { rejectReason: "first" });
    const a = await reject(accepted.id, { reason: "second reason" }, staff);
    const c = await reject(cancelled.id, { reason: "second reason" }, staff);
    const r = await reject(rejected.id, { reason: "second reason" }, staff);
    expect([a.status, c.status, r.status]).toEqual([409, 409, 409]);
    expect(a.body.error.message).toBe(`Order #${accepted.id} was already accepted by another staff member.`);
    expect(c.body.error.message).toBe(`Order #${cancelled.id} was already cancelled by the customer.`);
    expect(r.body.error.message).toBe(`Order #${rejected.id} was already rejected.`);
    expect((await row(rejected.id)).rejectReason).toBe("first");
    expect((await row(accepted.id)).status).toBe("ACCEPTED");
  });

  it("TEST-F06-13 unknown id is 404, bad ids are 400", async () => {
    const body = { reason: "Out of milk" };
    expect((await reject(999999, body, staff)).status).toBe(404);
    expect((await reject("abc", body, staff)).status).toBe(400);
    expect((await reject(3000000000, body, staff)).status).toBe(400);
  });

  it("TEST-F06-14 customer gets 403, anonymous gets 401", async () => {
    const o = await makeOrder("alice@cafe.test");
    expect((await reject(o.id, { reason: "Out of milk" }, alice)).status).toBe(403);
    expect((await reject(o.id, { reason: "Out of milk" })).status).toBe(401);
    expect((await row(o.id)).status).toBe("PLACED");
  });

  it("TEST-F06-15 the customer sees the reason, others get 404", async () => {
    const o = await makeOrder("alice@cafe.test", "REJECTED", { rejectReason: "Out of milk" });
    const one = await request(app).get(`/api/orders/${o.id}`).set("Cookie", alice);
    expect(one.body).toMatchObject({ status: "REJECTED", rejectReason: "Out of milk" });
    expect(one.body.rejectedAt === null || typeof one.body.rejectedAt === "string").toBe(true);
    expect((await request(app).get(`/api/orders/${o.id}`).set("Cookie", bob)).status).toBe(404);
  });
});

describe("F-06 races (BR-12, NFR-04)", () => {
  it("TEST-F06-11 accept and reject together: one 200, one 409, DB matches the winner", async () => {
    for (let round = 0; round < 10; round++) {
      const o = await makeOrder("alice@cafe.test");
      const [a, r] = await Promise.all([accept(o.id), reject(o.id, { reason: "Out of milk" }, staff)]);
      expect([a.status, r.status].sort()).toEqual([200, 409]);
      expect((await row(o.id)).status).toBe(a.status === 200 ? "ACCEPTED" : "REJECTED");
    }
  });

  it("TEST-F06-12 accept and cancel together: one 200, one 409, DB matches the winner", async () => {
    for (let round = 0; round < 10; round++) {
      const o = await makeOrder("alice@cafe.test");
      const [a, c] = await Promise.all([accept(o.id), cancel(o.id, alice)]);
      expect([a.status, c.status].sort()).toEqual([200, 409]);
      expect((await row(o.id)).status).toBe(a.status === 200 ? "ACCEPTED" : "CANCELLED");
    }
  });
});

describe("F-06 status transitions", () => {
  it("TEST-F06-16 PLACED may also move to REJECTED and CANCELLED; nothing else changes", () => {
    const all = Object.values(OrderStatus);
    const allowed: string[] = [];
    for (const from of all) for (const to of all) if (canTransition(from, to)) allowed.push(`${from}->${to}`);
    expect(allowed.sort()).toEqual(["PLACED->ACCEPTED", "PLACED->CANCELLED", "PLACED->REJECTED"]);
    expect(canTransition("ACCEPTED", "CANCELLED")).toBe(false);
    expect(canTransition("REJECTED", "ACCEPTED")).toBe(false);
  });
});
