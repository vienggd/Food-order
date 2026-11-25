import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

// F-08 simulated payment. Test IDs follow docs/sprint_2/sprints/F-08-payment.md.
// Orders in special states are inserted directly, so these tests do not wait for F-06 or F-07 code.
const PASS = "test-only-pass"; // test database only
const app = createApp();

let staff: string, alice: string, bob: string;
const loginCookie = async (email: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
};

async function makeOrder(email: string, status: OrderStatus = "PLACED", paymentStatus: PaymentStatus = "UNPAID") {
  const customer = await prisma.user.findUniqueOrThrow({ where: { email } });
  const latte = await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
  return prisma.order.create({
    data: {
      customerId: customer.id,
      status,
      paymentStatus,
      paidAt: paymentStatus === "PAID" ? new Date(Date.now() - 60_000) : null,
      total: latte.price * 2,
      lines: { create: [{ menuItemId: latte.id, name: latte.name, unitPrice: latte.price, quantity: 2 }] },
    },
  });
}

const pay = (id: number | string, cookie = alice, body: object = {}) =>
  request(app).post(`/api/orders/${id}/pay`).set("Cookie", cookie).send(body);
const row = (id: number) => prisma.order.findUniqueOrThrow({ where: { id } });

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
  staff = await loginCookie("staff@cafe.test");
  alice = await loginCookie("alice@cafe.test");
  bob = await loginCookie("bob@cafe.test");
});
afterAll(() => prisma.$disconnect());

describe("F-08 pay own order", () => {
  it("TEST-8.1 pays a PLACED order: PAID, paidAt set, order status unchanged", async () => {
    const o = await makeOrder("alice@cafe.test");
    const res = await pay(o.id);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: o.id, status: "PLACED", paymentStatus: "PAID" });
    expect(res.body.paidAt).toBeTruthy();
    const r = await row(o.id);
    expect(r.paymentStatus).toBe("PAID");
    expect(r.status).toBe("PLACED");
    expect(r.paidAt).not.toBeNull();
  });

  it("TEST-8.2 a newly placed order is UNPAID in the response and in the list", async () => {
    const latte = await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
    const placed = await request(app).post("/api/orders").set("Cookie", alice).send({ items: [{ menuItemId: latte.id, quantity: 1 }] });
    expect(placed.status).toBe(201);
    expect(placed.body.paymentStatus).toBe("UNPAID");
    const list = await request(app).get("/api/orders").set("Cookie", alice);
    expect(list.body[0].paymentStatus).toBe("UNPAID");
  });

  it("TEST-8.3 pays ACCEPTED, PREPARING and READY orders", async () => {
    for (const status of ["ACCEPTED", "PREPARING", "READY"] as const) {
      const o = await makeOrder("alice@cafe.test", status);
      expect((await pay(o.id)).status).toBe(200);
    }
  });

  it("TEST-8.4 refuses CANCELLED, REJECTED and PICKED_UP orders with 409", async () => {
    for (const status of ["CANCELLED", "REJECTED", "PICKED_UP"] as const) {
      const o = await makeOrder("alice@cafe.test", status);
      const res = await pay(o.id);
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("INVALID_STATE");
      const r = await row(o.id);
      expect(r.paymentStatus).toBe("UNPAID");
      expect(r.status).toBe(status);
    }
  });

  it("TEST-8.5 paying twice gives 409 and keeps the first paidAt", async () => {
    const o = await makeOrder("alice@cafe.test", "PLACED", "PAID");
    const before = (await row(o.id)).paidAt;
    const res = await pay(o.id);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe("This order is already paid.");
    expect((await row(o.id)).paidAt).toEqual(before);
  });

  it("TEST-8.6 ten parallel pays: exactly one 200, nine 409", async () => {
    const o = await makeOrder("alice@cafe.test");
    const results = await Promise.all(Array.from({ length: 10 }, () => pay(o.id)));
    const codes = results.map((r) => r.status);
    expect(codes.filter((c) => c === 200)).toHaveLength(1);
    expect(codes.filter((c) => c === 409)).toHaveLength(9);
    expect((await row(o.id)).paymentStatus).toBe("PAID");
  });

  it("TEST-8.7 another customer's order and a missing order both give 404", async () => {
    const o = await makeOrder("alice@cafe.test");
    const other = await pay(o.id, bob);
    const missing = await pay(999999, bob);
    expect(other.status).toBe(404);
    expect(missing.status).toBe(404);
    expect(other.body).toEqual(missing.body);
    expect((await row(o.id)).paymentStatus).toBe("UNPAID");
  });

  it("TEST-8.8 a bad id is 400, never 500", async () => {
    expect((await pay("abc")).status).toBe(400);
    expect((await pay(3000000000)).status).toBe(400);
  });

  it("TEST-8.9 anonymous gets 401 and staff gets 403; order unchanged", async () => {
    const o = await makeOrder("alice@cafe.test");
    expect((await request(app).post(`/api/orders/${o.id}/pay`)).status).toBe(401);
    expect((await pay(o.id, staff)).status).toBe(403);
    expect((await row(o.id)).paymentStatus).toBe("UNPAID");
  });

  it("TEST-8.10 an amount in the body is ignored", async () => {
    const o = await makeOrder("alice@cafe.test");
    const res = await pay(o.id, alice, { amount: 1 });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(o.total);
  });

  it("order JSON and the order list show the payment fields", async () => {
    const o = await makeOrder("alice@cafe.test", "ACCEPTED", "PAID");
    const one = await request(app).get(`/api/orders/${o.id}`).set("Cookie", alice);
    expect(one.body).toMatchObject({ paymentStatus: "PAID", refundedAt: null });
    expect(one.body.paidAt).toBeTruthy();
    const list = await request(app).get("/api/orders").set("Cookie", alice);
    expect(list.body[0].paymentStatus).toBe("PAID");
  });
});
