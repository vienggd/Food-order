import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

const PASS = "test-only-pass"; // test database only
const app = createApp();
let alice: string, bob: string, staff: string;
let menu: Record<string, number>; // name -> id

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
  [alice, bob, staff] = await Promise.all(["alice@cafe.test", "bob@cafe.test", "staff@cafe.test"].map(cookieFor));
  menu = Object.fromEntries((await prisma.menuItem.findMany()).map((m) => [m.name, m.id]));
});
afterAll(() => prisma.$disconnect());

async function cookieFor(email: string) {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
}
const place = (cookie: string | null, body: unknown) => {
  const r = request(app).post("/api/orders").send(body as object);
  return cookie ? r.set("Cookie", cookie) : r;
};
const get = (cookie: string | null, path: string) => {
  const r = request(app).get(path);
  return cookie ? r.set("Cookie", cookie) : r;
};
const counts = async () => ({ orders: await prisma.order.count(), lines: await prisma.orderLine.count() });
const expectNothingSaved = async () => expect(await counts()).toEqual({ orders: 0, lines: 0 });

async function addAvailableItems(n: number) {
  for (let i = 1; i <= n; i++) await prisma.menuItem.create({ data: { name: `Extra ${i}`, price: 1000 + i } });
  return (await prisma.menuItem.findMany({ where: { isAvailable: true }, orderBy: { id: "asc" } })).map((m) => m.id);
}

