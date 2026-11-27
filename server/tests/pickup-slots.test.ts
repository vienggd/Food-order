import { describe, it, expect, beforeEach, afterAll, afterEach } from "vitest";
import request from "supertest";
import type { OrderStatus } from "@prisma/client";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { clock } from "../src/orders/slots.js";
import { resetDb } from "./helpers.js";

// F-09 pickup slots and cut-off. Test IDs follow docs/sprint_2/sprints/F-09-pickup-slots.md.
// The server clock is replaced by a fixed time. Bangkok is UTC+7, so 10:30 Bangkok is 03:30Z.
const PASS = "test-only-pass"; // test database only
const app = createApp();
const realNow = clock.now;

const DAY = "2026-11-28";
const bkk = (hhmmss: string) => new Date(`${DAY}T${hhmmss}+07:00`); // a Bangkok clock time on the test day
const at = (hhmmss: string) => {
  clock.now = () => bkk(hhmmss);
};
const slot = (hhmm: string) => bkk(`${hhmm}:00`).toISOString();

let alice: string, bob: string, staff: string, latteId: number;
const loginCookie = async (email: string) => {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASS });
  return (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
};
const place = (body: Record<string, unknown> = {}, cookie = alice) =>
  request(app).post("/api/orders").set("Cookie", cookie).send({ items: [{ menuItemId: latteId, quantity: 1 }], ...body });
const slots = (cookie?: string) => {
  const r = request(app).get("/api/slots");
  return cookie ? r.set("Cookie", cookie) : r;
};
const count = (iso: string) => prisma.order.count({ where: { pickupSlot: new Date(iso) } });

async function fill(iso: string, n: number, status: OrderStatus = "PLACED") {
  const customer = await prisma.user.findUniqueOrThrow({ where: { email: "bob@cafe.test" } });
  const latte = await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } });
  const ids: number[] = [];
  for (let i = 0; i < n; i++) {
    const o = await prisma.order.create({
      data: { customerId: customer.id, status, pickupSlot: new Date(iso), total: latte.price, lines: { create: [{ menuItemId: latte.id, name: latte.name, unitPrice: latte.price, quantity: 1 }] } },
    });
    ids.push(o.id);
  }
  return ids;
}

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
  alice = await loginCookie("alice@cafe.test");
  bob = await loginCookie("bob@cafe.test");
  staff = await loginCookie("staff@cafe.test");
  latteId = (await prisma.menuItem.findUniqueOrThrow({ where: { name: "Latte" } })).id;
  at("10:00:00");
});
afterEach(() => {
  clock.now = realNow;
});
afterAll(() => prisma.$disconnect());

describe("F-09 cut-off rule (BR-23)", () => {
  it("TEST-F09-01 an order for a later slot is accepted and keeps the slot", async () => {
    const res = await place({ pickupSlot: slot("10:30") });
    expect(res.status).toBe(201);
    expect(res.body.pickupSlot).toBe(slot("10:30"));
    expect(await count(slot("10:30"))).toBe(1);
  });

  it("TEST-F09-02 one second before the cut-off is accepted", async () => {
    at("10:14:59");
    expect((await place({ pickupSlot: slot("10:30") })).status).toBe(201);
  });

  it("TEST-F09-03 exactly at the cut-off is refused (400) and nothing is saved", async () => {
    at("10:15:00");
    const res = await place({ pickupSlot: slot("10:30") });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", message: "This pickup slot is closed. Pick a later slot.", details: { field: "pickupSlot" } });
    expect(await prisma.order.count()).toBe(0);
  });

  it("TEST-F09-04 after the cut-off and after the start are refused", async () => {
    for (const t of ["10:15:01", "10:29:59", "10:30:01"]) {
      at(t);
      expect((await place({ pickupSlot: slot("10:30") })).status, t).toBe(400);
    }
    expect(await prisma.order.count()).toBe(0);
  });

  it("TEST-F09-05 anything that is not one of today's slots is refused (400)", async () => {
    at("07:00:00");
    const bad: unknown[] = [
      bkk("10:20:00").toISOString(), // not a slot start
      bkk("10:30:30").toISOString(), // seconds
      bkk("07:45:00").toISOString(), // before opening
      bkk("17:00:00").toISOString(), // at closing
      bkk("17:15:00").toISOString(), // after closing
      new Date(bkk("10:30:00").getTime() + 86_400_000).toISOString(), // tomorrow
      new Date(bkk("10:30:00").getTime() - 86_400_000).toISOString(), // yesterday
      "abc",
      123,
    ];
    for (const pickupSlot of bad) {
      const res = await place({ pickupSlot });
      expect(res.status, String(pickupSlot)).toBe(400);
      expect(res.body.error.details).toMatchObject({ field: "pickupSlot" });
    }
    expect(await prisma.order.count()).toBe(0);
  });

  it("TEST-F09-06 the first slot of the day closes at 07:45:00", async () => {
    at("07:44:59");
    expect((await place({ pickupSlot: slot("08:00") })).status).toBe(201);
    at("07:45:00");
    expect((await place({ pickupSlot: slot("08:00") })).status).toBe(400);
  });

  it("TEST-F09-07 the last slot 16:45 is accepted before its cut-off", async () => {
    at("16:29:59");
    expect((await place({ pickupSlot: slot("16:45") })).status).toBe(201);
  });
});

