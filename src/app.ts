import express from "express";
import { initDb } from "./db.js";
import { healthRouter } from "./routes/health.js";
import { quotesRouter } from "./routes/quotes.js";
import { reportRouter } from "./routes/report.js";
import { webhookRouter } from "./routes/webhooks.js";
import { log } from "./log.js";

// Provider wallet address — receives USDC from paid routes.
// Set via PROVIDER_ADDRESS env var, or defaults to a placeholder.
const PROVIDER_ADDRESS =
  process.env.PROVIDER_ADDRESS || "0x0000000000000000000000000000000000000000";

if (PROVIDER_ADDRESS === "0x0000000000000000000000000000000000000000") {
  log(
    "warn",
    "PROVIDER_ADDRESS not set. Paid routes will use zero address (payments will fail). Set PROVIDER_ADDRESS in your environment.",
  );
}

export function createApp() {
  const app = express();

  // Webhook route must be registered BEFORE express.json() so it can
  // read the raw body for HMAC verification.
  app.use(webhookRouter);

  app.use(express.json());

  // Initialize SQLite database with seed data
  const db = initDb();

  // Routes
  app.use(healthRouter);
  app.use(quotesRouter(db, PROVIDER_ADDRESS));
  app.use(reportRouter(PROVIDER_ADDRESS));

  return app;
}
