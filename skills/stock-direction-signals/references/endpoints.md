# Endpoints — stock-direction-signals

Use only these endpoint families for `stock-direction-signals`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Twitter chatter | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${twitter_query}&queryType=Latest` | x402 via Circle Gateway | $0.001 |
| 2 — Macro regime | GET | `https://x402.ottoai.services/tradfi-data?symbol=${ticker}` | x402 on Base | $0.00315 |
| 3 — Quote | POST | `https://alphavantage.mpp.paywithlocus.com/alphavantage/global-quote` | MPP on Tempo | $0.0084 |
| 4 — Daily chart | POST | `https://alphavantage.mpp.paywithlocus.com/alphavantage/time-series-daily` | MPP on Tempo | $0.0084 |
| 5 — RSI | POST | `https://alphavantage.mpp.paywithlocus.com/alphavantage/rsi` | MPP on Tempo | $0.0084 |
| 6 — MACD | POST | `https://alphavantage.mpp.paywithlocus.com/alphavantage/macd` | MPP on Tempo | $0.0084 |
| 7 — News | POST | `https://alphavantage.mpp.paywithlocus.com/alphavantage/news-sentiment` | MPP on Tempo | $0.0084 |
| 8 — Earnings | POST | `https://alphavantage.mpp.paywithlocus.com/alphavantage/earnings` | MPP on Tempo | $0.0084 |
| 9 — Reddit | POST | `https://stableenrich.dev/api/reddit/search` | MPP on Tempo | $0.021 |

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 on Base / Polygon:** Settles via Circle Gateway batched nanopayments. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** Alpha Vantage via Locus (`alphavantage.mpp.paywithlocus.com`). Circle StableEnrich (`stableenrich.dev`) is MPP on Tempo but not Locus.

## Alpha Vantage MPP — `MPP on Tempo`

serviceUrl: `https://alphavantage.mpp.paywithlocus.com`

Live-probed price: `$0.0084` per call (`routed-mpp`). All endpoints are **POST
with a JSON body** — never query-string params.

Endpoints used by the manifest:

| Step | Endpoint | Body params |
| --- | --- | --- |
| quote | `/alphavantage/global-quote` | `symbol` (string, required) |
| daily chart | `/alphavantage/time-series-daily` | `symbol` (string, required) |
| momentum | `/alphavantage/rsi` | `symbol` (string, required), `interval` (enum: `daily`/`weekly`/`monthly`/intraday intervals, required), `time_period` (integer, required), `series_type` (enum: `close`/`open`/`high`/`low`, required) |
| trend | `/alphavantage/macd` | `symbol` (string, required), `interval` (enum, required), `series_type` (enum, required) |
| catalysts | `/alphavantage/news-sentiment` | `tickers` (string, comma-separated), `limit` (integer, optional). `topics` exists but takes a fixed topic enum (`technology`, `earnings`, `ipo`, …) — do not pass a company name. |
| earnings | `/alphavantage/earnings` | `symbol` (string, required) |

Optional escalation endpoints (same host, same body patterns — call via
`selat-pay` when the request needs them):

| Capability | Endpoint | Use |
| --- | --- | --- |
| Intraday chart | `/alphavantage/time-series-intraday` | Short-horizon moves and event-day context. |
| Weekly chart | `/alphavantage/time-series-weekly` | Medium-term trend confirmation. |
| Monthly chart | `/alphavantage/time-series-monthly` | Long-term regime and drawdown context. |
| SMA / EMA | `/alphavantage/sma`, `/alphavantage/ema` | Moving-average trend, crossovers, momentum filter. |
| BBANDS | `/alphavantage/bbands` | Volatility bands, squeeze, breakout context. |
| Earnings transcript | `/alphavantage/earnings-call-transcript` | Management tone and guidance details. |
| Income statement | `/alphavantage/income-statement` | Revenue, margin, operating trend. |
| Balance sheet | `/alphavantage/balance-sheet` | Liquidity, debt, asset quality. |
| Cash flow | `/alphavantage/cash-flow` | Free-cash-flow and capex context. |
| Market status | `/alphavantage/market-status` | Session and venue status. |
| Top gainers/losers | `/alphavantage/top-gainers-losers` | Breadth and peer momentum screen. |

Indicator body pattern:

```json
{ "symbol": "NVDA", "interval": "daily", "time_period": 14, "series_type": "close" }
```

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`). All endpoints are **GET
with query-string params**.

| Capability | Endpoint | Query params |
| --- | --- | --- |
| Advanced search (manifest step) | `/twitter/tweet/advanced_search` | `query` (string, required), `queryType` (enum: `Latest`/`Top`) |
| Tweet lookup | `/twitter/tweets` | `tweet_ids` (comma-separated string) |
| Tweet replies | `/twitter/tweet/replies` | `tweetId` (string) |
| User mentions | `/twitter/user/mentions` | `userName` (string) |
| Trends | `/twitter/trends` | `woeid` (integer) |

Query pattern:

```text
https://catalog.selat.ai/twitter/tweet/advanced_search?query=$NVDA%20OR%20NVIDIA%20OR%20Blackwell&queryType=Latest
```

Responses are raw tweet objects — no sentiment score is included.

## Circle StableEnrich — `MPP on Tempo`

serviceUrl: `https://stableenrich.dev`

Live-probed price: `$0.021` for Reddit search (`routed-mpp`); Serper news
around `$0.04`. All endpoints are **POST with a JSON body**.

| Capability | Endpoint | Body params |
| --- | --- | --- |
| Reddit search (manifest step) | `/api/reddit/search` | `query` (string, required) |
| Reddit comments | `/api/reddit/post-comments` | post identifier from a search result |
| News search | `/api/serper/news` | `query` (string) — backup only; Alpha Vantage already covers news sentiment |

## Circle Otto — `x402 on Base`

serviceUrl: `https://x402.ottoai.services`

Live-probed price: `$0.00315` for `tradfi-data` (`routed-x402`); other
endpoints `$0.001`–`$0.005`, `mega-report` ≈ `$0.05`. All endpoints are **GET
with query-string params**.

| Capability | Endpoint | Query params |
| --- | --- | --- |
| TradFi macro (manifest step) | `/tradfi-data` | `symbol` (string) — indices, VIX, DXY, yields, commodities, stock quote/MA context |
| Twitter summary | `/twitter-summary` | topic (optional social overview) |
| Funding rates | `/funding-rates` | derivatives context for tokenized-stock / crypto-beta names |
| Hyperliquid market | `/hyperliquid-market` | perp venue context for tokenized-equity watchlists |
| Token alpha | `/token-alpha` | token-market signal when the thesis explicitly includes crypto beta |
| Mega report | `/mega-report` | broad crypto-market context only when the thesis depends on crypto regime |

For ordinary equity direction, call `tradfi-data` first and skip the
crypto-specific Otto endpoints unless the user asks.
