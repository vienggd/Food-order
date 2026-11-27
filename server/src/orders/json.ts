import type { Order, OrderLine } from "@prisma/client";

// The shared Order shape (docs/sprint_1/system-sds.md 4.3). Money in satang, times ISO 8601.
export function toOrderJson(order: Order & { lines: OrderLine[] }) {
  return {
    id: order.id,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    acceptedAt: order.acceptedAt?.toISOString() ?? null,
    preparingAt: order.preparingAt?.toISOString() ?? null,
    readyAt: order.readyAt?.toISOString() ?? null,
    pickedUpAt: order.pickedUpAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    rejectedAt: order.rejectedAt?.toISOString() ?? null,
    rejectReason: order.rejectReason,
    pickupSlot: order.pickupSlot?.toISOString() ?? null,
    paymentStatus: order.paymentStatus,
    paidAt: order.paidAt?.toISOString() ?? null,
    refundedAt: order.refundedAt?.toISOString() ?? null,
    lines: order.lines.map((l) => ({
      menuItemId: l.menuItemId,
      name: l.name,
      unitPrice: l.unitPrice,
      quantity: l.quantity,
      lineTotal: l.unitPrice * l.quantity,
    })),
  };
}
