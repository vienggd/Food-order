import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { requireRole } from "../src/auth/middleware.js";
import { sessionCookieOptions, SESSION_MS } from "../src/auth/session.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

const PASS = "test-only-pass"; // test database only
const app = createApp((a) => a.get("/api/test/operator-only", requireRole("OPERATOR"), (_req, res) => res.json({ ok: true })));

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
});
afterAll(() => prisma.$disconnect());

const login = (email: string, password = PASS) => request(app).post("/api/auth/login").send({ email, password });
const cookieOf = (res: request.Response) => (res.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
const sessionCount = () => prisma.session.count();

describe("F-01 login / logout / me", () => {
  it("TEST-F01-01 valid login returns the user, sets a safe cookie and stores an 8 h session", async () => {
    const before = Date.now();
    const res = await login("alice@cafe.test");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: expect.any(Number), name: "Alice", role: "CUSTOMER" });

    const cookie = (res.headers["set-cookie"] as unknown as string[])[0];
    expect(cookie).toMatch(/^sid=[A-Za-z0-9_-]{40,};/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Max-Age=28800/);

    const sessions = await prisma.session.findMany({ include: { user: true } });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].user.email).toBe("alice@cafe.test");
    expect(Math.abs(sessions[0].expiresAt.getTime() - (before + SESSION_MS))).toBeLessThan(60_000);
  });

  it("TEST-F01-02 wrong password: 401, no cookie, no session", async () => {
    const res = await login("alice@cafe.test", "wrong");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: { code: "UNAUTHENTICATED", message: "Incorrect email or password.", details: null } });
    expect(res.headers["set-cookie"]).toBeUndefined();
    expect(await sessionCount()).toBe(0);
  });

  it("TEST-F01-03 unknown email gives exactly the same answer as a wrong password", async () => {
    const wrongPass = await login("alice@cafe.test", "wrong");
    const unknown = await login("nobody@cafe.test");
    expect(unknown.status).toBe(401);
    expect(unknown.status).toBe(wrongPass.status);
    expect(unknown.body).toEqual(wrongPass.body);
    expect(await sessionCount()).toBe(0);
  });

  it("TEST-F01-04 missing password, bad email or an extra field: 400, no session", async () => {
    const bodies = [
      { email: "alice@cafe.test" },
      { email: "not-an-email", password: PASS },
      { email: "alice@cafe.test", password: PASS, role: "OPERATOR" },
    ];
    for (const body of bodies) {
      const res = await request(app).post("/api/auth/login").send(body);
      expect(res.status, JSON.stringify(body)).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    }
    expect(await sessionCount()).toBe(0);
  });

  it("TEST-F01-05 email is case-insensitive", async () => {
    const res = await login("ALICE@CAFE.TEST");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Alice");
  });

  it("TEST-F01-06 me returns only id, name and role", async () => {
    const cookie = cookieOf(await login("staff@cafe.test"));
    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: expect.any(Number), name: "Staff", role: "OPERATOR" });
  });

  it("TEST-F01-07 me without a cookie or with a made-up sid: 401", async () => {
    for (const r of [request(app).get("/api/auth/me"), request(app).get("/api/auth/me").set("Cookie", "sid=made-up")]) {
      const res = await r;
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHENTICATED");
    }
  });

  it("TEST-F01-08 expired session: 401 and the row is deleted", async () => {
    const alice = await prisma.user.findUniqueOrThrow({ where: { email: "alice@cafe.test" } });
    await prisma.session.create({ data: { id: "expired-session-id", userId: alice.id, expiresAt: new Date(Date.now() - 1000) } });
    const res = await request(app).get("/api/auth/me").set("Cookie", "sid=expired-session-id");
    expect(res.status).toBe(401);
    expect(await prisma.session.findUnique({ where: { id: "expired-session-id" } })).toBeNull();
  });

  it("TEST-F01-09 logout ends the session; the old cookie stops working", async () => {
    const cookie = cookieOf(await login("bob@cafe.test"));
    const out = await request(app).post("/api/auth/logout").set("Cookie", cookie);
    expect(out.status).toBe(204);
    expect((out.headers["set-cookie"] as unknown as string[])[0]).toMatch(/^sid=;/);
    expect(await sessionCount()).toBe(0);
    expect((await request(app).get("/api/auth/me").set("Cookie", cookie)).status).toBe(401);
  });

  it("TEST-F01-10 requireRole: wrong role 403, no session 401, right role 200", async () => {
    const customer = cookieOf(await login("alice@cafe.test"));
    const operator = cookieOf(await login("staff@cafe.test"));
    const asCustomer = await request(app).get("/api/test/operator-only").set("Cookie", customer);
    expect(asCustomer.status).toBe(403);
    expect(asCustomer.body.error.code).toBe("FORBIDDEN");
    expect((await request(app).get("/api/test/operator-only")).status).toBe(401);
    expect((await request(app).get("/api/test/operator-only").set("Cookie", operator)).status).toBe(200);
  });

  it("TEST-F01-11 cookie is Secure only in production; always httpOnly, lax, 8 h", () => {
    expect(sessionCookieOptions(true)).toMatchObject({ secure: true, httpOnly: true, sameSite: "lax", maxAge: SESSION_MS });
    expect(sessionCookieOptions(false)).toMatchObject({ secure: false, httpOnly: true, sameSite: "lax", maxAge: SESSION_MS });
  });
});
