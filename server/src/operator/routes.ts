import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { AppError } from "../errors.js";
import { requireRole } from "../auth/middleware.js";
import { toOrderJson } from "../orders/json.js";
import { statusesThatCanMoveTo } from "../orders/transitions.js";
import { dbId } from "../ids.js";

export const operatorRouter = Router();
operatorRouter.use(requireRole("OPERATOR"));

// Sprint 1 supports only the PLACED queue; missing status means PLACED.
const queueQuery = z.object({ status: z.literal("PLACED").default("PLACED") });

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
  const id = dbId.parse(req.params.id);
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

// F-06 reject (BR-12) + F-08 automatic refund if PAID (BR-16). Reason is checked first (400); one conditional update decides races.
const rejectBody = z.strictObject({
  reason: z.string({ error: "Reason must be 3–200 characters." }).trim().min(3, "Reason must be 3–200 characters.").max(200, "Reason must be 3–200 characters."),
});

operatorRouter.post("/orders/:id/reject", async (req, res) => {
  const id = dbId.parse(req.params.id);
  const parsed = rejectBody.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", parsed.error.issues[0].message, { field: "reason" });
  const allowed = statusesThatCanMoveTo("REJECTED");
  const count = await prisma.$executeRaw`
    UPDATE "orders"
    SET "status" = 'REJECTED'::"OrderStatus",
        "rejected_at" = NOW(),
        "reject_reason" = ${parsed.data.reason},
        "updated_at" = NOW(),
        "payment_status" = CASE WHEN "payment_status" = 'PAID'::"PaymentStatus" THEN 'REFUNDED'::"PaymentStatus" ELSE "payment_status" END,
        "refunded_at" = CASE WHEN "payment_status" = 'PAID'::"PaymentStatus" THEN NOW() ELSE "refunded_at" END
    WHERE "id" = ${id}
      AND "status"::text = ANY(${allowed})
  `;
  const order = await prisma.order.findUnique({ where: { id }, include: { lines: { orderBy: { id: "asc" } } } });
  if (!order) throw new AppError(404, "NOT_FOUND", "Order not found.");
  if (count === 0) {
    const message =
      order.status === "CANCELLED"
        ? `Order #${id} was already cancelled by the customer.`
        : order.status === "REJECTED"
          ? `Order #${id} was already rejected.`
          : `Order #${id} was already accepted by another staff member.`;
    throw new AppError(409, "INVALID_STATE", message, { status: order.status });
  }
  res.json(toOrderJson(order));
});