describe("F-09 capacity (BR-24)", () => {
  it("TEST-F09-08 the 11th order for a slot is refused (409) and nothing is saved", async () => {
    await fill(slot("10:30"), 10);
    const res = await place({ pickupSlot: slot("10:30") });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: "INVALID_STATE", message: "This pickup slot is full. Pick another slot." });
    expect(await count(slot("10:30"))).toBe(10);
  });

  it("TEST-F09-09 a cancelled or rejected order frees its place", async () => {
    const ids = await fill(slot("10:30"), 10);
    await prisma.order.update({ where: { id: ids[0] }, data: { status: "CANCELLED" } });
    expect((await place({ pickupSlot: slot("10:30") })).status).toBe(201);
    await prisma.order.update({ where: { id: ids[1] }, data: { status: "REJECTED" } });
    expect((await place({ pickupSlot: slot("10:30") }, bob)).status).toBe(201);
  });

  it("TEST-F09-10 20 parallel orders for the last place: exactly one 201", async () => {
    await fill(slot("10:30"), 9);
    const results = await Promise.all(Array.from({ length: 20 }, () => place({ pickupSlot: slot("10:30") })));
    const codes = results.map((r) => r.status);
    expect(codes.filter((c) => c === 201)).toHaveLength(1);
    expect(codes.filter((c) => c === 409)).toHaveLength(19);
    expect(await count(slot("10:30"))).toBe(10);
  });

  it("TEST-F09-11 ASAP orders (no slot or null) are accepted and count toward no slot", async () => {
    await fill(slot("10:30"), 10);
    const a = await place();
    const b = await place({ pickupSlot: null });
    expect([a.status, b.status]).toEqual([201, 201]);
    expect([a.body.pickupSlot, b.body.pickupSlot]).toEqual([null, null]);
    expect(await count(slot("10:30"))).toBe(10);
  });
});

describe("F-09 slot list", () => {
  it("TEST-F09-12 36 slots in order: closed after the cut-off (even when full), open with remaining, full", async () => {
    await fill(slot("10:30"), 10); // closed wins over full at 10:15
    await fill(slot("10:45"), 3);
    await fill(slot("11:00"), 10);
    at("10:15:00");
    const res = await slots(alice);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(36);
    expect(res.body[0].start).toBe(slot("08:00"));
    expect(res.body[35].start).toBe(slot("16:45"));
    const by = (hhmm: string) => res.body.find((s: { start: string }) => s.start === slot(hhmm));
    expect(by("10:15")).toMatchObject({ state: "closed", remaining: 0 });
    expect(by("10:30")).toMatchObject({ state: "closed", remaining: 0 });
    expect(by("10:45")).toMatchObject({ state: "open", remaining: 7 });
    expect(by("11:00")).toMatchObject({ state: "full", remaining: 0 });
    expect(by("11:15")).toMatchObject({ state: "open", remaining: 10 });
  });

  it("TEST-F09-13 operator gets 403, anonymous gets 401", async () => {
    expect((await slots(staff)).status).toBe(403);
    expect((await slots()).status).toBe(401);
  });

  it("TEST-F09-14 the order detail shows the slot, ASAP shows null", async () => {
    const withSlot = await place({ pickupSlot: slot("10:30") });
    const asap = await place();
    const a = await request(app).get(`/api/orders/${withSlot.body.id}`).set("Cookie", alice);
    const b = await request(app).get(`/api/orders/${asap.body.id}`).set("Cookie", alice);
    expect([a.body.pickupSlot, b.body.pickupSlot]).toEqual([slot("10:30"), null]);
  });
});
