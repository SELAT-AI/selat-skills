# Endpoints

Provider filter: **Circle Otto AI** (`x402.ottoai.services`) — first-party x402
endpoints, settled `routed-x402` via the SELAT Router (Base or Polygon).

Prices below are live probe quotes from `selat-pay --probe-only` (2026-08-15);
gateway prices can run a few percent above the catalogue listing. `maxAmount`
in the manifest is a guardrail above these.

## In the manifest

| Step | Method | URL | Price (live) | Rail |
|---|---|---|---|---|
| token details | GET | `https://x402.ottoai.services/token-details?symbol=${symbol}` | ~$0.00105 | x402 on Base |
| market recap | GET | `https://x402.ottoai.services/news-recaps` | ~$0.00315 | x402 on Base |
| news sentiment | GET | `https://x402.ottoai.services/crypto-news` | ~$0.00105 | x402 on Base |
| alpha intelligence | GET | `https://x402.ottoai.services/token-alpha?symbol=${symbol}` | ~$0.00525 | x402 on Base |

Full run: ~$0.011 (four paid calls, capped at $0.05 total).

## Request shapes

- `token-details`: query `symbol` (required, string) — token symbol, e.g. `BTC`.
  Returns price, market cap, volume, supply, basic metrics.
- `token-alpha`: query `symbol` (required, string) — token symbol. Returns
  price action, performance windows, derivatives (OI, funding, liquidations,
  order flow, positioning), 4h technicals (RSI, EMA, MACD, Bollinger), and an
  AI-enhanced intelligence report.
- `crypto-news`: no params. Returns sentiment-ranked headlines and top stories.
- `news-recaps`: no params. Returns a 4-6 sentence hourly market recap.

## Available but not in the manifest (optional single calls)

| Endpoint | Method | Price | Notes |
|---|---|---|---|
| `https://x402.ottoai.services/tweet-search?query=<q>` | GET | ~$0.005 | Real X/Twitter search: keyword, $CASHTAG, from:/@handle, boolean OR |
| `https://x402.ottoai.services/twitter-summary` | GET | ~$0.001 | Curated crypto Twitter digest |
| `https://x402.ottoai.services/filtered-news?topic=<t>` | GET | ~$0.001 | AI-filtered news by topic (max 2 words) |
| `https://x402.ottoai.services/base-ecosystem-news` | GET | ~$0.001 | Base-chain ecosystem news, AI-filtered |

Call these individually via `selat-pay` when the user wants a narrower slice
than the full manifest (e.g. `tweet-search "$HYPE OR Hyperliquid"` for raw
social evidence).

## Verification notes

- All in-manifest endpoints probed 2026-08-15: `detected: x402=yes mpp=no;
  mode=routed-x402`, quote on `eip155:8453` (Base) and `eip155:137` (Polygon).
- Otto is a first-party provider — prefer over proxies (cheaper/equal, real
  identity and recourse).
