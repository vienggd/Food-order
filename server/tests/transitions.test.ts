import { describe, it, expect } from "vitest";
import { OrderStatus } from "@prisma/client";
import { canTransition } from "../src/orders/transitions.js";

describe("F-04 order status transitions", () => {
  it("TEST-F04-10 PLACED may move to ACCEPTED, REJECTED or CANCELLED (F-06 widened Sprint 1)", () => {
    const all = Object.values(OrderStatus);
    const allowed: string[] = [];
    for (const from of all) for (const to of all) if (canTransition(from, to)) allowed.push(`${from}->${to}`);
    expect(allowed.sort()).toEqual(["ACCEPTED->PREPARING", "PLACED->ACCEPTED", "PLACED->CANCELLED", "PLACED->REJECTED", "PREPARING->READY", "READY->PICKED_UP"]); // F-06 and F-07 added targets
    expect(canTransition("ACCEPTED", "ACCEPTED")).toBe(false);
    expect(canTransition("PLACED", "READY")).toBe(false);
    expect(canTransition("CANCELLED", "ACCEPTED")).toBe(false);
  });
});
