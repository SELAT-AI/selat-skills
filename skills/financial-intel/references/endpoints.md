# Endpoints — financial-intel

This skill is a fixed five-call, read-only crypto market-research bundle. It
uses two payment-protocol categories and currently routes every call through the
SELAT Router. Free verification on **2026-08-30** observed one `routed-x402`
call and four `routed-mpp` calls.

## Endpoint matrix

| # | Provider / purpose | Method and URL | Required request data | Declared rail / observed mode | Live quote | Per-step cap |
|---|---|---|---|---|---:|---:|
| 1 | Alchemy spot price | `GET https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=${symbol}` | Query: `symbols` | x402 via Circle Gateway / `routed-x402` | $0.001 | $0.002 |
| 2 | CoinGecko token market data | `POST https://coingecko.mpp.paywithlocus.com/coingecko/coins-markets` | JSON: `vs_currency`, `ids`; this skill also bounds result/page/change fields | MPP on Tempo / `routed-mpp` | $0.063 | $0.08 |
| 3 | Alpha Vantage benchmark quote | `POST https://alphavantage.mpp.paywithlocus.com/alphavantage/global-quote` | JSON: `symbol` | MPP on Tempo / `routed-mpp` | $0.0084 | $0.015 |
| 4 | Nansen chain-level smart-money holdings | `POST https://api.nansen.ai/api/v1/smart-money/holdings` | JSON: `chains` array | MPP on Tempo / `routed-mpp` | $0.0525 | $0.07 |
| 5 | Exa news/context search | `POST https://api.exa.ai/search` | JSON: `query`; optional bounded result/content fields | MPP on Tempo / `routed-mpp` | $0.00735 | $0.02 |

Expected total at the recorded quotes: **$0.13225**. The five independent
per-step caps sum to **$0.187**. The manifest top-level `$0.08` value is only a
fallback for a step without an override; it is not a cumulative run cap.

## Schema and interpretation notes

### Alchemy

- `symbols` is a query parameter; this is the only GET call.
- The skill supplies one token symbol without `$`.
- Live verification observed `routed-x402`; do not describe the request as a
  direct/no-router payment based on the hostname.

### CoinGecko

- OpenAPI requires `vs_currency` and accepts `ids` as a comma-separated string.
- The skill requests one CoinGecko ID, one page, one result, sparkline data, and
  `1h,24h,7d` price-change percentages.
- A token symbol and CoinGecko ID are separate identifier systems. Validate the
  pair before payment.

### Alpha Vantage

- `global-quote` requires one `symbol` string.
- The output is a benchmark quote, not a complete macroeconomic dataset. One
  contemporaneous quote does not establish causation between an ETF/equity and
  the crypto asset.

### Nansen

- `SmartMoneyHoldingsRequest` requires `chains`, an array of supported chain
  names. The request object does not expose a token-symbol or coin-ID filter.
- The response aggregates token balances held by smart traders and funds on the
  selected chain, with holdings/change metadata. It is **chain-level context**.
- Do not claim that `chains:["ethereum"]` measures ETH-specific positioning.
- The host is dual-protocol. A bare challenge may expose x402 before the gated
  MPP challenge appears; current SELAT live verification observed `routed-mpp`.

### Exa

- `query` is required. `numResults` accepts 1–100; this skill requests 8.
- `contents.text.maxCharacters` bounds retrieved text per result.
- Public OpenAPI reports dynamic pricing from `$0.007` to `$0.015`; the recorded
  SELAT quote was `$0.00735`. The live challenge remains authoritative.

## Free live probes

These commands read payment challenges and schemas; they do not sign or settle:

```bash
selat skill verify ./skills/financial-intel \
  --symbol ETH \
  --coin ethereum \
  --ticker QQQ \
  --assetChain ethereum \
  --query "Ethereum ETH ETF flows regulation August 2026" \
  --live-probe

selat-pay GET \
  "https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH" \
  --chain base --probe-only --live-probe

selat-pay POST \
  "https://coingecko.mpp.paywithlocus.com/coingecko/coins-markets" \
  --body '{"vs_currency":"usd","ids":"ethereum","per_page":1,"page":1,"sparkline":true,"price_change_percentage":"1h,24h,7d"}' \
  --chain base --max-amount 0.08 --probe-only --live-probe

selat-pay POST \
  "https://alphavantage.mpp.paywithlocus.com/alphavantage/global-quote" \
  --body '{"symbol":"QQQ"}' \
  --chain base --max-amount 0.015 --probe-only --live-probe

selat-pay POST \
  "https://api.nansen.ai/api/v1/smart-money/holdings" \
  --body '{"chains":["ethereum"]}' \
  --chain base --max-amount 0.07 --probe-only --live-probe

selat-pay POST \
  "https://api.exa.ai/search" \
  --body '{"query":"Ethereum ETH ETF flows regulation August 2026","numResults":8,"contents":{"text":{"maxCharacters":3000}}}' \
  --chain base --max-amount 0.02 --probe-only --live-probe
```

`--chain base` above is the settlement-chain argument currently required by
`selat-pay`; it is unrelated to the manifest's `assetChain` data input. Probing
is free and chain-independent. A paid run resolves settlement from the funded
Circle Gateway balance.

Provider names and trademarks belong to their respective owners and are used
only for endpoint identification. Pricing and routing observations can change;
re-run the free live probe before payment.
