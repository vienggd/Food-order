import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { AppError } from "../errors.js";
import { requireRole } from "../auth/middleware.js";
import { toOrderJson } from "../orders/json.js";
import { statusesThatCanMoveTo } from "../orders/transitions.js";

export const operatorRouter = Router();
operatorRouter.use(requireRole("OPERATOR"));

// Sprint 1 supports only the PLACED queue; missing status means PLACED.
const queueQuery = z.object({ status: z.literal("PLACED").default("PLACED") });
const idParam = z.coerce.number().int().positive();

operatorRouter.get("/orders", async (req, res) => {
  const { status } = queueQuery.parse(req.query);
  const orders = await prisma.order.findMany({
    where: { status },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: { lines: { orderBy: { id: "asc" } }, customer: { select: { id: true, name: true } } },
  });
  res.json(orders.map((o) => ({ ...toOrderJson(o), customer: o.customer })));
});

operatorRouter.post("/orders/:id/accept", async (req, res) => {
  const id = idParam.parse(req.params.id);
  // One atomic conditional update decides any race (BR-07): only one request can change the row.
  const { count } = await prisma.order.updateMany({
    where: { id, status: { in: statusesThatCanMoveTo("ACCEPTED") } },
    data: { status: "ACCEPTED", acceptedAt: new Date() },
  });
  const order = await prisma.order.findUnique({ where: { id }, include: { lines: { orderBy: { id: "asc" } } } });
  if (!order) throw new AppError(404, "NOT_FOUND", "Order not found.");
  if (count === 0) {
    const message = order.status === "ACCEPTED" ? "Already accepted by another staff member." : "Only PLACED orders can be accepted.";
    throw new AppError(409, "INVALID_STATE", message, { status: order.status });
  }
  res.json(toOrderJson(order));
});
