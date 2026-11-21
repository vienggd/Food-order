import { describe, it, expect } from "vitest";
import { OrderStatus } from "@prisma/client";
import { canTransition } from "../src/orders/transitions.js";

describe("F-04 order status transitions", () => {
  it("TEST-F04-10 Sprint 1 allows only PLACED -> ACCEPTED", () => {
    const all = Object.values(OrderStatus);
    const allowed: string[] = [];
    for (const from of all) for (const to of all) if (canTransition(from, to)) allowed.push(`${from}->${to}`);
    expect(allowed).toEqual(["PLACED->ACCEPTED"]);
    expect(canTransition("ACCEPTED", "ACCEPTED")).toBe(false);
    expect(canTransition("PLACED", "READY")).toBe(false);
    expect(canTransition("CANCELLED", "ACCEPTED")).toBe(false);
  });
});
