import express from "express";
import { initDb } from "./db.js";
import { healthRouter } from "./routes/health.js";
import { quotesRouter } from "./routes/quotes.js";
import { reportRouter } from "./routes/report.js";
import { webhookRouter } from "./routes/webhooks.js";

const PORT = parseInt(process.env.PORT || "3100", 10);

const app = express();
app.use(express.json());

// Initialize SQLite database with seed data
const db = initDb();

// Routes
app.use(healthRouter);
app.use(quotesRouter(db));
app.use(reportRouter);
app.use(webhookRouter);

app.listen(PORT, () => {
  console.log(`pay-example-provider listening on http://localhost:${PORT}`);
  console.log(`  GET  /api/health          (free)`);
  console.log(`  GET  /api/quote/random     (free)`);
  console.log(`  GET  /api/quote/premium    ($0.01, tab)`);
  console.log(`  POST /api/report           ($2.00, direct)`);
  console.log(`  POST /api/webhooks/pay     (webhook receiver)`);
});

export { app };
