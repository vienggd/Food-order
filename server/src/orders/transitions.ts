import type { OrderStatus } from "@prisma/client";

// Every allowed status change in one place (DEC-05). Later sprints add targets here.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["ACCEPTED", "REJECTED", "CANCELLED"], // REJECTED, CANCELLED: F-06
  ACCEPTED: ["PREPARING"], // F-07
  PREPARING: ["READY"],
  READY: ["PICKED_UP"],
  PICKED_UP: [],
  REJECTED: [],
  CANCELLED: [],
};

// F-07: the one next step of the fulfilment chain, or null when the status has none.
export function nextStep(status: OrderStatus): OrderStatus | null {
  return status === "ACCEPTED" ? "PREPARING" : status === "PREPARING" ? "READY" : status === "READY" ? "PICKED_UP" : null;
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

// Statuses an order may be in to move to `to` (used in conditional updates).
export function statusesThatCanMoveTo(to: OrderStatus): OrderStatus[] {
  return (Object.keys(TRANSITIONS) as OrderStatus[]).filter((from) => canTransition(from, to));
}
