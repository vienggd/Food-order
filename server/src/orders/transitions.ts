import type { OrderStatus } from "@prisma/client";

// Every allowed status change in one place (DEC-05). Later sprints add targets here.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["ACCEPTED"],
  ACCEPTED: [],
  PREPARING: [],
  READY: [],
  PICKED_UP: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

// Statuses an order may be in to move to `to` (used in conditional updates).
export function statusesThatCanMoveTo(to: OrderStatus): OrderStatus[] {
  return (Object.keys(TRANSITIONS) as OrderStatus[]).filter((from) => canTransition(from, to));
}
