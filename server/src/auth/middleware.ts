import type { RequestHandler } from "express";

// [red] placeholder: real implementation comes in the [green] commit.
export function requireRole(_role: "CUSTOMER" | "OPERATOR"): RequestHandler {
  return (_req, _res, next) => next();
}
