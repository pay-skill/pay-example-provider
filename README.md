# pay-example-provider

Example Express.js API with x402 paywalls using [`@pay-skill/express`](https://www.npmjs.com/package/@pay-skill/express).

Demonstrates how to gate API routes behind x402 payments using the `requirePayment()` middleware.

## Routes

| Endpoint | Method | Price | Settlement | Description |
|----------|--------|-------|------------|-------------|
| `/api/health` | GET | Free | - | Health check |
| `/api/quote/random` | GET | Free | - | Random general quote |
| `/api/quote/premium` | GET | $0.01 | Tab | Random premium quote |
| `/api/report` | POST | $2.00 | Direct | Generate a summary report |
| `/api/webhooks/pay` | POST | - | - | Webhook receiver |

## Quick Start

```bash
# Clone and install
git clone https://github.com/pay-skill/pay-example-provider.git
cd pay-example-provider
npm install

# Set your provider wallet address (receives payments)
export PROVIDER_ADDRESS="0xYourWalletAddress"

# Optional: webhook HMAC secret for signature verification
export WEBHOOK_SECRET="your-secret"

# Run
npm run dev
```

The server starts on `http://localhost:3100`.

## Testing with Pay CLI

```bash
# Free route — no payment needed
curl http://localhost:3100/api/quote/random

# Paid route — use pay request to auto-handle the 402 payment flow
pay request http://localhost:3100/api/quote/premium

# Paid route — direct settlement ($2.00)
pay request -X POST http://localhost:3100/api/report -d '{"topic":"AI agents"}'
```

## How It Works

Paid routes use the `requirePayment()` middleware from `@pay-skill/express`:

```typescript
import { requirePayment } from "@pay-skill/express";

app.get(
  "/api/quote/premium",
  requirePayment({
    price: 0.01,           // $0.01 per call
    settlement: "tab",     // Tab-based micropayments
    providerAddress,       // Your wallet address
  }),
  (req, res) => {
    // req.payment contains verified payer info
    const { from, amount, settlement } = req.payment!;
    res.json({ quote: "...", paid_by: from });
  },
);
```

When an unpaid request arrives, the middleware returns HTTP 402 with payment requirements. x402-capable clients (Pay CLI, SDKs, MCP server) handle payment automatically and retry.

## Webhook Events

Register a webhook with the Pay API pointing at `/api/webhooks/pay`:

```bash
pay webhook register http://your-server.com/api/webhooks/pay \
  --events payment.completed,tab.opened,tab.low_balance,tab.closed \
  --secret your-secret
```

Set `WEBHOOK_SECRET` to the same secret for HMAC-SHA256 signature verification.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PROVIDER_ADDRESS` | Yes | - | Wallet address that receives payments |
| `WEBHOOK_SECRET` | No | - | HMAC secret for webhook signature verification |
| `PORT` | No | `3100` | Server port |

## Learn More

- [Build with Pay: Choosing Your Integration](https://pay-skill.com/docs/guides/build-with-pay/)
- [Express.js Middleware Guide](https://pay-skill.com/docs/middleware/express)
- [Webhook Events](https://pay-skill.com/docs/webhooks)
- [Going to Production](https://pay-skill.com/docs/guides/build-with-pay/production)

## Part of Pay

Pay is the complete x402 payment stack -- gateway, facilitator, SDKs, CLI, and MCP server -- that lets AI agents pay for APIs with USDC on Base.

- [Architecture](https://pay-skill.com/docs/architecture)
- [Documentation](https://pay-skill.com/docs)
- [GitHub](https://github.com/pay-skill)

## License

MIT
