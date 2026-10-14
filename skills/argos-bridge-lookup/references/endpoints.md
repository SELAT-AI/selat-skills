# Argos bridge lookup endpoint

First-party provider: Argos Bot. Live SELAT federated catalog service ID:
`bridge-api.argosbot.io`, sourced from Coinbase Bazaar. Checked 2026-10-13.

| Method | Payable URL | Quoted price | Cap |
|---|---|---|---|
| GET | `https://bridge-api.argosbot.io/v1/lookup` | 0.005 USDC | 0.0075 USDC |

## Request schema

The live x402 v2 challenge's Bazaar schema specifies:

| Query field | Type | Required | Accepted values |
|---|---|---|---|
| `token` | string | yes | `^0x[0-9a-fA-F]{40}$` ERC-20 contract |
| `chain` | string | no | `arc`, `base`, `5042`, `8453`; omitted checks both |
| `finality` | string | no | `latest` (default), `finalized` |

Manifest `tokenAddress` maps to query `token`. The skill exposes explicit
`arc`/`base` chain selection and always sends it. All fields are string inputs.

## Response interpretation

Envelope: `requestId`, `payment`, `result`.
Result: `status` (`complete`, `ambiguous`, `unavailable`), `observedAt`,
`cached`, `cacheAgeMs`, `candidates`.
Candidate status: `not_a_contract`, `not_registered`, `wrapper_missing`,
`verified`, `verification_failed`, `unavailable`.
Candidates can contain nullable `connectionExists` and `ownerlessVerified`,
source/destination/original/wrapped token metadata, direction, operation
(`lock_and_mint` or `burn_and_unlock`), wrapped supply, evidence and contracts.
Supply may be absent/null. Never replace unknown values with invented zeros.

## Payment and validation

Observed offers: Arc `eip155:5042` exact with `GatewayWalletBatched` typed-data
metadata, and Base `eip155:8453` exact USDC. Both quote 5000 six-decimal units.
The catalog currently misclassifies the Arc offer as ERC-3009 and reports
`gatewayBatched: false`; the live challenge is authoritative.
An unpaid HTTP 402 proves discovery/quotation only. Payment compatibility and
HTTP 200 delivery require separate paid verification. No MPP offer was observed.

Sources:
- https://catalog.selat.ai/api/v1/federated
- https://bridge-api.argosbot.io/openapi.json
- https://bridge-api.argosbot.io/v1/lookup?chain=arc&token=0xece5ca8bf9220718e5727754026757512212cb3c&finality=latest
