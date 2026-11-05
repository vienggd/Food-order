import type { OrderStatus } from "@prisma/client";

// [red] placeholder: real table comes in the [green] commit.
export function canTransition(_from: OrderStatus, _to: OrderStatus): boolean {
  return false;
}
