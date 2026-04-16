import { Router } from "express";
import { requirePayment } from "@pay-skill/express";
import type Database from "better-sqlite3";
import type { QuoteRow } from "../db.js";
import { log } from "../log.js";

/**
 * Quote routes.
 * - GET /api/quote/random   — free, returns a random general quote
 * - GET /api/quote/premium  — paid ($0.01 tab), returns a random premium quote
 */
export function quotesRouter(
  db: Database.Database,
  providerAddress: string,
): Router {
  const router = Router();

  // Free: random general quote
  router.get("/api/quote/random", (_req, res) => {
    const row = db
      .prepare(
        "SELECT id, text, author, category FROM quotes WHERE category = 'general' ORDER BY RANDOM() LIMIT 1",
      )
      .get() as QuoteRow | undefined;

    if (!row) {
      res.status(503).json({ error: "no quotes available" });
      return;
    }
    res.json(row);
  });

  // Paid: random premium quote — $0.01 per call, tab settlement
  router.get(
    "/api/quote/premium",
    requirePayment({
      price: 0.01,
      settlement: "tab",
      providerAddress,
    }),
    (req, res) => {
      // req.payment is set by requirePayment() after successful verification.
      // Use it for typed access to payer info.
      const payment = req.payment!;
      log("payment", "premium quote served", {
        payer: payment.from,
        amount: payment.amount,
        settlement: payment.settlement,
        tab: payment.tabId,
      });

      const row = db
        .prepare(
          "SELECT id, text, author, category FROM quotes WHERE category != 'general' ORDER BY RANDOM() LIMIT 1",
        )
        .get() as QuoteRow | undefined;

      if (!row) {
        res.status(503).json({ error: "no quotes available" });
        return;
      }
      res.json({ ...row, paid_by: payment.from });
    },
  );

  return router;
}
