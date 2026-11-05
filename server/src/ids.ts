import { z } from "zod";

// Database ids are Postgres `int`: 1..2147483647. A larger number would make Prisma throw (500), so reject it here (400).
export const dbId = z.coerce.number().int().min(1).max(2147483647);
