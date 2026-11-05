import { randomBytes } from "node:crypto";
import { prisma } from "../db.js";

export const SESSION_COOKIE = "sid";
export const SESSION_MS = 8 * 60 * 60 * 1000; // fixed 8 h from login

export function sessionCookieOptions(production: boolean) {
  return { httpOnly: true, sameSite: "lax" as const, secure: production, maxAge: SESSION_MS, path: "/" };
}

// 32 random bytes = 256 bits; the id is the only secret the browser holds.
export async function createSession(userId: number) {
  const id = randomBytes(32).toString("base64url");
  await prisma.session.create({ data: { id, userId, expiresAt: new Date(Date.now() + SESSION_MS) } });
  return id;
}
