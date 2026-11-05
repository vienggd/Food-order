import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import type { OrderStatus } from "@prisma/client";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

const PASS = "test-only-pass"; // test database only
const app = createApp();

let staff: string, alice: string;
const loginCookie = async (email: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
};

// Orders are inserted directly so F-04 does not depend on F-03 code.
async function makeOrder(email: string, status: OrderStatus, createdAt = new Date()) {
  const customer = await prisma.user.findUniqueOrThrow({ where: { email } });
  const latte = await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
  return prisma.order.create({
    data: {
      customerId: customer.id,
      status,
      createdAt,
      total: latte.price * 2,
      lines: { create: [{ menuItemId: latte.id, name: latte.name, unitPrice: latte.price, quantity: 2 }] },
    },
  });
}

const queue = (cookie = staff) => request(app).get("/api/operator/orders?status=PLACED").set("Cookie", cookie);
const accept = (id: number | string, cookie = staff) => request(app).post(`/api/operator/orders/${id}/accept`).set("Cookie", cookie);
const statusOf = async (id: number) => (await prisma.order.findUniqueOrThrow({ where: { id } })).status;

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
  staff = await loginCookie("staff@cafe.test");
  alice = await loginCookie("alice@cafe.test");
});
afterAll(() => prisma.$disconnect());

describe("F-04 operator queue", () => {
  it("TEST-F04-01 shows only PLACED orders, oldest first, with customer, lines and total", async () => {
    const newer = await makeOrder("alice@cafe.test", "PLACED", new Date("2026-11-07T03:10:00Z"));
    const older = await makeOrder("bob@cafe.test", "PLACED", new Date("2026-11-07T03:00:00Z"));
    await makeOrder("alice@cafe.test", "ACCEPTED");

    const res = await queue();
    expect(res.status).toBe(200);
    expect(res.body.map((o: { id: number }) => o.id)).toEqual([older.id, newer.id]);
    expect(res.body[0]).toMatchObject({
      status: "PLACED",
      total: 13000,
      createdAt: "2026-11-07T03:00:00.000Z",
      acceptedAt: null,
      customer: { name: "Bob" },
      lines: [{ name: "Latte", unitPrice: 6500, quantity: 2, lineTotal: 13000 }],
    });
  });

  it("TEST-F04-02 includes every customer's orders", async () => {
    await makeOrder("alice@cafe.test", "PLACED");
    await makeOrder("bob@cafe.test", "PLACED");
    const names = (await queue()).body.map((o: { customer: { name: string } }) => o.customer.name).sort();
    expect(names).toEqual(["Alice", "Bob"]);
  });

  it("TEST-F04-03 an unsupported status filter is a 400", async () => {
    for (const s of ["ACCEPTED", "nonsense"]) {
      const res = await request(app).get(`/api/operator/orders?status=${s}`).set("Cookie", staff);
      expect(res.status, s).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    }
  });
});

describe("F-04 accept", () => {
  it("TEST-F04-04 accepting a PLACED order saves ACCEPTED and removes it from the queue", async () => {
    const o = await makeOrder("alice@cafe.test", "PLACED");
    const res = await accept(o.id);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: o.id, status: "ACCEPTED" });
    expect(Date.parse(res.body.acceptedAt)).not.toBeNaN();
    expect(await statusOf(o.id)).toBe("ACCEPTED");
    expect((await queue()).body).toEqual([]);
  });

  it("TEST-F04-05 BR-06 accepting an ACCEPTED order is a 409 and changes nothing", async () => {
    const o = await makeOrder("alice@cafe.test", "PLACED");
    await accept(o.id);
    const before = await prisma.order.findUniqueOrThrow({ where: { id: o.id } });
    const res = await accept(o.id);
    expect(res.status).toBe(409);
    expect(res.body.error).toEqual({ code: "INVALID_STATE", message: "Already accepted by another staff member.", details: { status: "ACCEPTED" } });
    expect(await prisma.order.findUniqueOrThrow({ where: { id: o.id } })).toEqual(before);
  });

  it("TEST-F04-06 BR-06 accepting a CANCELLED order is a 409 and it stays CANCELLED", async () => {
    const o = await makeOrder("alice@cafe.test", "CANCELLED");
    const res = await accept(o.id);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: "INVALID_STATE", message: "Only PLACED orders can be accepted.", details: { status: "CANCELLED" } });
    expect(await statusOf(o.id)).toBe("CANCELLED");
  });

  it("TEST-F04-07 BR-07 twenty accepts at the same time: exactly one succeeds", async () => {
    const o = await makeOrder("alice@cafe.test", "PLACED");
    const results = await Promise.all(Array.from({ length: 20 }, () => accept(o.id)));
    const codes = results.map((r) => r.status).sort();
    expect(codes.filter((c) => c === 200)).toHaveLength(1);
    expect(codes.filter((c) => c === 409)).toHaveLength(19);
    expect(await statusOf(o.id)).toBe("ACCEPTED");
  });

  it("TEST-F04-08 missing order is 404, malformed id is 400", async () => {
    const missing = await accept(999999);
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("NOT_FOUND");
    const bad = await accept("abc");
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("TEST-F04-14 an id above 2147483647 gives 400, not 500", async () => {
    const res = await accept(3000000000);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("TEST-F04-09 customers get 403 and anonymous users 401 on both endpoints; order unchanged", async () => {
    const o = await makeOrder("alice@cafe.test", "PLACED");
    expect((await queue(alice)).status).toBe(403);
    expect((await accept(o.id, alice)).status).toBe(403);
    expect((await request(app).get("/api/operator/orders")).status).toBe(401);
    expect((await request(app).post(`/api/operator/orders/${o.id}/accept`)).status).toBe(401);
    expect(await statusOf(o.id)).toBe("PLACED");
  });
});
