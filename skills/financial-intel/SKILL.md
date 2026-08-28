---
name: financial-intel
description: Use this skill when the user wants a multi-signal financial intelligence brief on a crypto asset, token, or equity ticker — e.g. "give me a full read on ETH", "what's the market intel on <token>", "fuse price + on-chain + news on <asset>", "smart-money + news brief for <coin>", "macro + equities + crypto snapshot on <ticker>", "is <asset> a buy right now". Fuses spot price (Alchemy), token market data (CoinGecko), macro/equities (Alpha Vantage), on-chain smart-money (Nansen), and market news (Exa) across two payment rails. Pays per call via selat-pay (USDC via Circle Gateway), no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet. The SELAT Router steps (CoinGecko, Alpha Vantage, Nansen, Exa) need a reachable SELAT Router (SELAT_ROUTER_URL); the Circle-Gateway Alchemy step does not. `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.3"
  rail: mixed
  kind: multi
---

# financial-intel

Multi-signal financial intelligence on a crypto asset, token, or equity ticker.
The skill gathers paid signal across **two settlement modes** — a Circle
Gateway-batched nanopayment (`x402 via Circle Gateway`, Alchemy) and **MPP on
Tempo** (CoinGecko, Alpha Vantage, Nansen, Exa) — and the agent
fuses it into one brief: what the asset costs, how its market is behaving, what
macro/equities are doing, where smart money sits on-chain, and the latest
market news — with citations.

## When To Use

Use when the user wants a cross-source financial read on a single asset that
spans more than one signal: live price, token market data, macro/equity context,
on-chain smart-money positioning, and current news.
Pick this over a single-source price or news lookup when the value is in *fusing*
signals across providers and rails. Every API call is a paid x402/MPP service; the
agent does the synthesis, the sanity-checks, and the buy/hold/avoid read around
the paid data.

## Rails

This skill spans **two settlement modes**:

- **Circle Gateway nanopayment** — Alchemy spot price (`x402.alchemy.com`) settles
  `x402 via Circle Gateway`: a Circle Gateway-batched nanopayment paid straight to the
  upstream, **no router hop**. This step does **not** require `SELAT_ROUTER_URL`.
- **MPP on Tempo** — CoinGecko, Alpha Vantage, Nansen, and Exa settle `MPP on
  Tempo` through the SELAT Router.

The SELAT Router steps require a reachable `SELAT_ROUTER_URL`. The `selat` CLI
auto-detects each step's protocol and settlement mode at call time. Because the
skill mixes Circle-Gateway and SELAT Router steps, its `rail` is `mixed`.

## Workflow

1. Install: `selat skill install financial-intel`
2. Run end-to-end:
   `selat skill run financial-intel --symbol <symbol> --coin <coin> --ticker <ticker> --chain <chain> --query "<query>"`
3. The CLI compiles each step into a `selat-pay` call and prints each result.

Recommended agent procedure (cheapest-first; stop early when the picture is clear):

1. **Get the spot price** — Alchemy `GET /prices/v1/tokens/by-symbol`
   (Circle Gateway nanopayment, ~$0.001). Anchor every other signal to live price.
2. **Add token market data** — CoinGecko `POST /coingecko/coins-markets`
   (MPP on Tempo, ~$0.063): market cap, volume, supply, 24h/7d moves.
3. **Add macro/equities context** — Alpha Vantage `POST /alphavantage/global-quote`
   (MPP on Tempo, ~$0.0084) for the named equity ticker; use as a risk-on/risk-off read.
4. **Read on-chain smart money** — Nansen `POST /api/v1/smart-money/holdings`
   (MPP on Tempo, ~$0.0525) for the named chain; surface where labeled smart wallets sit.
5. **Add market news/context** — Exa `POST /search`
   (MPP on Tempo, ~$0.007); surface the headlines that move the read.

Then synthesize: a price-and-market snapshot, the macro backdrop, the on-chain
smart-money posture, and the news that confirms or contradicts the data — with
source URLs and a clear, hedged read.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `symbol` | yes | `ETH` | Token symbol (no `$`) for the Alchemy spot-price lookup. |
| `coin` | no | `ethereum` | CoinGecko coin id (lowercase slug) for token market data. |
| `ticker` | no | `AAPL` | Equity ticker for the Alpha Vantage macro/equities quote. |
| `chain` | no | `ethereum` | Chain name for the Nansen smart-money holdings query. |
| `query` | no | `ethereum ETF flows` | Free-text search for the Exa market-news/context step. |

Output: per-step JSON (spot price, token market metrics, an equity quote,
smart-money holdings, and news results with text snippets + URLs)
that the agent fuses into a single multi-signal financial intelligence brief.

## Gotchas

- **Two rails, mixed settlement.** Alchemy settles `x402 via Circle Gateway` (no router);
  CoinGecko/Alpha Vantage/Nansen/Exa settle `MPP on Tempo`. A reachable
  `SELAT_ROUTER_URL` is required for every step **except** the Circle-Gateway
  Alchemy step.
- **Nansen's MPP challenge is gated — a bare probe sees x402 only.** The live
  host is dual-protocol: a plain request 402s with only the x402 challenge,
  and the MPP `WWW-Authenticate: Payment` (method `tempo`) surfaces only when
  probed with an `Authorization: Payment` header — exactly what selat-pay's
  probe 2 sends. Don't conclude "x402-only" (and flip the rail) from a bare
  probe; the MPP registry listing is accurate, and a routed-MPP charge settles
  live (verified 2026-08-13, $0.0525, HTTP 200). Its body takes `chains` (an
  array), not `chain` — the step passes `{"chains": ["${chain}"]}`; the old
  `{"chain": ...}` body was the actual cause of the paid-run 422s.
- **GET params in the query, POST params in `body`.** Alchemy is GET;
  CoinGecko, Alpha Vantage, Nansen, and Exa are POST — their params go in the body.
- **`maxAmount` is a guardrail, not the price.** Per-step caps run from `$0.01`
  (Alchemy) to `$0.10` (CoinGecko, Nansen); the full-run cap is `$1.00`. Live quotes:
  Alchemy ~$0.001, CoinGecko ~$0.063, Alpha Vantage ~$0.0084, Nansen ~$0.0525,
  Exa ~$0.007 (live total ≈ $0.13).
- **Pass `--coin` / `--ticker` / `--chain` / `--query`** to retarget the per-asset
  steps; `--symbol` keys the spot-price step.
- **The live 402 is the source of truth.** If a step stops serving a challenge,
  `selat skill verify` flags it — omit it and re-add when the gateway serves it.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/financial-intel`
- Live gate (free): `selat skill verify ./skills/financial-intel --symbol ETH --coin ethereum --ticker AAPL --chain ethereum --query "ethereum ETF flows"`
- Paid confirm (settles real 200s): add `--pay` to the verify command.
- Single-step probe (no pay):
  `selat-pay GET "https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH" --chain base --probe-only`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoints, rails, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
