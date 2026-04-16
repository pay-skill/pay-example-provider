import { Router } from "express";

/**
 * Webhook receiver for Pay events.
 * Logs payment.completed and tab.opened events.
 *
 * Full implementation (HMAC verification, structured logging) in P27-29.
 */
export const webhookRouter = Router();

webhookRouter.post("/api/webhooks/pay", (req, res) => {
  console.log("[webhook]", JSON.stringify(req.body));
  res.json({ received: true });
});
