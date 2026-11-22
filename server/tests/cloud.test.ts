import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import request from "supertest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";

afterAll(() => prisma.$disconnect());
afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.CLIENT_DIST;
});

describe("Lab 5 #63 readiness", () => {
  it("GET /api/ready returns 200 { status: ready, db: connected } when the database answers", async () => {
    const res = await request(createApp()).get("/api/ready");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ready", db: "connected" });
  });

  it("GET /api/ready returns 503 { status: not_ready } when the database cannot be reached", async () => {
    vi.spyOn(prisma, "$queryRaw").mockRejectedValueOnce(new Error("db down"));
    const res = await request(createApp()).get("/api/ready");
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "not_ready" });
  });
});

describe("Lab 5 #63 serves the built React app (one container)", () => {
  function fakeDist() {
    const dir = mkdtempSync(join(tmpdir(), "client-dist-"));
    writeFileSync(join(dir, "index.html"), "<!doctype html><title>Campus Cafe</title>");
    writeFileSync(join(dir, "app.js"), "console.log(1)");
    process.env.CLIENT_DIST = dir;
    return dir;
  }

  it("serves index.html at /, static files, and index.html for app routes like /menu", async () => {
    const dir = fakeDist();
    const app = createApp();
    const home = await request(app).get("/");
    expect(home.status).toBe(200);
    expect(home.text).toContain("Campus Cafe");
    expect((await request(app).get("/app.js")).text).toContain("console.log");
    const route = await request(app).get("/menu");
    expect(route.status).toBe(200);
    expect(route.headers["content-type"]).toMatch(/html/);
    rmSync(dir, { recursive: true });
  });

  it("unknown /api routes still return the JSON 404, not index.html", async () => {
    const dir = fakeDist();
    const res = await request(createApp()).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
    rmSync(dir, { recursive: true });
  });
});
