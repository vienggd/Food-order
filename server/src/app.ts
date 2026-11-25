import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { prisma } from "./db.js";
import { AppError, errorHandler } from "./errors.js";
import { authRouter } from "./auth/routes.js";
import { ordersRouter } from "./orders/routes.js";
import { menuRouter } from "./menu/routes.js";
import { menuAdminRouter } from "./operator/menu.js";
import { operatorRouter } from "./operator/routes.js";

// addRoutes lets tests mount extra routes before the 404 and error handlers.
export function createApp(addRoutes?: (app: Express) => void) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  const api = express.Router();
  api.get("/health", (_req, res) => {
    res.json({ ok: true });
  });
  // Cloud Run and the smoke test use this: 503 when the database cannot be reached.
  api.get("/ready", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ready", db: "connected" });
    } catch {
      res.status(503).json({ status: "not_ready" });
    }
  });
  api.use("/auth", authRouter);
  api.use("/orders", ordersRouter);
  api.use("/menu", menuRouter);
  api.use("/operator/menu", menuAdminRouter); // F-05, before the operator order routes
  api.use("/operator", operatorRouter);
  addRoutes?.(app);

  app.use("/api", api);
  app.use("/api", () => {
    throw new AppError(404, "NOT_FOUND", "Not found.");
  });

  // One container: serve the built React app and send index.html for its routes (/menu, /orders/1).
  // ponytail: served whenever the folder exists; in dev it usually does not, and Vite serves the UI.
  const clientDist = resolve(process.env.CLIENT_DIST ?? "../client/dist");
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get("/{*path}", (_req, res) => res.sendFile(resolve(clientDist, "index.html")));
  }
  app.use(errorHandler);
  return app;
}
