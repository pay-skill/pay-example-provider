import express from "express";
import { initDb } from "./db.js";
import { healthRouter } from "./routes/health.js";
import { quotesRouter } from "./routes/quotes.js";
import { reportRouter } from "./routes/report.js";
import { webhookRouter } from "./routes/webhooks.js";
import { log } from "./log.js";

const PORT = parseInt(process.env.PORT || "3100", 10);

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

const app = express();
app.use(express.json());

// Initialize SQLite database with seed data
const db = initDb();

// Routes
app.use(healthRouter);
app.use(quotesRouter(db, PROVIDER_ADDRESS));
app.use(reportRouter(PROVIDER_ADDRESS));
app.use(webhookRouter);

app.listen(PORT, () => {
  log("info", `pay-example-provider listening on http://localhost:${PORT}`);
  log("info", `  GET  /api/health          (free)`);
  log("info", `  GET  /api/quote/random     (free)`);
  log("info", `  GET  /api/quote/premium    ($0.01, tab)`);
  log("info", `  POST /api/report           ($2.00, direct)`);
  log("info", `  POST /api/webhooks/pay     (webhook receiver)`);
  log("info", `  provider: ${PROVIDER_ADDRESS}`);
});

export { app };
