import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { AppError, errorHandler } from "./errors.js";
import { authRouter } from "./auth/routes.js";

// addRoutes lets tests mount extra routes before the 404 and error handlers.
export function createApp(addRoutes?: (app: Express) => void) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  const api = express.Router();
  api.get("/health", (_req, res) => {
    res.json({ ok: true });
  });
  api.use("/auth", authRouter);
  addRoutes?.(app);

  app.use("/api", api);
  app.use("/api", () => {
    throw new AppError(404, "NOT_FOUND", "Not found.");
  });
  app.use(errorHandler);
  return app;
}
