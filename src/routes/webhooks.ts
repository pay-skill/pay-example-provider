import { Router, raw } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { log } from "../log.js";

// Webhook secret — set via WEBHOOK_SECRET env var.
// Must match the secret you registered with Pay.
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

export const webhookRouter = Router();

// Parse raw body for HMAC verification, then JSON.
webhookRouter.post("/api/webhooks/pay", raw({ type: "*/*" }), (req, res) => {
  const body = req.body as Buffer;
  const signature = req.get("x-pay-signature") || "";

  // Verify HMAC if a secret is configured
  if (WEBHOOK_SECRET) {
    const expected = createHmac("sha256", WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (
      !signature ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      log("warn", "webhook signature mismatch", { signature });
      res.status(401).json({ error: "invalid signature" });
      return;
    }
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(body.toString("utf-8")) as WebhookEvent;
  } catch {
    res.status(400).json({ error: "invalid JSON" });
    return;
  }

  // Log the event
  log("info", `webhook: ${event.type}`, {
    event_id: event.id,
    type: event.type,
    data: event.data,
  });

  // Handle specific events
  switch (event.type) {
    case "payment.completed":
      log("payment", "payment completed via webhook", {
        from: event.data?.from,
        amount: event.data?.amount,
      });
      break;

    case "tab.opened":
      log("info", "tab opened via webhook", {
        tab_id: event.data?.tab_id,
        agent: event.data?.agent,
        amount: event.data?.amount,
      });
      break;

    case "tab.low_balance":
      log("warn", "tab balance low", {
        tab_id: event.data?.tab_id,
        balance: event.data?.balance,
      });
      break;

    case "tab.closed":
      log("info", "tab closed", { tab_id: event.data?.tab_id });
      break;

    default:
      log("info", `unhandled webhook event: ${event.type}`);
  }

  // Always acknowledge receipt
  res.json({ received: true });
});

type WebhookEvent = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  created_at: string;
};
