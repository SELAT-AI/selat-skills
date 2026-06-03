# Endpoints — crypto-sentiment-snapshot

Multi-rail: one direct leg + one routed-x402 leg.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 · market sentiment | GET | `https://x402-data-tools.prd.arrays.org/api/v1/crypto/fear-greed-index?start_time=${start_time}&end_time=${end_time}` | direct (Gateway-batched) | $0.008 |
| 2 · price quote | GET | `https://pro-api.coinmarketcap.com/x402/v3/cryptocurrency/quotes/latest?symbol=${symbol}` | routed (erc-3009 / x402) | $0.0105 |

- **Step 1 — Arrays:** Circle nanopayment, paid directly to the upstream. `start_time`/`end_time` are Unix **seconds** (UTC), `end_time` > `start_time`.
- **Step 2 — CoinMarketCap:** routed via the SELAT Router, which translates the inbound Gateway-batched payment into the upstream's erc-3009 scheme. Read `data.<SYMBOL>.quote.USD.price`.
