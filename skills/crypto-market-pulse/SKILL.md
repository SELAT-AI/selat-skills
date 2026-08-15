---
name: crypto-market-pulse
description: Use this skill when the user wants a fast market pulse on any listed crypto token — e.g. "is HYPE bullish right now", "quick pulse check on SOL", "what's moving BTC this hour", "market recap + sentiment on ETH". Composes four Circle Otto AI endpoints (token-details, token-alpha, crypto-news, news-recaps) into a compact non-advisory brief covering price and volume snapshot, derivatives positioning (OI, funding, order flow), technical read, and sentiment-ranked news. Pays per call via selat-pay (USDC via Circle Gateway), no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet. Every step settles through the SELAT Router (x402 on Base or Polygon), so a reachable SELAT Router is required. `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: YHlorra
  version: "1.0"
  rail: routed
  kind: multi
---

# crypto-market-pulse

One-command market pulse for any listed crypto token. The skill gathers paid
signal from **one provider filter — Circle Otto AI's x402 endpoints** (token
details, alpha intelligence, live news, hourly recap) — and the agent fuses it
into one brief: price snapshot, derivatives positioning, technical read,
sentiment, and the market backdrop. Research only — never trade execution or
financial advice.

## When To Use

Use when a user asks for a quick pulse check or directional read on a listed
crypto token and needs live market context plus news sentiment — e.g. "is HYPE
bullish right now", "pulse on SOL", "what moved BTC this hour". Works for any
token symbol Otto's indexer covers (BTC, ETH, SOL, HYPE, and other listed
tokens).

Do not use for trade execution, portfolio advice, or any request that should
place an order. This skill only gathers paid data and synthesizes a research
brief; if the user asks to trade on the result, decline that part and say so.

## Rails

All four steps are **Circle Otto AI first-party x402** endpoints
(`x402.ottoai.services`) that settle `routed-x402` through the SELAT Router on
Base or Polygon (live-probe detections from `selat skill verify`). The
settlement chain is resolved at runtime from the wallet's funded Gateway
balance; the manifest declares none.

## Workflow

1. Install: `selat skill install crypto-market-pulse`
2. Run end-to-end:
   `selat skill run crypto-market-pulse --symbol <SYMBOL>`
3. The CLI compiles each step into a `selat-pay` call and prints each result.

Before running, tell the user what it costs: a full run quotes at roughly
**$0.011** live (four paid calls, capped at $0.05 total) — say "this pulls four
paid data feeds for about a cent — proceed?" and wait for a yes before spending.
Afterwards, report what was actually spent.

Recommended agent procedure (manifest steps are ordered cheapest-first;
always pass the user's symbol explicitly — never let the BTC default run for a
different token):

1. **Normalize the request** into `symbol` and a horizon (now / day / week).
   Preserve the user's symbol exactly; map common names to tickers (e.g.
   "bitcoin" → BTC, "hyperliquid" → HYPE).
2. **Token snapshot** — Otto `token-details` (~$0.001): price, market cap,
   volume, supply, basic metrics.
3. **Market backdrop** — Otto `news-recaps` (~$0.003): the 4-6 sentence hourly
   state-of-market recap.
4. **Sentiment** — Otto `crypto-news` (~$0.001): sentiment-ranked headlines.
5. **Alpha read** — Otto `token-alpha` (~$0.005): derivatives (OI, funding,
   order flow, liquidations, positioning), 4h technicals, and the AI-enhanced
   intelligence report.
6. **Synthesize** a compact brief: verdict (bullish / bearish / mixed /
   insufficient data), confidence, price snapshot, derivatives positioning,
   technical read, sentiment, market backdrop, and the contrarian risks that
   would invalidate it. Label it non-advisory.

Relay the brief in plain language with the dollar cost of the run; keep
endpoint URLs and raw response JSON out of what the user sees. When the user
only wants a subset (e.g. price only), run the individual steps with
`selat-pay` instead of the full manifest. For multiple tokens, repeat the run
per token.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `symbol` | yes | `BTC` | Token symbol (e.g. BTC, ETH, SOL, HYPE). Always pass explicitly. |

Output: per-step JSON (token metrics, market recap, news headlines with
sentiment, derivatives + technicals + intelligence report) that the agent fuses
into a non-advisory market pulse — what moved the signal, what would invalidate
it, and which paid endpoints were used.

## Gotchas

- **The provider filter is the skill.** Use only Circle Otto AI x402 endpoints
  (`x402.ottoai.services`). Do not substitute other catalogue matches even if
  they rank higher — the filter keeps this skill cheap, first-party, and
  verified.
- **Retarget the default.** `symbol` defaults to BTC so `verify` can exercise
  every step; a run for any other token must override it or the research
  targets the wrong asset.
- **All steps are GET; the symbol goes in the query string.** `token-details`
  and `token-alpha` take `?symbol=`; `news-recaps` and `crypto-news` take no
  params (market-wide).
- **`token-alpha` returns the raw report.** Never claim a finished directional
  score unless the response explicitly includes one; the verdict is the
  agent's synthesis job.
- **`maxAmount` is a guardrail, not the price.** Per-step caps ($0.005–$0.02,
  $0.05 full-run) sit above live quotes (measured full run ≈ $0.011); gateway
  prices can run above the catalogue listing.
- **The live 402 is the source of truth.** If a step stops serving a challenge
  or the live price drifts, `selat skill verify` flags it — report the live
  response and adapt within the provider filter only.
- **Non-advisory, always.** The brief can support a bullish or bearish thesis
  but must never be presented as financial advice or a guaranteed prediction.

## Validation

> `--chain base` in the probe command below is only the flag `selat-pay`
> requires today — a probe reads a free, chain-independent quote and never
> settles. A real paid run resolves the settlement chain from your funded Circle
> Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/crypto-market-pulse`
- Live gate (free): `selat skill verify ./skills/crypto-market-pulse --symbol BTC`
- Paid confirm (settles real 200s): add `--pay` to the verify command.
- Single-step probe (no pay):
  `selat-pay GET "https://x402.ottoai.services/token-details?symbol=BTC" --chain base --max-amount 0.005 --probe-only`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the provider-filtered
  catalogue endpoints, request shapes, and prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
