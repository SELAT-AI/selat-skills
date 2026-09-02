---
name: stock-direction-signals
description: Use this skill when the user wants a bullish, bearish, or mixed directional read on a US stock — e.g. "is NVDA bullish or bearish right now", "give me a directional read on AAPL", "is MAG7 sentiment turning", "what do the chart, news, and social say about AMD", "signal brief on SPY". Covers MAG7 names, semiconductor and AI-infrastructure stocks, tokenized-stock watchlists, and index proxies like SPY/QQQ. Composes only Alpha Vantage MPP (price, technicals, news, earnings), SELAT-native Twitter (social chatter), Circle StableEnrich (Reddit), and Circle Otto (TradFi macro) into a non-advisory signal brief. Pays per call via selat-pay (USDC via Circle Gateway), no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet (the runner pays on whichever chain holds Gateway USDC). Every step routes through the SELAT Router across three rails (`x402 via Circle Gateway`, `x402 on Base`, `MPP on Tempo`), so a reachable SELAT Router is required. `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
  kind: multi
---

# stock-direction-signals

Directional research on one US equity ticker or index proxy. The skill gathers
paid signal from a **fixed provider filter** — Alpha Vantage MPP (quote, chart,
RSI, MACD, news sentiment, earnings), SELAT-native Twitter (raw chatter), Circle
StableEnrich (Reddit threads), and Circle Otto (TradFi macro regime) — and the
agent fuses it into one brief: verdict (bullish / bearish / mixed / insufficient
data), confidence, the technical setup, catalysts, social sentiment, macro
backdrop, and the contrarian risks that would invalidate the read. Research
only — never trade execution or financial advice.

## When To Use

Use when a user asks whether a ticker looks bullish, bearish, or mixed over a
short or medium horizon and the answer needs live market context plus social or
news sentiment — MAG7 names, semiconductor and AI-infrastructure stocks,
tokenized-stock watchlists, or index proxies like SPY and QQQ.

Do not use for trade execution, portfolio advice, or any request that should
place an order. This skill only gathers paid data and synthesizes a research
brief; if the user asks to trade on the result, decline that part and say so.

## Rails

This skill spans **three settlement modes**, so the skill's `rail` is `mixed`:

- **x402 via Circle Gateway** — SELAT-native Twitter (`catalog.selat.ai`)
  settles `x402 via Circle Gateway` through the SELAT Router.
- **x402 on Base** — Circle Otto (`x402.ottoai.services`) settles
  `x402 on Base` through the SELAT Router.
- **MPP on Tempo** — the six Alpha Vantage steps
  (`alphavantage.mpp.paywithlocus.com`) and Circle StableEnrich
  (`stableenrich.dev`) settle `MPP on Tempo` through the SELAT Router.

The `selat` CLI auto-detects each step's protocol and settlement mode at call
time. The runner pays on whichever chain holds Gateway USDC — rail names are
not a pay-chain claim. A reachable SELAT Router is required.

## Workflow

1. Install: `selat skill install stock-direction-signals`
2. Run end-to-end:
   `selat skill run stock-direction-signals --ticker <TICKER> --twitter_query "<query>" --reddit_query "<query>"`
3. The CLI compiles each step into a `selat-pay` call and prints each result.

Before running, tell the user what it costs: a full run quotes at roughly
**$0.08** live (nine paid calls, capped at $0.25 total) — say "this pulls nine
paid data feeds for about eight cents — proceed?" and wait for a yes before
spending. Afterwards, report what was actually spent.

Recommended agent procedure (manifest steps are ordered cheapest-first; retarget
all three params to the user's ticker — never let the NVDA defaults run for a
different company):

1. **Normalize the request** into `ticker`, `twitter_query`, `reddit_query`, and
   a horizon (intraday / week / month / quarter). Preserve the user's ticker
   exactly; expand obvious company names into their tickers. Fold company and
   product names into the two query params (e.g. `$NVDA OR NVIDIA OR Blackwell`).
2. **Social pulse** — SELAT-native Twitter advanced search (~$0.001). Raw
   evidence only: the agent scores tone, intensity, recency, and engagement
   quality itself.
3. **Macro regime** — Circle Otto `tradfi-data` (~$0.001–0.005): indices, VIX,
   DXY, yields, commodities, and quote context for risk-on/risk-off framing.
4. **Market core** — Alpha Vantage global-quote, time-series-daily, RSI, MACD
   (~$0.008 each): last price, chart trend, momentum, and trend acceleration.
5. **Catalysts** — Alpha Vantage news-sentiment and earnings (~$0.008 each):
   news tone, catalyst clustering, earnings surprise history.
6. **Retail texture** — Circle StableEnrich Reddit search (~$0.02): community
   debate and long-form reactions; weight recency, comment quality, and claims
   repeated across communities.
7. **Synthesize** a compact brief: verdict, confidence, price and technical
   setup, catalysts and fundamentals, social sentiment, macro/regime, contrarian
   risks, and source notes. Label it bullish, bearish, mixed, or insufficient
   data — and say what would invalidate it.

Relay the brief in plain language with the dollar cost of the run; keep endpoint
URLs and raw response JSON out of what the user sees. When the user only wants a
subset (e.g. no social), run the individual steps with `selat-pay` instead of the
full manifest. For multiple tickers, repeat the run per ticker.

For deeper dives, the provider filter also offers optional endpoints not in the
manifest (intraday/weekly/monthly series, SMA/EMA/BBANDS, earnings-call
transcripts, financial statements, tweet replies, Reddit post comments, Otto
derivatives context) — see `references/endpoints.md`; call them individually via
`selat-pay` within the same provider filter.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `ticker` | yes | `NVDA` | US equity ticker or index proxy. Always pass explicitly. |
| `twitter_query` | no | `$NVDA OR NVIDIA` | Twitter advanced-search query; widen with company/product terms. |
| `reddit_query` | no | `NVDA stock` | StableEnrich Reddit query; add company/product terms. |

Output: per-step JSON (tweets, macro data, quote, OHLCV series, RSI, MACD, news
sentiment, earnings history, Reddit posts) that the agent fuses into a
non-advisory directional brief — what moved the signal, what would invalidate
it, and which paid endpoints were used.

## Gotchas

- **The provider filter is the skill.** Use only Alpha Vantage MPP, SELAT-native
  Twitter, Circle StableEnrich, and Circle Otto. Do not substitute AIsa,
  BlockRun, Serper, Apollo, Exa, CoinGecko, Nansen, or other catalogue matches
  even if they rank higher.
- **Retarget the defaults.** All three params default to NVDA-flavored values so
  `verify` can exercise every step; a run for any other ticker must override all
  three or the social steps research the wrong company.
- **Alpha Vantage steps are POST — params go in `body`**, keyed by `symbol`
  (indicators also need `interval`/`series_type`, RSI adds `time_period`).
  `news-sentiment` keys on `tickers` (plural) — and its `topics` field takes a
  fixed topic enum, not a company name, so this manifest omits it.
- **SELAT-native Twitter returns raw social objects.** Never claim a finished
  sentiment score unless the response explicitly includes one; the scoring is
  the agent's job.
- **Reddit is noisy and momentum-skewed.** Use it for thesis texture; weight
  recency, comment quality, and repetition across communities.
- **Otto is macro-first here.** `tradfi-data` is the default; use Otto's
  crypto/perp endpoints only when the user explicitly connects the stock to
  tokenized equity, crypto beta, or derivatives spillover.
- **`maxAmount` is a guardrail, not the price.** Per-step caps ($0.01–$0.04,
  $0.25 full-run) sit well above live quotes (measured full run ≈ $0.0756);
  gateway prices can run above the catalogue listing.
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

- Static: `selat skill validate ./skills/stock-direction-signals`
- Live gate (free): `selat skill verify ./skills/stock-direction-signals --ticker NVDA --twitter_query "\$NVDA OR NVIDIA" --reddit_query "NVDA stock"`
- Paid confirm (settles real 200s): add `--pay` to the verify command.
- Single-step probe (no pay):
  `selat-pay POST "https://alphavantage.mpp.paywithlocus.com/alphavantage/global-quote" --body '{"symbol":"NVDA"}' --chain base --probe-only`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the provider-filtered catalogue endpoints, request shapes, and prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
