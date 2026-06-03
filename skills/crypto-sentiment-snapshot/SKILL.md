---
name: crypto-sentiment-snapshot
description: Use this skill when the user wants a combined crypto market read — overall sentiment plus a coin's price — e.g. "market mood and BTC price", "fear and greed plus a quote for ETH", "give me a crypto sentiment snapshot", "how's the market feeling and what's bitcoin at". Combines the Arrays Fear & Greed Index (direct Circle nanopayment) with a CoinMarketCap price quote (routed via the SELAT Router) in one run, exercising both payment rails.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet on Base. The routed leg also requires a reachable SELAT Router (SELAT_ROUTER_URL); the direct leg does not.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
  kind: multi
---

# crypto-sentiment-snapshot

## When To Use

Use when the user wants both the **market mood** (Fear & Greed Index) and a **coin's price** in one shot. This is a multi-rail skill and a good demonstration that one agent wallet can pay a **direct** Circle nanopayment and a **router-translated routed-x402** call in the same run:

- **Step 1 — Arrays Fear & Greed** — DIRECT (Gateway-batched), paid straight to the upstream.
- **Step 2 — CoinMarketCap quote** — ROUTED-x402, where the SELAT Router translates the agent's inbound Gateway-batched payment into the upstream's erc-3009 scheme.

## Workflow

1. Install: `selat skill install crypto-sentiment-snapshot`
2. Compute a recent Unix-second window for the sentiment leg (the caller supplies it):
   - `end_time` = current time (`date +%s`); `start_time` = `end_time - 172800` (last 2 days).
3. Run: `selat skill run crypto-sentiment-snapshot --symbol BTC --start_time <start> --end_time <end>`
4. The CLI runs both steps (continue-across-steps) and prints a per-rail summary. Report the latest Fear & Greed `value`/band and the coin's USD quote.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `symbol` | no | `BTC` | Coin symbol for the CoinMarketCap quote |
| `start_time` | yes | — | Fear & Greed window start, Unix seconds (UTC) |
| `end_time` | yes | — | Fear & Greed window end, Unix seconds (UTC), > `start_time` |

Outputs:
- Step 1: `{ "data": [ { "timestamp", "value" (0–100), "time" } ] }` — newest entry is current sentiment (0–25 Extreme Fear … 75–100 Extreme Greed).
- Step 2: a CoinMarketCap `quotes/latest` payload; read `data.<SYMBOL>.quote.USD.price`.

## Gotchas

- `start_time`/`end_time` are **required** Unix **seconds** (not ms), `end_time` > `start_time`; otherwise the sentiment upstream returns HTTP 400 even though payment settled.
- The routed leg needs `SELAT_ROUTER_URL` set and the router reachable; the direct leg does not.
- Steps run independently (continue-across-steps): one rail can succeed while the other fails — check the summary.
- Caps: $0.01 (direct) + $0.02 (routed); a full run costs ≈ $0.019.

## Validation

- Probe (no pay):
  - `selat-pay GET "https://x402-data-tools.prd.arrays.org/api/v1/crypto/fear-greed-index" --chain base --probe-only` → `mode=direct`
  - `selat-pay GET "https://pro-api.coinmarketcap.com/x402/v3/cryptocurrency/quotes/latest?symbol=BTC" --chain base --probe-only` → `mode=routed-x402`
- A successful run prints `status=200` for both steps and a ✓ summary for both rails (verified live).

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoints this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
