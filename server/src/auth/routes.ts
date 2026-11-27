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

// F-12 (NFR-08): 5 failed logins for one email within 15 minutes lock that email for 15 minutes from the 5th failure.
const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 5;

authRouter.post("/login", async (req, res) => {
  const { email: rawEmail, password } = loginBody.parse(req.body);
  const email = rawEmail.toLowerCase(); // BR-21: counted per email, letter case ignored

  const recent = await prisma.loginFailure.findMany({
    where: { email, createdAt: { gt: new Date(Date.now() - WINDOW_MS) } },
    orderBy: { createdAt: "asc" },
    take: MAX_FAILURES,
  });
  if (recent.length >= MAX_FAILURES) {
    // The attempt is refused before the password is checked, even if the password is right.
    const retryAfterSeconds = Math.max(1, Math.ceil((recent[MAX_FAILURES - 1].createdAt.getTime() + WINDOW_MS - Date.now()) / 1000));
    const minutes = Math.ceil(retryAfterSeconds / 60);
    res.set("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: { code: "RATE_LIMITED", message: `Too many failed logins. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`, details: { retryAfterSeconds } },
    });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    await prisma.loginFailure.create({ data: { email } }); // unknown emails are counted too
    throw new AppError(401, "UNAUTHENTICATED", "Incorrect email or password.");
  }
  await prisma.loginFailure.deleteMany({ where: { email } }); // BR-20: success clears the count
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
