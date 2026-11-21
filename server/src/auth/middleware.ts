import type { Request, RequestHandler } from "express";
import type { Role } from "@prisma/client";
import { prisma } from "../db.js";
import { AppError } from "../errors.js";
import { SESSION_COOKIE } from "./session.js";

export type AuthUser = { id: number; name: string; role: Role };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// The user always comes from the session row, never from the request body or query.
async function loadUser(req: Request): Promise<AuthUser> {
  const sid = req.cookies?.[SESSION_COOKIE];
  const session = sid ? await prisma.session.findUnique({ where: { id: sid }, include: { user: true } }) : null;
  if (!session) throw new AppError(401, "UNAUTHENTICATED", "Not logged in.");
  if (session.expiresAt <= new Date()) {
    await prisma.session.deleteMany({ where: { id: session.id } });
    throw new AppError(401, "UNAUTHENTICATED", "Not logged in.");
  }
  const { id, name, role } = session.user;
  return { id, name, role };
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  req.user = await loadUser(req);
  next();
};

export function requireRole(role: Role): RequestHandler {
  return async (req, _res, next) => {
    req.user = await loadUser(req);
    if (req.user.role !== role) throw new AppError(403, "FORBIDDEN", "You don't have access to this.");
    next();
  };
}
