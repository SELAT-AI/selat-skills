# Endpoints — financial-intel

Multi-signal financial intelligence across **two settlement modes** from the
SELAT federated catalogue: a Circle Gateway-batched nanopayment
(`x402 via Circle Gateway`, Alchemy) and **MPP on Tempo** (CoinGecko, Alpha
Vantage, Nansen, Exa). Paid per call via selat-pay
(USDC via Circle Gateway), no API keys.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | Spot price — Alchemy | GET | `https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=${symbol}` | x402 via Circle Gateway | $0.001 |
| 2 | Token market data — CoinGecko | POST | `https://coingecko.mpp.paywithlocus.com/coingecko/coins-markets` | MPP on Tempo | $0.063 |
| 3 | Equities / macro quote — Alpha Vantage | POST | `https://alphavantage.mpp.paywithlocus.com/alphavantage/global-quote` | MPP on Tempo | $0.0084 |
| 4 | On-chain smart-money holdings — Nansen | POST | `https://api.nansen.ai/api/v1/smart-money/holdings` | MPP on Tempo | $0.0525 |
| 5 | Market news / context — Exa | POST | `https://api.exa.ai/search` | MPP on Tempo | $0.00735 |

Full-run cap (`maxAmount`): **$1.00**; per-step caps range **$0.01–$0.10**. Live total ≈ $0.13.

## Rails & providers

This skill mixes a Circle Gateway nanopayment with MPP (`rail: mixed`).

- **Circle Gateway nanopayment** — Alchemy (`x402.alchemy.com`) serves an x402 challenge
  that settles as a Circle Gateway-batched nanopayment paid **straight to the
  upstream** (`x402 via Circle Gateway`), **no router hop**. This step does not require
  `SELAT_ROUTER_URL`.
- **MPP on Tempo** — CoinGecko (`coingecko.mpp.paywithlocus.com`), Alpha Vantage
  (`alphavantage.mpp.paywithlocus.com`), Nansen (`api.nansen.ai`), and Exa
  (`api.exa.ai`) settle MPP through the SELAT Router (`MPP on Tempo`). Sourced
  from the MPP catalog. Note: Nansen is dual-protocol with a **gated** MPP
  challenge — a bare probe 402s with x402 only, and the MPP
  `WWW-Authenticate: Payment` (method `tempo`) surfaces only under an
  `Authorization: Payment` probe (selat-pay's probe 2 sends it). The registry
  listing is accurate; a routed-MPP charge settles live (verified 2026-08-13,
  $0.0525, HTTP 200).

## Live probes (free; no wallet)

```bash
# Circle Gateway nanopayment (GET query)
selat-pay GET "https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH" \
  --chain base --probe-only

# MPP on Tempo (POST body)
selat-pay POST "https://coingecko.mpp.paywithlocus.com/coingecko/coins-markets" \
  --body '{"vs_currency":"usd","ids":"ethereum"}' --chain base --probe-only
selat-pay POST "https://alphavantage.mpp.paywithlocus.com/alphavantage/global-quote" \
  --body '{"symbol":"AAPL"}' --chain base --probe-only
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"ethereum ETF flows","numResults":5}' --chain base --probe-only

selat-pay POST "https://api.nansen.ai/api/v1/smart-money/holdings" \
  --body '{"chains":["ethereum"]}' --chain base --probe-only  # note `chains` is an array
```

A served endpoint prints `detected ... price=$X on eip155:8453`. The Alchemy step
shows `x402 via Circle Gateway`; CoinGecko/Alpha Vantage/Nansen/Exa show
`MPP on Tempo` (Nansen via the dual-protocol probe 2 — `mode=routed-mpp`).
