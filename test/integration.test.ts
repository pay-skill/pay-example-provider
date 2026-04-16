import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import type { Server } from "node:http";

let server: Server;
const PORT = 3199;
const BASE = `http://localhost:${PORT}`;

before(async () => {
  process.env.PROVIDER_ADDRESS =
    "0x1234567890123456789012345678901234567890";
  const { createApp } = await import("../src/app.js");
  const app = createApp();
  server = app.listen(PORT);
  await new Promise<void>((resolve) => server.once("listening", resolve));
});

after(() => {
  server?.close();
});

describe("free routes", () => {
  it("GET /api/health returns 200", async () => {
    const res = await fetch(`${BASE}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
  });

  it("GET /api/quote/random returns a quote", async () => {
    const res = await fetch(`${BASE}/api/quote/random`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      id: number;
      text: string;
      author: string;
      category: string;
    };
    assert.ok(body.id);
    assert.ok(body.text);
    assert.ok(body.author);
    assert.equal(body.category, "general");
  });
});

describe("paid routes return 402 without payment", () => {
  it("GET /api/quote/premium returns 402", async () => {
    const res = await fetch(`${BASE}/api/quote/premium`);
    assert.equal(res.status, 402);
    const text = await res.text();
    assert.ok(text.length > 0, "402 response should have a body");
  });

  it("POST /api/report returns 402", async () => {
    const res = await fetch(`${BASE}/api/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic: "test" }),
    });
    assert.equal(res.status, 402);
  });
});

describe("webhook endpoint", () => {
  it("POST /api/webhooks/pay accepts valid JSON", async () => {
    const res = await fetch(`${BASE}/api/webhooks/pay`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: "evt_test_1",
        type: "payment.completed",
        data: { from: "0xabc", amount: 10000 },
        created_at: new Date().toISOString(),
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.received, true);
  });
});
