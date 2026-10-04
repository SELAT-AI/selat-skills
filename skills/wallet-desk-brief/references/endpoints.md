# Endpoints — wallet-desk-brief

Use only these endpoint families for `wallet-desk-brief`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Five-network token holdings (Alchemy) | POST | `https://x402.alchemy.com/data/v1/assets/tokens/by-address` | x402 via Circle Gateway | $0.001 | $0.002 |
| 2 — Probabilistic address attribution (Arkham) | POST | `https://api.arkm.com/x402/intelligence/address` | x402 via Circle Gateway | $0.21 | $0.30 |

This is a fixed 2-call manifest. The step table matches `manifest.json`
exactly, and `selat skill run` pays for both steps on every run. Live-probed
total (2026-10-04): **$0.211**. Sum of per-step caps: **$0.302**. The top-level
`maxAmount` (`$0.30`) is only a per-step fallback for a step without its own
cap. It is not a cumulative run cap. The armed session budget is the
cumulative tripwire.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** Alchemy (`x402.alchemy.com`) and Arkham (`api.arkm.com`). On 2026-10-04 the free probe of the exact manifest POST reported `mode: routed-x402` for both. The buyer pays from whichever chain holds the funded Gateway balance. This is not a pay-chain claim.

## Alchemy — `x402 via Circle Gateway`

serviceUrl: `https://x402.alchemy.com`

Live-probed price: `$0.001` per call (`routed-x402`, 2026-10-04, probed with
the manifest's POST body). Per-step cap `$0.002`. **POST with a JSON body** —
the official Tokens By Wallet contract. A GET/query-string request can still
return a 402 challenge, but that does not prove the paid request is valid.

Mode note: Alchemy's own 402 also lists a `GatewayWalletBatched` offer. The
2026-09-12 registry probed the old GET URL and recorded `direct`. Today's
probe of the POST contract records `routed-x402`. Do not claim the step skips
`SELAT_ROUTER_URL`, and do not claim it must use it. Report the mode that
`selat skill verify --live-probe` prints.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Five-network token holdings | `/data/v1/assets/tokens/by-address` | `addresses[]` (`address` + `networks`, required), `withMetadata`, `withPrices`, `includeNativeTokens`, `includeErc20Tokens` (booleans) |

```json
{
  "addresses": [
    {
      "address": "${address}",
      "networks": ["eth-mainnet", "base-mainnet", "matic-mainnet", "arb-mainnet", "opt-mainnet"]
    }
  ],
  "withMetadata": true,
  "withPrices": true,
  "includeNativeTokens": true,
  "includeErc20Tokens": true
}
```

Polygon's Portfolio API identifier is `matic-mainnet`. Do not substitute it.
A 200 can still contain top-level `partialErrors` for failed networks and
per-token errors for metadata or pricing. Keep both. Never describe the result
as all-chain or complete.

Official contract:
https://www.alchemy.com/docs/data/portfolio-apis/portfolio-api-endpoints/portfolio-api-endpoints/get-tokens-by-address

## Arkham — `x402 via Circle Gateway`

serviceUrl: `https://api.arkm.com`

Live-probed price: `$0.21` per call (`routed-x402`, 2026-10-04). Per-step cap
`$0.30`. **POST with a JSON body.**

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Probabilistic address attribution | `/x402/intelligence/address` | `address` (string, required). `chain` (optional) is intentionally omitted. |

```json
{ "address": "${address}" }
```

Keep the chain Arkham returns and do not generalize one label across every
chain. Missing attribution means this response has no label for the address.
It does not mean the address is safe, anonymous, or unowned. Arkham's API
guide describes attribution as probabilistic and says labels change over time:
https://arkm.com/docs

## Transactability snapshot (2026-10-04)

From the `selatTransactabilityIndex` extension on the live quote:

| Endpoint | Last paid status | All-time delivery | Captured payments |
| --- | --- | --- | --- |
| Alchemy tokens-by-address | 200 | **7%** | 15 |
| Arkham intelligence/address | 200 | 100% | 1 |

Alchemy's network-wide record is mostly captured payments followed by an
upstream 5xx. That is a real risk of paying $0.001 and getting no holdings. A
paid Alchemy 200 should be rehearsed before any live demo. Arkham has a single
sample, which is weak evidence. These are time-sensitive payment-layer
observations. They do not measure the accuracy of holdings or labels.

## Free probes

Whole skill (reads payment challenges only, never settles):

```bash
selat skill verify ./skills/wallet-desk-brief --address 0x28C6c06298d514Db089934071355E5743bf21d60 --live-probe
```

Single step (`--chain base` is only selat-pay's required flag; a probe never
settles, and paid runs use whichever chain holds your Gateway balance):

```bash
selat-pay POST "https://x402.alchemy.com/data/v1/assets/tokens/by-address" \
  --body '{"addresses":[{"address":"0x28C6c06298d514Db089934071355E5743bf21d60","networks":["eth-mainnet","base-mainnet","matic-mainnet","arb-mainnet","opt-mainnet"]}],"withMetadata":true,"withPrices":true,"includeNativeTokens":true,"includeErc20Tokens":true}' \
  --chain base --max-amount 0.002 --probe-only --live-probe

selat-pay POST "https://api.arkm.com/x402/intelligence/address" \
  --body '{"address":"0x28C6c06298d514Db089934071355E5743bf21d60"}' \
  --chain base --max-amount 0.30 --probe-only --live-probe
```

A passing probe proves route, quote, reachability, and cap fit. It does not
prove the paid call will succeed or that the data is accurate.

## Intentionally omitted

CoinGecko simple-price is not part of this skill. It needs known CoinGecko coin
IDs and cannot safely price an arbitrary holdings response inside a fixed
two-call manifest. Alchemy already requests prices where available. Missing
prices stay missing.
