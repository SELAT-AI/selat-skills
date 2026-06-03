---
name: crypto-fear-greed
description: Use this skill when the user wants crypto market sentiment — e.g. "crypto fear and greed index", "is the market fearful or greedy", "current market sentiment score", "fear greed index right now", "how bullish is crypto today". Fetches the Crypto Fear & Greed Index time series from Arrays via a direct Circle nanopayment (no router hop) over a Unix-timestamp window.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet on Base. Direct rail only — no SELAT Router needed.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: direct
  kind: single
---

# crypto-fear-greed

## When To Use

Use when the user wants a read on overall crypto market sentiment — the Fear & Greed Index (0–100) and its label (Extreme Fear → Extreme Greed). This is a **direct** skill: the payment is a Circle nanopayment (Gateway-batched) paid straight to the Arrays upstream, no router hop, no markup.

The endpoint returns a **time series** over a window, so for *current* sentiment pass a recent window (e.g. the last ~2 days) and read the most recent `data` entry. Prefer this over multi-rail snapshot skills when the user only wants sentiment, not prices.

## Workflow

1. Install: `selat skill install crypto-fear-greed`
2. Compute a Unix-second window (the caller supplies it — the manifest cannot compute "now"):
   - `end_time` = current time, e.g. `date +%s`
   - `start_time` = `end_time - 172800` (last 2 days)
3. Run: `selat skill run crypto-fear-greed --start_time <start> --end_time <end>`
4. The CLI compiles the single step into a `selat-pay` GET, pays the direct nanopayment, and prints the series. Report the latest entry's `value` and its sentiment band.

Step: **Arrays** `GET /api/v1/crypto/fear-greed-index` — **DIRECT** (Gateway-batched).

## Inputs And Outputs

| Param | Required | Description |
|---|---|---|
| `start_time` | yes | Window start, Unix timestamp in seconds (UTC). For "now", use ~now − 2 days. |
| `end_time` | yes | Window end, Unix timestamp in seconds (UTC). Must be > `start_time`; use the current time for the latest reading. |

Output: `{ "data": [ { "timestamp": <unix-s>, "value": <0–100>, "time": "YYYY-MM-DDTHH:MM:SSZ" }, … ] }`. The newest entry is the current reading. Sentiment bands: 0–25 Extreme Fear, 25–50 Fear, 50–75 Greed, 75–100 Extreme Greed.

## Gotchas

- `start_time` and `end_time` are **required** and must be **Unix seconds** (not milliseconds); `end_time` must be greater than `start_time`. Without them the upstream returns HTTP 400 (`VALIDATION_ERROR`) even though the payment settled.
- The manifest cannot compute "now" — the calling agent must pass timestamps.
- Direct rail only: no `SELAT_ROUTER_URL` / router required.
- The index is a single global market figure (no per-coin variant); for per-coin data use a price/detail skill.
- Cap: $0.01 per run (probed price ≈ $0.008).

## Validation

- Probe without paying: `selat-pay GET "https://x402-data-tools.prd.arrays.org/api/v1/crypto/fear-greed-index" --chain base --probe-only` (expect `mode=direct`).
- A successful run prints `status=200` and a `data` array of `{timestamp, value, time}` points (verified live: a 2-day window returned `value: 23` → "Extreme Fear").

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- Upstream docs — https://x402-data-tools.prd.space.id/docs/output/v1_crypto_fear-greed-index_get.json
- selat-pay — https://github.com/SELAT-AI/selat-pay
