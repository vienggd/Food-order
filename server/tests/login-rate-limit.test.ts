import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { seed } from "../prisma/seed.js";
import { resetDb } from "./helpers.js";

// F-12 login rate limit (NFR-08, BR-20, BR-21). Test IDs follow docs/sprint_2/sprints/F-12-hardening.md.
const PASS = "test-only-pass"; // test database only
const app = createApp();

const login = (email: string, password: string) => request(app).post("/api/auth/login").send({ email, password });
const bad = (email: string, times: number) => Promise.all(Array.from({ length: times }, () => login(email, "wrong")));
const failuresOf = (email: string) => prisma.loginFailure.count({ where: { email } });

beforeEach(async () => {
  await resetDb();
  await seed(prisma, PASS);
});
afterAll(() => prisma.$disconnect());

describe("F-12 login rate limit", () => {
  it("TEST-12.1 four wrong passwords are 401 and the fifth attempt with the right password still works", async () => {
    for (let i = 0; i < 4; i++) expect((await login("alice@cafe.test", "wrong")).status).toBe(401);
    expect((await login("alice@cafe.test", PASS)).status).toBe(200);
  });

  it("TEST-12.2 after five wrong passwords even the right password gets 429 with Retry-After and no cookie", async () => {
    for (let i = 0; i < 5; i++) expect((await login("alice@cafe.test", "wrong")).status).toBe(401);
    const res = await login("alice@cafe.test", PASS);
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("RATE_LIMITED");
    expect(res.body.error.message).toMatch(/^Too many failed logins\. Try again in \d+ minutes?\.$/);
    expect(res.body.error.details.retryAfterSeconds).toBeGreaterThan(0);
    expect(res.body.error.details.retryAfterSeconds).toBeLessThanOrEqual(900);
    expect(Number(res.headers["retry-after"])).toBe(res.body.error.details.retryAfterSeconds);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("TEST-12.3 a locked email does not lock another email", async () => {
    for (let i = 0; i < 5; i++) await login("alice@cafe.test", "wrong");
    expect((await login("alice@cafe.test", PASS)).status).toBe(429);
    expect((await login("bob@cafe.test", PASS)).status).toBe(200);
  });

  it("TEST-12.4 the lock ends 15 minutes after the fifth failure", async () => {
    for (let i = 0; i < 5; i++) await login("alice@cafe.test", "wrong");
    expect((await login("alice@cafe.test", PASS)).status).toBe(429);
    await prisma.loginFailure.updateMany({ where: { email: "alice@cafe.test" }, data: { createdAt: new Date(Date.now() - 15 * 60_000 - 1000) } });
    expect((await login("alice@cafe.test", PASS)).status).toBe(200);
  });

  it("TEST-12.5 a successful login clears the count (BR-20)", async () => {
    await bad("alice@cafe.test", 4);
    expect((await login("alice@cafe.test", PASS)).status).toBe(200);
    expect(await failuresOf("alice@cafe.test")).toBe(0);
    await bad("alice@cafe.test", 4);
    expect((await login("alice@cafe.test", PASS)).status).toBe(200);
  });

  it("TEST-12.6 an unknown email is counted too, so 429 does not reveal whether an account exists", async () => {
    for (let i = 0; i < 5; i++) expect((await login("nobody@cafe.test", "wrong")).status).toBe(401);
    expect((await login("nobody@cafe.test", "wrong")).status).toBe(429);
  });

  it("TEST-12.7 email letter case does not matter (BR-21)", async () => {
    const forms = ["Alice@cafe.test", "ALICE@cafe.test", "alice@CAFE.test", "alice@cafe.test", "aLiCe@cafe.test"];
    for (const e of forms) expect((await login(e, "wrong")).status).toBe(401);
    expect((await login("alice@cafe.test", PASS)).status).toBe(429);
    expect(await failuresOf("alice@cafe.test")).toBe(5);
  });
});
