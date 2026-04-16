import { createApp } from "./app.js";
import { log } from "./log.js";

const PORT = parseInt(process.env.PORT || "3100", 10);

const app = createApp();

app.listen(PORT, () => {
  log("info", `pay-example-provider listening on http://localhost:${PORT}`);
  log("info", `  GET  /api/health          (free)`);
  log("info", `  GET  /api/quote/random     (free)`);
  log("info", `  GET  /api/quote/premium    ($0.01, tab)`);
  log("info", `  POST /api/report           ($2.00, direct)`);
  log("info", `  POST /api/webhooks/pay     (webhook receiver)`);
  log("info", `  provider: ${process.env.PROVIDER_ADDRESS || "(not set)"}`);
});
