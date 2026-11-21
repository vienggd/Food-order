import { Router } from "express";
import { prisma } from "../db.js";
import { requireRole } from "../auth/middleware.js";

export const menuRouter = Router();

// F-02: customers see every item, sold-out included (isAvailable false). Prices are integer satang.
menuRouter.get("/", requireRole("CUSTOMER"), async (_req, res) => {
  const items = await prisma.menuItem.findMany({
    select: { id: true, name: true, price: true, isAvailable: true },
    orderBy: { id: "asc" },
  });
  res.json(items);
});
