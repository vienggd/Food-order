import { AppError } from "../errors.js";

// F-09 pickup slots (BR-22..BR-24). All values live here (contract section 2).
export const SLOT_MINUTES = 15;
export const CUTOFF_MINUTES = 15; // orders for a slot close this long before it starts
export const CAPACITY = 10; // active orders per slot
const OPEN_HOUR = 8; // 08:00 Asia/Bangkok
const CLOSE_HOUR = 17; // 17:00; the last slot starts 16:45
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7, no daylight saving
const MIN_MS = 60_000;

// Tests replace the clock with a fixed time; the server never trusts the client's idea of "now".
// The E2E server sets E2E_CLOCK_NOW to freeze it; the variable is ignored in production.
const frozen = process.env.NODE_ENV !== "production" && process.env.E2E_CLOCK_NOW ? new Date(process.env.E2E_CLOCK_NOW) : null;
export const clock = { now: () => (frozen ? new Date(frozen) : new Date()) };

// Start times (UTC) of today's slots in Bangkok: 08:00, 08:15 ... 16:45.
export function todaySlots(now: Date = clock.now()): Date[] {
  const bkk = new Date(now.getTime() + BANGKOK_OFFSET_MS);
  const dayStartUtc = Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate()) - BANGKOK_OFFSET_MS;
  const out: Date[] = [];
  for (let m = OPEN_HOUR * 60; m < CLOSE_HOUR * 60; m += SLOT_MINUTES) out.push(new Date(dayStartUtc + m * MIN_MS));
  return out;
}

// Open while now is strictly before (start - cut-off): at the cut-off second the slot is closed.
export const isClosed = (start: Date, now: Date = clock.now()) => now.getTime() >= start.getTime() - CUTOFF_MINUTES * MIN_MS;

const field = "pickupSlot";

// Returns the slot start as a Date, or throws 400 (bad value, not one of today's slots, or past its cut-off).
export function parsePickupSlot(value: unknown): Date {
  const date = typeof value === "string" ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) throw new AppError(400, "VALIDATION_ERROR", "Pickup slot must be a valid time.", { field });
  const start = todaySlots().find((s) => s.getTime() === date.getTime());
  if (!start) throw new AppError(400, "VALIDATION_ERROR", "Pick one of today's pickup slots.", { field });
  if (isClosed(start)) throw new AppError(400, "VALIDATION_ERROR", "This pickup slot is closed. Pick a later slot.", { field });
  return start;
}
