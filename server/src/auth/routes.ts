import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db.js";
import { AppError } from "../errors.js";
import { requireAuth } from "./middleware.js";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "./session.js";

const loginBody = z.strictObject({ email: z.email(), password: z.string().min(1).max(200) });

// Compared when the email is unknown, so both failures take about the same time.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = loginBody.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new AppError(401, "UNAUTHENTICATED", "Incorrect email or password.");

  const sid = await createSession(user.id);
  res.cookie(SESSION_COOKIE, sid, sessionCookieOptions(process.env.NODE_ENV === "production"));
  res.json({ id: user.id, name: user.name, role: user.role });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});

authRouter.post("/logout", async (req, res) => {
  const sid = req.cookies?.[SESSION_COOKIE];
  if (sid) await prisma.session.deleteMany({ where: { id: sid } });
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.status(204).end();
});
