import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { AppError } from "../errors.js";
import { requireRole } from "../auth/middleware.js";
import { toOrderJson } from "./json.js";
import { statusesThatCanMoveTo } from "./transitions.js";
import { dbId, MAX_DB_ID } from "../ids.js";

export const ordersRouter = Router();
ordersRouter.use(requireRole("CUSTOMER"));

// Strict: any extra key (price, unitPrice, total, customerId...) is a 400 (BR-04).
const placeBody = z.strictObject({
  items: z
    .array(
      z.strictObject({
        menuItemId: z.number().int().min(1).max(MAX_DB_ID),
        quantity: z.number().int().min(1).max(10), // BR-01
      }),
    )
    .min(1)
    .max(20), // BR-02
});

type BadItem = { menuItemId: number; reason: "DUPLICATE" | "NOT_FOUND" | "SOLD_OUT" };

ordersRouter.post("/", async (req, res) => {
  const { items } = placeBody.parse(req.body);

  const seen = new Set<number>();
  const duplicates: BadItem[] = [];
  for (const { menuItemId } of items) {
    if (seen.has(menuItemId) && !duplicates.some((d) => d.menuItemId === menuItemId)) {
      duplicates.push({ menuItemId, reason: "DUPLICATE" });
    }
    seen.add(menuItemId);
  }
  if (duplicates.length) {
    throw new AppError(400, "VALIDATION_ERROR", "Order not placed. Each item can appear only once.", { items: duplicates });
  }

  // One transaction: check every item, then write the order and its lines, or write nothing (BR-03, NFR-04).
  // shortcut: items are read without a row lock; an item marked sold out in the same millisecond can slip
  // through. Add SELECT ... FOR UPDATE if F-05 makes sold-out changes frequent.
  const order = await prisma.$transaction(async (tx) => {
    const found = await tx.menuItem.findMany({ where: { id: { in: [...seen] } } });
    const byId = new Map(found.map((m) => [m.id, m]));
    const bad: BadItem[] = [];
    for (const { menuItemId } of items) {
      const m = byId.get(menuItemId);
      if (!m) bad.push({ menuItemId, reason: "NOT_FOUND" });
      else if (!m.isAvailable) bad.push({ menuItemId, reason: "SOLD_OUT" });
    }
    if (bad.length) {
      const names = bad.map((b) => byId.get(b.menuItemId)?.name).filter(Boolean).map((n) => `'${n}'`);
      const what = names.length ? `${names.join(", ")} ${names.length > 1 ? "are" : "is"}` : "An item is";
      throw new AppError(400, "VALIDATION_ERROR", `Order not placed. ${what} no longer available.`, { items: bad });
    }

    // Prices and names come from the database and are copied onto the lines (BR-04, BR-05).
    const lines = items.map(({ menuItemId, quantity }) => {
      const m = byId.get(menuItemId)!;
      return { menuItemId, name: m.name, unitPrice: m.price, quantity };
    });
    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    return tx.order.create({
      data: { customerId: req.user!.id, total, lines: { create: lines } },
      include: { lines: { orderBy: { id: "asc" } } },
    });
  });

  res.status(201).json(toOrderJson(order));
});

ordersRouter.get("/", async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user!.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { lines: { select: { quantity: true } } },
  });
  res.json(
    orders.map((o) => ({
      id: o.id,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: o.total,
      itemCount: o.lines.reduce((n, l) => n + l.quantity, 0),
      createdAt: o.createdAt.toISOString(),
    })),
  );
});

ordersRouter.get("/:id", async (req, res) => {
  const id = dbId.parse(req.params.id);
  // Filter by owner in the query: another customer's order looks exactly like a missing one (DEC-07).
  const order = await prisma.order.findFirst({
    where: { id, customerId: req.user!.id },
    include: { lines: { orderBy: { id: "asc" } } },
  });
  if (!order) throw new AppError(404, "NOT_FOUND", "Order not found.");
  res.json(toOrderJson(order));
});

// F-06 customer cancel (BR-11). One conditional update decides any race with accept.
ordersRouter.post("/:id/cancel", async (req, res) => {
  const id = dbId.parse(req.params.id);
  const customerId = req.user!.id;
  const { count } = await prisma.order.updateMany({
    where: { id, customerId, status: { in: statusesThatCanMoveTo("CANCELLED") } },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  // Only own orders are read: someone else's order looks exactly like a missing one.
  const order = await prisma.order.findFirst({ where: { id, customerId }, include: { lines: { orderBy: { id: "asc" } } } });
  if (!order) throw new AppError(404, "NOT_FOUND", "Order not found.");
  if (count === 0) {
    const message =
      order.status === "CANCELLED"
        ? "This order is already cancelled."
        : order.status === "REJECTED"
          ? "This order was already rejected, so it can't be cancelled."
          : "This order was already accepted, so it can't be cancelled.";
    throw new AppError(409, "INVALID_STATE", message, { status: order.status });
  }
  res.json(toOrderJson(order));
});
