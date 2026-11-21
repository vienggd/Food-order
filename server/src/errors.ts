import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_STATE"
  | "INTERNAL_ERROR";

// Throw this from any route; the error handler turns it into the shared JSON shape.
export class AppError extends Error {
  constructor(
    public status: number,
    public code: ErrorCode,
    message: string,
    public details: unknown = null,
  ) {
    super(message);
  }
}

// Every error leaves the API as { error: { code, message, details } }. No stack traces.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request.", details: err.issues } });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Request body is not valid JSON.", details: null } });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong.", details: null } });
};
