# Endpoints — wallet-desk-brief

This skill runs a fixed pair of read-only requests for one explicit non-zero EVM
address. Both currently route through the SELAT Router as `routed-x402`. Each is
quoted and paid independently.

## Live route and cost snapshot

| # | Read | Method | URL | Observed mode | Live quote | Step cap |
|---|---|---|---|---|---|---|
| 1 | Five-network token holdings | POST | `https://x402.alchemy.com/data/v1/assets/tokens/by-address` | routed-x402 | $0.001 | $0.002 |
| 2 | Probabilistic address attribution | POST | `https://api.arkm.com/x402/intelligence/address` | routed-x402 | $0.21 | $0.25 |

Free-probe snapshot: 2026-08-31 with SELAT CLI 0.16.15. Expected fixed-run
total: **$0.211**. Sum of per-step caps and therefore maximum fixed-run exposure:
**$0.252**. The top-level `maxAmount` is a fallback per-step cap, not a
cumulative run cap; the armed session budget supplies the cumulative guardrail.

The live 402 quote and transactability extension are authoritative. Re-probe
before payment.

## Transactability snapshot

- Alchemy: last paid status 200; network-wide 7-day delivery was 80% over five
  captured payments and all-time delivery was 93% over fifteen. Treat this as a
  below-100% caution, not a guarantee about the next call.
- Arkham: last paid status 200 and observed delivery was 100%, but only one
  captured payment was present. Treat this as low-confidence evidence.

These figures are time-sensitive payment-layer observations. They do not assess
the accuracy or usefulness of returned holdings or labels.

## Alchemy request contract

The official Tokens By Wallet operation is POST and accepts an `addresses`
array. The manifest sends:

```json
{
  "addresses": [
    {
      "address": "${address}",
      "networks": [
        "eth-mainnet",
        "base-mainnet",
        "matic-mainnet",
        "arb-mainnet",
        "opt-mainnet"
      ]
    }
  ],
  "withMetadata": true,
  "withPrices": true,
  "includeNativeTokens": true,
  "includeErc20Tokens": true
}
```

It requests fungible native and ERC-20 holdings, metadata, and available prices
across exactly five networks. A successful response can still contain top-level
`partialErrors` for failed networks and per-token errors for metadata or pricing.
Preserve both. Do not describe the result as all-chain or necessarily complete.

Official contract:
https://www.alchemy.com/docs/data/portfolio-apis/portfolio-api-endpoints/portfolio-api-endpoints/get-tokens-by-address

## Arkham request contract

The live payment challenge exposes this required body:

```json
{
  "address": "${address}"
}
```

An optional `chain` field is intentionally omitted. Preserve the chain returned
by Arkham and do not generalize one label across every chain. Expected fields can
include entity, label, chain, and contract/user-address flags when a match exists.
Missing attribution means unlabeled by this response, not safe, anonymous, or
unowned.

Arkham's official API guide describes address attribution as probabilistic and
notes that labels evolve as intelligence changes:
https://arkm.com/docs

## Intentionally omitted

CoinGecko simple-price is not part of this skill. Its request requires known
CoinGecko coin IDs and cannot safely convert an arbitrary holdings response into
priced assets inside this declarative fixed pair. Alchemy already requests price
data where available; missing prices remain missing.

## Live probes (free; no wallet)

```bash
selat-pay POST "https://x402.alchemy.com/data/v1/assets/tokens/by-address" \
  --body '{"addresses":[{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","networks":["eth-mainnet","base-mainnet","matic-mainnet","arb-mainnet","opt-mainnet"]}],"withMetadata":true,"withPrices":true,"includeNativeTokens":true,"includeErc20Tokens":true}' \
  --chain base --max-amount 0.002 --probe-only --live-probe

selat-pay POST "https://api.arkm.com/x402/intelligence/address" \
  --body '{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}' \
  --chain base --max-amount 0.25 --probe-only --live-probe
```

These probes read live payment challenges and do not settle payment. Passing
proves route, quote, reachability, and cap fit—not post-payment business success
or data accuracy. Do not add `--pay` or `--yes` without fresh explicit approval.
