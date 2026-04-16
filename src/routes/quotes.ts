import { Router } from "express";
import type Database from "better-sqlite3";
import type { QuoteRow } from "../db.js";

/**
 * Quote routes.
 * - GET /api/quote/random   — free, returns a random general quote
 * - GET /api/quote/premium  — paid ($0.01 tab), returns a random premium quote
 */
export function quotesRouter(db: Database.Database): Router {
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

  // Paid: random premium quote — middleware added in P27-28
  router.get("/api/quote/premium", (_req, res) => {
    const row = db
      .prepare(
        "SELECT id, text, author, category FROM quotes WHERE category != 'general' ORDER BY RANDOM() LIMIT 1",
      )
      .get() as QuoteRow | undefined;

    if (!row) {
      res.status(503).json({ error: "no quotes available" });
      return;
    }
    res.json(row);
  });

  return router;
}
