import { existsSync } from "node:fs";
// Runs in every test file before any import: point Prisma at the test database.
// .env is optional: CI passes TEST_DATABASE_URL as a normal env var.
if (existsSync(".env")) process.loadEnvFile(".env");
if (!process.env.TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL is not set in server/.env");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
