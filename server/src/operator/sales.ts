import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { AppError } from "../errors.js";
import { requireRole } from "../auth/middleware.js";

// F-10 sales summary. BR-17 only PICKED_UP + PAID orders count; BR-18 days are Asia/Bangkok (UTC+7, no DST);
// BR-19 top 3 items by quantity, ties by name.
export const salesRouter = Router();
salesRouter.use(requireRole("OPERATOR"));

const DAY = 86_400_000;
const BANGKOK_OFFSET = 7 * 3_600_000;
const MAX_DAYS = 92;

const dateText = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date format YYYY-MM-DD.").refine(
  (s) => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s),
  "Not a real date.",
);
const query = z.object({ from: dateText.optional(), to: dateText.optional() });

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

salesRouter.get("/", async (req, res) => {
  const parsed = query.safeParse(req.query);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AppError(400, "VALIDATION_ERROR", issue.message, { field: String(issue.path[0] ?? "") });
  }
  const today = isoDay(Date.now() + BANGKOK_OFFSET);
  const to = parsed.data.to ?? today;
  const from = parsed.data.from ?? isoDay(Date.parse(to) - 6 * DAY);
  if (from > to) throw new AppError(400, "VALIDATION_ERROR", "From must not be after to.", { field: "from" });
  if ((Date.parse(to) - Date.parse(from)) / DAY + 1 > MAX_DAYS) {
    throw new AppError(400, "VALIDATION_ERROR", `The range can be at most ${MAX_DAYS} days.`, { field: "to" });
  }

  // Bangkok midnight of `from` up to (not including) Bangkok midnight after `to`, as UTC instants.
  const start = new Date(Date.parse(from) - BANGKOK_OFFSET);
  const end = new Date(Date.parse(to) + DAY - BANGKOK_OFFSET);
  const paidPickedUp = { status: "PICKED_UP", paymentStatus: "PAID", pickedUpAt: { gte: start, lt: end } } as const;

  const days = await prisma.$queryRaw<{ date: string; order_count: number; sales_total: number }[]>`
    SELECT to_char((picked_up_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') AS date,
           COUNT(*)::int AS order_count, COALESCE(SUM(total), 0)::int AS sales_total
    FROM orders
    WHERE status = 'PICKED_UP' AND payment_status = 'PAID' AND picked_up_at >= ${start} AND picked_up_at < ${end}
    GROUP BY 1 ORDER BY 1 DESC`;

  const grouped = await prisma.orderLine.groupBy({
    by: ["menuItemId", "name"],
    where: { order: paidPickedUp },
    _sum: { quantity: true },
  });
  const topItems = grouped
    .map((g) => ({ menuItemId: g.menuItemId, name: g.name, quantity: g._sum.quantity ?? 0 }))
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
    .slice(0, 3);

  res.json({
    from,
    to,
    days: days.map((d) => ({ date: d.date, orderCount: d.order_count, salesTotal: d.sales_total })),
    topItems,
  });
});
