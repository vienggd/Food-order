import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { pathToFileURL } from "node:url";

export const SEED_USERS = [
  { email: "alice@cafe.test", name: "Alice", role: "CUSTOMER" },
  { email: "bob@cafe.test", name: "Bob", role: "CUSTOMER" },
  { email: "staff@cafe.test", name: "Staff", role: "OPERATOR" },
] as const;

// Prices in satang. Croissant is the sold-out item.
export const SEED_MENU = [
  { name: "Latte", price: 6500, isAvailable: true },
  { name: "Americano", price: 5500, isAvailable: true },
  { name: "Thai Milk Tea", price: 5000, isAvailable: true },
  { name: "Croissant", price: 4500, isAvailable: false },
  { name: "Ham & Cheese Sandwich", price: 7500, isAvailable: true },
  { name: "Basil Chicken Rice", price: 8000, isAvailable: true },
];

// Safe to run many times: upsert by unique email / name.
export async function seed(prisma: PrismaClient, password = process.env.SEED_PASSWORD) {
  if (!password) {
    throw new Error("SEED_PASSWORD is not set. Put it in server/.env (see server/.env.example).");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  for (const u of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { ...u, passwordHash },
    });
  }
  for (const m of SEED_MENU) {
    await prisma.menuItem.upsert({ where: { name: m.name }, update: m, create: m });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prisma = new PrismaClient();
  seed(prisma)
    .then(() => console.log("Seed done: 3 users, " + SEED_MENU.length + " menu items."))
    .catch((e) => {
      console.error(e.message);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
