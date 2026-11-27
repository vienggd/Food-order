import { Router } from "express";
import { prisma } from "../db.js";
import { AppError } from "../errors.js";
import { requireRole } from "../auth/middleware.js";
import { toOrderJson } from "../orders/json.js";
import { dbId } from "../ids.js";

// F-08 simulated payment (BR-14). Mounted on /api/orders before the orders router; it only handles /:id/pay.
export const paymentsRouter = Router();

const PAYABLE = ["PLACED", "ACCEPTED", "PREPARING", "READY"] as const;

paymentsRouter.post("/:id/pay", requireRole("CUSTOMER"), async (req, res) => {
  const id = dbId.parse(req.params.id);
  const customerId = req.user!.id;
  // One atomic conditional update decides a double pay: only one request can change UNPAID to PAID.
  const { count } = await prisma.order.updateMany({
    where: { id, customerId, paymentStatus: "UNPAID", status: { in: [...PAYABLE] } },
    data: { paymentStatus: "PAID", paidAt: new Date() },
  });
  const order = await prisma.order.findFirst({ where: { id, customerId }, include: { lines: { orderBy: { id: "asc" } } } });
  if (!order) throw new AppError(404, "NOT_FOUND", "Order not found."); // missing or someone else's: same answer
  if (count === 1) {
    res.json(toOrderJson(order));
    return;
  }
  const details = { status: order.status, paymentStatus: order.paymentStatus };
  if (order.paymentStatus === "PAID") throw new AppError(409, "INVALID_STATE", "This order is already paid.", details);
  if (order.status === "PICKED_UP") throw new AppError(409, "INVALID_STATE", "This order was already picked up.", details);
  const word = order.status === "REJECTED" ? "rejected" : "cancelled";
  throw new AppError(409, "INVALID_STATE", `This order was ${word}, so it can't be paid.`, details);
});
