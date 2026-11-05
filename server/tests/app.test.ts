import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { AppError } from "../src/errors.js";

describe("app skeleton", () => {
  it("AC-1.4 GET /api/health returns 200 { ok: true }", async () => {
    const res = await request(createApp()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("AC-1.5 unknown /api route returns 404 NOT_FOUND in the shared error shape", async () => {
    const res = await request(createApp()).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: "NOT_FOUND" });
    expect(typeof res.body.error.message).toBe("string");
  });

  it("AC-1.5 an AppError is sent with its status, code and details", async () => {
    const app = createApp((r) =>
      r.get("/api/boom-409", () => {
        throw new AppError(409, "INVALID_STATE", "Already accepted.", { id: 1 });
      }),
    );
    const res = await request(app).get("/api/boom-409");
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: "INVALID_STATE", message: "Already accepted.", details: { id: 1 } } });
  });

  it("AC-1.5 an unexpected error returns 500 with no stack trace", async () => {
    const app = createApp((r) =>
      r.get("/api/boom", () => {
        throw new Error("secret internal detail");
      }),
    );
    const res = await request(app).get("/api/boom");
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(res.body)).not.toMatch(/secret internal detail|at .*\.ts/);
  });

  it("AC-1.5 broken JSON body returns 400 VALIDATION_ERROR", async () => {
    const app = createApp((r) => r.post("/api/echo", (req, res) => res.json(req.body)));
    const res = await request(app).post("/api/echo").set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
