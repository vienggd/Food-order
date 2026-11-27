import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

// F-10 sales summary. Test IDs follow docs/sprint_2/sprints/F-10-sales-summary.md.
// Orders are inserted directly with the picked-up time we need. Bangkok is UTC+7.
const PASS = "test-only-pass"; // test database only
const app = createApp();

let staff: string, alice: string;
const loginCookie = async (email: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
};

type Opts = { status?: OrderStatus; paymentStatus?: PaymentStatus };
async function makeSale(items: [string, number][], pickedUpAt: string, opts: Opts = {}) {
  const customer = await prisma.user.findUniqueOrThrow({ where: { email: "alice@cafe.test" } });
  const menu = await prisma.menuItem.findMany({ where: { name: { in: items.map(([n]) => n) } } });
  const lines = items.map(([name, quantity]) => {
    const m = menu.find((x) => x.name === name)!;
    return { menuItemId: m.id, name: m.name, unitPrice: m.price, quantity };
  });
  const total = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  return prisma.order.create({
    data: {
      customerId: customer.id,
      status: opts.status ?? "PICKED_UP",
      paymentStatus: opts.paymentStatus ?? "PAID",
      pickedUpAt: new Date(pickedUpAt),
      total,
      lines: { create: lines },
    },
  });
}

const sales = (q = "from=2026-11-01&to=2026-11-30", cookie = staff) => request(app).get(`/api/operator/sales?${q}`).set("Cookie", cookie);

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
  staff = await loginCookie("staff@cafe.test");
  alice = await loginCookie("alice@cafe.test");
});
afterAll(() => prisma.$disconnect());

describe("F-10 sales summary", () => {
  it("TEST-10.1 one row per day with the right count and total, newest day first", async () => {
    await makeSale([["Latte", 2]], "2026-11-10T05:00:00Z"); // 13000
    await makeSale([["Americano", 1]], "2026-11-10T06:00:00Z"); // 5500
    await makeSale([["Thai Milk Tea", 3]], "2026-11-12T05:00:00Z"); // 15000
    const res = await sales();
    expect(res.status).toBe(200);
    expect(res.body.days).toEqual([
      { date: "2026-11-12", orderCount: 1, salesTotal: 15000 },
      { date: "2026-11-10", orderCount: 2, salesTotal: 18500 },
    ]);
  });

  it("TEST-10.2 cancelled, rejected, unpaid, refunded and open orders are not counted", async () => {
    await makeSale([["Latte", 1]], "2026-11-10T05:00:00Z", { status: "CANCELLED", paymentStatus: "REFUNDED" });
    await makeSale([["Latte", 1]], "2026-11-10T05:00:00Z", { status: "REJECTED", paymentStatus: "UNPAID" });
    await makeSale([["Latte", 1]], "2026-11-10T05:00:00Z", { status: "READY", paymentStatus: "UNPAID" });
    await makeSale([["Latte", 1]], "2026-11-10T05:00:00Z", { status: "READY", paymentStatus: "PAID" });
    await makeSale([["Latte", 1]], "2026-11-10T05:00:00Z", { status: "PICKED_UP", paymentStatus: "REFUNDED" });
    const res = await sales();
    expect(res.body.days).toEqual([]);
    expect(res.body.topItems).toEqual([]);
  });

  it("TEST-10.3 Bangkok day boundaries: 23:30 and 00:30 local fall on different days", async () => {
    await makeSale([["Latte", 1]], "2026-11-10T16:30:00Z"); // 23:30 on 10 Nov in Bangkok
    await makeSale([["Latte", 1]], "2026-11-10T17:30:00Z"); // 00:30 on 11 Nov in Bangkok
    const res = await sales();
    expect(res.body.days.map((d: { date: string }) => d.date)).toEqual(["2026-11-11", "2026-11-10"]);
  });

  it("TEST-10.4 top 3 items by quantity, ties broken by name", async () => {
    await makeSale([["Latte", 5], ["Croissant", 3], ["Americano", 3], ["Thai Milk Tea", 1]], "2026-11-10T05:00:00Z");
    const res = await sales();
    expect(res.body.topItems.map((i: { name: string; quantity: number }) => [i.name, i.quantity])).toEqual([
      ["Latte", 5],
      ["Americano", 3],
      ["Croissant", 3],
    ]);
    expect(res.body.topItems[0]).toHaveProperty("menuItemId");
  });

  it("TEST-10.5 a price edit after the sale does not change past sales", async () => {
    await makeSale([["Latte", 2]], "2026-11-10T05:00:00Z");
    const latte = await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
    const edit = await request(app).patch(`/api/operator/menu/${latte.id}`).set("Cookie", staff).send({ price: 17000 });
    expect(edit.status).toBe(200);
    const res = await sales();
    expect(res.body.days[0].salesTotal).toBe(13000);
  });

  it("TEST-10.6 bad dates, from after to, and a range over 92 days are 400", async () => {
    for (const q of ["from=abc&to=2026-11-30", "from=2026-11-30&to=2026-11-01", "from=2026-02-30&to=2026-03-05", "from=2026-01-01&to=2026-06-01"]) {
      const res = await sales(q);
      expect(res.status, q).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    }
    expect((await sales("from=2026-09-01&to=2026-11-30")).status).toBe(200); // 91 days inclusive, inside the limit
  });

  it("TEST-10.7 no sales in range gives 200 with empty lists", async () => {
    const res = await sales();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ days: [], topItems: [] });
  });

  it("TEST-10.8 customers get 403 and anonymous gets 401", async () => {
    expect((await sales(undefined, alice)).status).toBe(403);
    expect((await sales(undefined, "")).status).toBe(401);
  });

  it("without from and to it uses the last 7 days including today", async () => {
    const res = await request(app).get("/api/operator/sales").set("Cookie", staff);
    expect(res.status).toBe(200);
    expect(res.body.from <= res.body.to).toBe(true);
    const days = (Date.parse(res.body.to) - Date.parse(res.body.from)) / 86_400_000;
    expect(days).toBe(6);
  });
});
