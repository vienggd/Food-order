import { PrismaClient, type OrderStatus } from "@prisma/client";
import { E2E_DATABASE_URL } from "../playwright.config";

// Direct access to the E2E database, to set up orders without going through other features.
export const db = new PrismaClient({ datasourceUrl: E2E_DATABASE_URL });

export function assertLocalE2eDb(url: string) {
  const u = new URL(url);
  if (!["localhost", "127.0.0.1"].includes(u.hostname) || !u.pathname.endsWith("_e2e")) {
    throw new Error(`Refusing to reset ${u.hostname}${u.pathname}: E2E needs a local *_e2e database.`);
  }
}

export async function clearOrders() {
  assertLocalE2eDb(E2E_DATABASE_URL);
  await db.$executeRawUnsafe('TRUNCATE "order_lines", "orders" RESTART IDENTITY CASCADE');
}

export async function makeOrder(email: string, items: [string, number][], status: OrderStatus = "PLACED", createdAt = new Date()) {
  const customer = await db.user.findUniqueOrThrow({ where: { email } });
  const menu = await db.menuItem.findMany({ where: { name: { in: items.map(([n]) => n) } } });
  const lines = items.map(([name, quantity]) => {
    const m = menu.find((x) => x.name === name)!;
    return { menuItemId: m.id, name: m.name, unitPrice: m.price, quantity };
  });
  return db.order.create({
    data: {
      customerId: customer.id,
      status,
      createdAt,
      total: lines.reduce((t, l) => t + l.unitPrice * l.quantity, 0),
      lines: { create: lines },
    },
  });
}
