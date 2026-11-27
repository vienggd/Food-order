import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { AppError } from "../errors.js";
import { requireRole } from "../auth/middleware.js";
import { dbId } from "../ids.js";

// F-05 menu management. BR-08 name 1-60 unique, BR-09 price 1-100000 satang, BR-10 sold out hits new orders only.
export const menuAdminRouter = Router();
menuAdminRouter.use(requireRole("OPERATOR"));

const select = { id: true, name: true, price: true, isAvailable: true } as const;
const NAME_MSG = "Name must be 1–60 characters.";
const PRICE_MSG = "Price must be between ฿0.01 and ฿1,000.00.";

const fields = {
  name: z.string({ error: NAME_MSG }).trim().min(1, NAME_MSG).max(60, NAME_MSG),
  price: z.number({ error: PRICE_MSG }).int(PRICE_MSG).min(1, PRICE_MSG).max(100000, PRICE_MSG),
  isAvailable: z.boolean({ error: "isAvailable must be true or false." }),
};
const createBody = z.strictObject({ name: fields.name, price: fields.price, isAvailable: fields.isAvailable.default(true) });
const patchBody = z
  .strictObject({ name: fields.name, price: fields.price, isAvailable: fields.isAvailable })
  .partial()
  .refine((b) => Object.keys(b).length > 0, "Send at least one of name, price, isAvailable.");

// Turns a Zod failure into 400 with details.field (the first bad field).
function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const r = schema.safeParse(body);
  if (r.success) return r.data;
  const issue = r.error.issues[0];
  const field = typeof issue.path[0] === "string" ? issue.path[0] : null;
  throw new AppError(400, "VALIDATION_ERROR", issue.message, { field });
}

async function assertNameFree(name: string, exceptId?: number) {
  const clash = await prisma.menuItem.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    select: { name: true },
  });
  if (clash) throw new AppError(400, "VALIDATION_ERROR", `A menu item named "${clash.name}" already exists.`, { field: "name" });
}

const isUnique = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

menuAdminRouter.get("/", async (_req, res) => {
  res.json(await prisma.menuItem.findMany({ select, orderBy: { id: "asc" } }));
});

menuAdminRouter.post("/", async (req, res) => {
  const data = parseBody(createBody, req.body);
  await assertNameFree(data.name);
  try {
    res.status(201).json(await prisma.menuItem.create({ data, select }));
  } catch (e) {
    if (isUnique(e)) throw new AppError(400, "VALIDATION_ERROR", `A menu item named "${data.name}" already exists.`, { field: "name" });
    throw e;
  }
});

menuAdminRouter.patch("/:id", async (req, res) => {
  const id = dbId.parse(req.params.id);
  const data = parseBody(patchBody, req.body);
  if (!(await prisma.menuItem.findUnique({ where: { id }, select: { id: true } }))) {
    throw new AppError(404, "NOT_FOUND", "Menu item not found.");
  }
  if (data.name !== undefined) await assertNameFree(data.name, id);
  try {
    res.json(await prisma.menuItem.update({ where: { id }, data, select }));
  } catch (e) {
    if (isUnique(e)) throw new AppError(400, "VALIDATION_ERROR", `A menu item named "${data.name}" already exists.`, { field: "name" });
    throw e;
  }
});
