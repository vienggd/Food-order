import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

// F-05 menu management. Test IDs follow docs/sprint_2/sprints/F-05-menu-management.md.
const PASS = "test-only-pass"; // test database only
const app = createApp();

let staff: string, alice: string;
const loginCookie = async (email: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
};

const list = (cookie = staff) => request(app).get("/api/operator/menu").set("Cookie", cookie);
const add = (body: unknown, cookie = staff) => request(app).post("/api/operator/menu").set("Cookie", cookie).send(body as object);
const patch = (id: number | string, body: unknown, cookie = staff) =>
  request(app).patch(`/api/operator/menu/${id}`).set("Cookie", cookie).send(body as object);
const latte = () => prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
const countItems = () => prisma.menuItem.count();
const placeOrder = (menuItemId: number) =>
  request(app).post("/api/orders").set("Cookie", alice).send({ items: [{ menuItemId, quantity: 1 }] });

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
  staff = await loginCookie("staff@cafe.test");
  alice = await loginCookie("alice@cafe.test");
});
afterAll(() => prisma.$disconnect());

describe("F-05 operator menu API", () => {
  it("TEST-5.1 lists every item including sold-out ones", async () => {
    const l = await latte();
    await prisma.menuItem.update({ where: { id: l.id }, data: { isAvailable: false } });
    const res = await list();
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(await countItems());
    expect(res.body.find((i: { name: string }) => i.name === "Latte").isAvailable).toBe(false);
  });

  it("TEST-5.2 adds an item that customers then see", async () => {
    const res = await add({ name: "Mocha", price: 6500 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "Mocha", price: 6500, isAvailable: true });
    const menu = await request(app).get("/api/menu").set("Cookie", alice);
    expect(menu.body.some((i: { name: string }) => i.name === "Mocha")).toBe(true);
  });

  it("TEST-5.3 refuses an empty, blank or 61-character name", async () => {
    const before = await countItems();
    for (const name of ["", "   ", "x".repeat(61)]) {
      const res = await add({ name, price: 5000 });
      expect(res.status).toBe(400);
      expect(res.body.error.details.field).toBe("name");
    }
    expect(await countItems()).toBe(before);
  });

  it("TEST-5.4 accepts names of 1 and 60 characters", async () => {
    expect((await add({ name: "A", price: 5000 })).status).toBe(201);
    expect((await add({ name: "y".repeat(60), price: 5000 })).status).toBe(201);
  });

  it("TEST-5.5 refuses a duplicate name on POST and PATCH, ignoring case", async () => {
    expect((await add({ name: "latte", price: 5000 })).status).toBe(400);
    const other = await prisma.menuItem.findFirstOrThrow({ where: { NOT: { name: "Latte" } } });
    const res = await patch(other.id, { name: "Latte" });
    expect(res.status).toBe(400);
    expect(res.body.error.details.field).toBe("name");
    expect((await prisma.menuItem.findUniqueOrThrow({ where: { id: other.id } })).name).toBe(other.name);
  });

  it("TEST-5.6 refuses prices 0, -1, 100001, 55.5 and a string", async () => {
    const before = await countItems();
    for (const price of [0, -1, 100001, 55.5, "55"]) {
      const res = await add({ name: `P${String(price)}`, price });
      expect(res.status).toBe(400);
      expect(res.body.error.details.field).toBe("price");
    }
    expect(await countItems()).toBe(before);
  });

  it("TEST-5.7 accepts prices 1 and 100000", async () => {
    expect((await add({ name: "Cheap", price: 1 })).status).toBe(201);
    expect((await add({ name: "Dear", price: 100000 })).status).toBe(201);
  });

  it("TEST-5.8 a sold-out item is refused in a new order", async () => {
    const l = await latte();
    expect((await patch(l.id, { isAvailable: false })).status).toBe(200);
    const res = await placeOrder(l.id);
    expect(res.status).toBe(400);
  });

  it("TEST-5.9 putting the item back makes it orderable again", async () => {
    const l = await latte();
    await patch(l.id, { isAvailable: false });
    expect((await patch(l.id, { isAvailable: true })).status).toBe(200);
    expect((await placeOrder(l.id)).status).toBe(201);
  });

  it("TEST-5.10 an old order keeps its price after a price edit (BR-05, BR-10)", async () => {
    const l = await latte();
    const first = await placeOrder(l.id);
    expect(first.status).toBe(201);
    expect((await patch(l.id, { price: 17000 })).status).toBe(200);
    const old = await request(app).get(`/api/orders/${first.body.id}`).set("Cookie", alice);
    expect(old.body.lines[0].unitPrice).toBe(l.price);
    expect(old.body.total).toBe(l.price);
    const next = await placeOrder(l.id);
    expect(next.body.lines[0].unitPrice).toBe(17000);
  });

  it("TEST-5.11 PATCH with a bad body or id is 400, never 500", async () => {
    const l = await latte();
    expect((await patch(l.id, {})).status).toBe(400);
    expect((await patch(l.id, { foo: 1 })).status).toBe(400);
    expect((await patch("abc", { price: 100 })).status).toBe(400);
    expect((await patch(3000000000, { price: 100 })).status).toBe(400);
  });

  it("TEST-5.12 PATCH of a missing item is 404", async () => {
    const res = await patch(999999, { price: 100 });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("TEST-5.13 customers get 403, anonymous gets 401, data unchanged", async () => {
    const l = await latte();
    const before = await countItems();
    for (const cookie of [alice, ""]) {
      const want = cookie ? 403 : 401;
      expect((await list(cookie)).status).toBe(want);
      expect((await add({ name: "Nope", price: 100 }, cookie)).status).toBe(want);
      expect((await patch(l.id, { price: 1 }, cookie)).status).toBe(want);
    }
    expect(await countItems()).toBe(before);
    expect((await latte()).price).toBe(l.price);
  });

  it("TEST-5.14 seeding again keeps an operator's price edit", async () => {
    const l = await latte();
    await patch(l.id, { price: 17000 });
    await seed(prisma, PASS);
    expect((await latte()).price).toBe(17000);
  });
});