describe("F-03 POST /api/orders", () => {
  it("TEST-F03-01 places an order: 201 PLACED, server total, lines with copied name and price, saved", async () => {
    const res = await place(alice, { items: [{ menuItemId: menu["Latte"], quantity: 2 }, { menuItemId: menu["Thai Milk Tea"], quantity: 1 }] });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(Number), status: "PLACED", total: 18000, acceptedAt: null });
    expect(res.body.lines).toEqual([
      { menuItemId: menu["Latte"], name: "Latte", unitPrice: 6500, quantity: 2, lineTotal: 13000 },
      { menuItemId: menu["Thai Milk Tea"], name: "Thai Milk Tea", unitPrice: 5000, quantity: 1, lineTotal: 5000 },
    ]);
    const saved = await prisma.order.findUniqueOrThrow({ where: { id: res.body.id }, include: { lines: true, customer: true } });
    expect(saved.customer.email).toBe("alice@cafe.test");
    expect(saved.total).toBe(18000);
    expect(saved.lines).toHaveLength(2);
  });

  it("TEST-F03-02 BR-01 boundary: quantity 1 and 10 are accepted", async () => {
    const res = await place(alice, { items: [{ menuItemId: menu["Latte"], quantity: 1 }, { menuItemId: menu["Americano"], quantity: 10 }] });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(6500 + 55000);
  });

  it.each([0, 11, 1.5, -1, "2", null])("TEST-F03-03 BR-01 quantity %s is rejected with 400 and nothing saved", async (quantity) => {
    const res = await place(alice, { items: [{ menuItemId: menu["Latte"], quantity }] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    await expectNothingSaved();
  });

  it.each([[{ items: [] }], [{}], [{ items: "Latte" }]])("TEST-F03-04 BR-02 empty or missing items %j: 400, nothing saved", async (body) => {
    const res = await place(alice, body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    await expectNothingSaved();
  });

  it("TEST-F03-05 BR-02 boundary: 20 different lines are accepted", async () => {
    const ids = (await addAvailableItems(15)).slice(0, 20);
    const res = await place(alice, { items: ids.map((menuItemId) => ({ menuItemId, quantity: 1 })) });
    expect(res.status).toBe(201);
    expect(res.body.lines).toHaveLength(20);
  });

  it("TEST-F03-06 BR-02 21 lines: 400, nothing saved", async () => {
    const ids = (await addAvailableItems(16)).slice(0, 21);
    expect(ids).toHaveLength(21);
    const res = await place(alice, { items: ids.map((menuItemId) => ({ menuItemId, quantity: 1 })) });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    await expectNothingSaved();
  });

  it("TEST-F03-07 BR-02 the same item twice: 400 DUPLICATE, nothing saved", async () => {
    const res = await place(alice, { items: [{ menuItemId: menu["Latte"], quantity: 1 }, { menuItemId: menu["Latte"], quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.items).toEqual([{ menuItemId: menu["Latte"], reason: "DUPLICATE" }]);
    await expectNothingSaved();
  });

  it("TEST-F03-08 BR-03 a sold-out item rejects the whole order: 400 SOLD_OUT naming it, nothing saved", async () => {
    const res = await place(alice, { items: [{ menuItemId: menu["Latte"], quantity: 1 }, { menuItemId: menu["Croissant"], quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toContain("Croissant");
    expect(res.body.error.details.items).toEqual([{ menuItemId: menu["Croissant"], reason: "SOLD_OUT" }]);
    await expectNothingSaved();
  });

  it("TEST-F03-09 BR-03 an unknown item: 400 NOT_FOUND reason, nothing saved", async () => {
    const res = await place(alice, { items: [{ menuItemId: 9999, quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.items).toEqual([{ menuItemId: 9999, reason: "NOT_FOUND" }]);
    await expectNothingSaved();
  });

  it.each([
    ["price on a line", (id: number) => ({ items: [{ menuItemId: id, quantity: 1, price: 1 }] })],
    ["unitPrice on a line", (id: number) => ({ items: [{ menuItemId: id, quantity: 1, unitPrice: 1 }] })],
    ["total at top level", (id: number) => ({ items: [{ menuItemId: id, quantity: 1 }], total: 1 })],
  ])("TEST-F03-10 BR-04 client sends %s: 400, nothing saved", async (_name, body) => {
    const res = await place(alice, body(menu["Latte"]));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    await expectNothingSaved();
  });
});

describe("F-03 GET /api/orders and /api/orders/:id", () => {
  it("TEST-F03-11 BR-05 order keeps name and price from order time after the menu changes", async () => {
    const placed = await place(alice, { items: [{ menuItemId: menu["Latte"], quantity: 1 }] });
    await prisma.menuItem.update({ where: { id: menu["Latte"] }, data: { name: "Latte XL", price: 9900 } });
    const res = await get(alice, `/api/orders/${placed.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.lines[0]).toMatchObject({ name: "Latte", unitPrice: 6500, lineTotal: 6500 });
    expect(res.body.total).toBe(6500);
  });

  it("TEST-F03-12 list shows only my orders, newest first, with item count", async () => {
    const first = await place(alice, { items: [{ menuItemId: menu["Latte"], quantity: 2 }] });
    await place(bob, { items: [{ menuItemId: menu["Americano"], quantity: 1 }] });
    const second = await place(alice, { items: [{ menuItemId: menu["Latte"], quantity: 1 }, { menuItemId: menu["Americano"], quantity: 3 }] });
    const res = await get(alice, "/api/orders");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: second.body.id, status: "PLACED", total: 6500 + 16500, itemCount: 4, createdAt: second.body.createdAt },
      { id: first.body.id, status: "PLACED", total: 13000, itemCount: 2, createdAt: first.body.createdAt },
    ]);
  });

  it("TEST-F03-13 my own order detail: 200 with lines and total", async () => {
    const placed = await place(alice, { items: [{ menuItemId: menu["Latte"], quantity: 2 }] });
    const res = await get(alice, `/api/orders/${placed.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(placed.body);
  });

  it("TEST-F03-14 another customer's order and a missing id both give the same 404", async () => {
    const bobs = await place(bob, { items: [{ menuItemId: menu["Latte"], quantity: 1 }] });
    const other = await get(alice, `/api/orders/${bobs.body.id}`);
    const missing = await get(alice, "/api/orders/99999");
    for (const res of [other, missing]) {
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Order not found.", details: null } });
    }
  });

  it.each(["abc", "0", "-1", "1.5"])("TEST-F03-21 malformed id %s: 400 VALIDATION_ERROR", async (id) => {
    const res = await get(alice, `/api/orders/${id}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("F-03 id range", () => {
  it("TEST-F03-22 ids above 2147483647 give 400, not 500, and nothing is saved", async () => {
    const detail = await get(alice, "/api/orders/3000000000");
    expect(detail.status).toBe(400);
    expect(detail.body.error.code).toBe("VALIDATION_ERROR");
    const placed = await place(alice, { items: [{ menuItemId: 3000000000, quantity: 1 }] });
    expect(placed.status).toBe(400);
    expect(placed.body.error.code).toBe("VALIDATION_ERROR");
    await expectNothingSaved();
  });
});

describe("F-03 access", () => {
  it("TEST-F03-15 not logged in: all F-03 endpoints give 401", async () => {
    for (const res of [
      await place(null, { items: [{ menuItemId: menu["Latte"], quantity: 1 }] }),
      await get(null, "/api/orders"),
      await get(null, "/api/orders/1"),
    ]) {
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHENTICATED");
    }
    await expectNothingSaved();
  });

  it("TEST-F03-16 operator: all F-03 endpoints give 403, nothing saved", async () => {
    for (const res of [
      await place(staff, { items: [{ menuItemId: menu["Latte"], quantity: 1 }] }),
      await get(staff, "/api/orders"),
      await get(staff, "/api/orders/1"),
    ]) {
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    }
    await expectNothingSaved();
  });
});
