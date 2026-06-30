# Endpoints — financial-intel

Multi-signal financial intelligence across **three settlement modes** from the
SELAT federated catalogue: a **direct** Circle Gateway-batched nanopayment
(Alchemy), **routed MPP** (CoinGecko, Alpha Vantage, Nansen), and **routed x402
on Base** (Messari, Exa). Paid per call via selat-pay (USDC via Circle Gateway),
no API keys.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | Spot price — Alchemy | GET | `https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=${symbol}` | direct nanopayment (Circle Gateway-batched) | $0.001 |
| 2 | Token market data — CoinGecko | POST | `https://coingecko.mpp.paywithlocus.com/coingecko/coins-markets` | routed MPP | $0.063 |
| 3 | Equities / macro quote — Alpha Vantage | POST | `https://alphavantage.mpp.paywithlocus.com/alphavantage/global-quote` | routed MPP | $0.0084 |
| 4 | On-chain smart-money holdings — Nansen | POST | `https://api.nansen.ai/api/v1/smart-money/holdings` | routed MPP | $0.0525 |
| 5 | Fundamentals / funding rounds — Messari | GET | `https://api.messari.io/funding/v1/rounds` | routed x402 (Base) | $0.1575 |
| 6 | Market news / context — Exa | POST | `https://api.exa.ai/search` | routed x402 (Base) | $0.007 |

Full-run cap (`maxAmount`): **$1.00**; per-step caps range **$0.01–$0.25**. Live total ≈ $0.29.

## Rails & providers

This skill mixes a direct nanopayment with two routed protocols (`rail: mixed`).

- **direct nanopayment** — Alchemy (`x402.alchemy.com`) serves an x402 challenge
  that settles as a Circle Gateway-batched nanopayment paid **straight to the
  upstream** (`mode=direct`), **no router hop**. This step does not require
  `SELAT_ROUTER_URL`.
- **routed MPP** — CoinGecko (`coingecko.mpp.paywithlocus.com`), Alpha Vantage
  (`alphavantage.mpp.paywithlocus.com`), and Nansen (`api.nansen.ai`) settle MPP
  through the SELAT Router (`mode=routed-mpp`). Sourced from the MPP catalog.
- **routed x402 on Base** — Messari (`api.messari.io`) and Exa (`api.exa.ai`)
  serve native x402 challenges; the router settles them on Base
  (`mode=routed-x402`). Sourced from the Agentic Market / x402 catalogs.

## Live probes (free; no wallet)

```bash
# direct nanopayment (GET query)
selat-pay GET "https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH" \
  --chain base --probe-only

# routed MPP (POST body)
selat-pay POST "https://coingecko.mpp.paywithlocus.com/coingecko/coins-markets" \
  --body '{"vs_currency":"usd","ids":"ethereum"}' --chain base --probe-only
selat-pay POST "https://alphavantage.mpp.paywithlocus.com/alphavantage/global-quote" \
  --body '{"symbol":"AAPL"}' --chain base --probe-only
selat-pay POST "https://api.nansen.ai/api/v1/smart-money/holdings" \
  --body '{"chain":"ethereum"}' --chain base --probe-only

# routed x402 on Base
selat-pay GET "https://api.messari.io/funding/v1/rounds" --chain base --probe-only
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"ethereum ETF flows","numResults":5}' --chain base --probe-only
```

A served endpoint prints `detected ... price=$X on eip155:8453`. The Alchemy step
shows `mode=direct`; CoinGecko/Alpha Vantage/Nansen show `mode=routed-mpp`;
Messari/Exa show `mode=routed-x402`.
