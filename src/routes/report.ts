import { Router } from "express";

/**
 * Report route.
 * - POST /api/report  — paid ($2.00 direct), generates a summary report
 *
 * Payment middleware added in P27-28.
 */
export const reportRouter = Router();

reportRouter.post("/api/report", (req, res) => {
  const { topic } = req.body as { topic?: string };
  res.json({
    report: {
      topic: topic || "general",
      summary: `Sample report on "${topic || "general"}". In a real app, this would call an LLM or run analysis.`,
      generated_at: new Date().toISOString(),
    },
  });
});
