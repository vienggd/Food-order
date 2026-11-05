// Runs in every test file before any import: point Prisma at the test database.
process.loadEnvFile?.(".env");
if (!process.env.TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL is not set in server/.env");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
