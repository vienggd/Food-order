import { Router } from "express";
import { prisma } from "../db.js";
import { requireRole } from "../auth/middleware.js";
import { CAPACITY, clock, isClosed, todaySlots } from "./slots.js";

// F-09: today's slots with their state. Read-only; the same for every customer.
export const slotsRouter = Router();
slotsRouter.use(requireRole("CUSTOMER"));

slotsRouter.get("/", async (_req, res) => {
  const now = clock.now();
  const slots = todaySlots(now);
  const used = await prisma.order.groupBy({
    by: ["pickupSlot"],
    where: { pickupSlot: { in: slots }, status: { notIn: ["CANCELLED", "REJECTED"] } },
    _count: { _all: true },
  });
  const usedBy = new Map(used.map((u) => [u.pickupSlot!.getTime(), u._count._all]));
  res.json(
    slots.map((s) => {
      const remaining = Math.max(0, CAPACITY - (usedBy.get(s.getTime()) ?? 0));
      const state = isClosed(s, now) ? "closed" : remaining === 0 ? "full" : "open";
      return { start: s.toISOString(), state, remaining: state === "closed" ? 0 : remaining };
    }),
  );
});
