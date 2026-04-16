import { Router } from "express";
import { requirePayment } from "@pay-skill/express";
import { log } from "../log.js";

/**
 * Report route.
 * - POST /api/report  — paid ($2.00 direct), generates a summary report
 */
export function reportRouter(providerAddress: string): Router {
  const router = Router();

  router.post(
    "/api/report",
    requirePayment({
      price: 2.0,
      settlement: "direct",
      providerAddress,
    }),
    (req, res) => {
      // req.payment is set by requirePayment() after successful verification.
      const payment = req.payment!;
      log("payment", "report generated", {
        payer: payment.from,
        amount: payment.amount,
        settlement: payment.settlement,
      });

      const { topic } = req.body as { topic?: string };
      res.json({
        report: {
          topic: topic || "general",
          summary: `Sample report on "${topic || "general"}". In a real app, this would call an LLM or run analysis.`,
          generated_at: new Date().toISOString(),
          paid_by: payment.from,
        },
      });
    },
  );

  return router;
}
