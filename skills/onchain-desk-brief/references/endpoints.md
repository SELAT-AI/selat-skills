# Endpoints — onchain-desk-brief

Cited desk brief across **two settlement modes** from hosts already used in
this repo / live-probed 2026-08-21: Circle Gateway-batched nanopayment
(`x402 via Circle Gateway`, Alchemy + SELAT Twitter) and **MPP on Tempo**
(Allium). Paid per call via selat-pay (USDC via Circle Gateway), no API keys.

Pinned hosts (no in-skill discover):

- **Alchemy** — same `x402.alchemy.com` token-by-address GET as
  `account-intel` (Gateway-batched `x402 via Circle Gateway`).
- **Allium** — same `agents.allium.so` prices POST as the retired
  `allium-price` skill, plus the live-probed tokens/search GET.
- **SELAT Twitter** — same `catalog.selat.ai` advanced_search GET as
  `stock-direction-signals` / `find-twitter-influencers`.

Not pinned (investigated, left out):

- **QuickNode** `https://x402.quicknode.com` — live 402, but JSON-RPC rather
  than a desk-brief REST. Alchemy already covers the x402 family.
- **Dune** `https://api.dune.com/api/v1/sql/execute` — live 402 with Tempo
  `intent=session`, not the `charge` MPP other selat-skills pin. Allium already
  covers the MPP family.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Twitter chatter | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${twitter_query}&queryType=Latest` | x402 via Circle Gateway | $0.001 |
| 2 — On-chain footprint | GET | `https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=${address}` | x402 via Circle Gateway | $0.001 |
| 3 — Token identity | GET | `https://agents.allium.so/api/v1/developer/tokens/search?q=${protocol}&chain=${tokenChain}` | MPP on Tempo | $0.03 (bare) / $0.0315 (`--prefer-x402` via router) |
| 4 — Latest price | POST | `https://agents.allium.so/api/v1/developer/prices` | MPP on Tempo | $0.02 (bare) / $0.021 (`--prefer-x402` via router) |

Full-run cap (`maxAmount`): **$0.50**; per-step caps **$0.01** (Twitter, Alchemy)
and **$0.10** (Allium). Live total ≈ $0.052 bare / ≈ $0.055 with Allium x402
fallback (probe-verified 2026-08-21).

**Router note (2026-08-21):** Allium's default selat-pay route is `routed-mpp`
(Tempo `charge` is present on probe 1). `https://router.selat.ai` currently
returns `502 expected upstream 402 challenge, got 500` for that MPP
translation — so `selat skill verify` / `selat skill run` fail on steps 3–4.
The same URLs quote successfully with `selat-pay --prefer-x402` (routed-x402).
Nansen MPP on the same router still quotes ($0.0525), so this is Allium-specific,
not a total MPP outage. Keep the rail pin `MPP on Tempo`; do not invent a
Locus Allium host (none listed).

- **SELAT Router:** Allium and SELAT Twitter route via `https://router.selat.ai` with protocol detection (MPP ↔ x402). Alchemy does not need the router.
- **x402 via Circle Gateway:** Alchemy (`x402.alchemy.com`) and SELAT Twitter (`catalog.selat.ai`) serve `GatewayWalletBatched`. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** Allium (`agents.allium.so`) serves Tempo `charge` (`WWW-Authenticate: Payment`, method `tempo`) plus an x402 challenge. Pin as `MPP on Tempo`. Buyer is the funded Gateway chain.

## Alchemy — `x402 via Circle Gateway`

serviceUrl: `https://x402.alchemy.com`

Live-probed price: `$0.001` per call (`GatewayWalletBatched` in `accepts`).
The manifest step is **GET with a query-string `address`** — the same path
`account-intel` already pins (not the official keyful POST body).

| Capability | Endpoint | Query params |
| --- | --- | --- |
| Token footprint (manifest step) | `/data/v1/assets/tokens/by-address` | `address` (EVM `0x…`, required) |

Optional same-host GET already used by `financial-intel` (not in this
manifest — call via `selat-pay` when the desk needs a symbol print):

| Capability | Endpoint | Query params |
| --- | --- | --- |
| Spot by symbol | `/prices/v1/tokens/by-symbol` | `symbols` (comma-separated, no `$`) |

## Allium — `MPP on Tempo`

serviceUrl: `https://agents.allium.so`

Live-probed prices: tokens/search `$0.03` (`30000` USDC base units), prices
`$0.02` (`20000` units). Both serve Tempo `intent=charge` on a bare probe.

| Step | Endpoint | Params |
| --- | --- | --- |
| token identity | `GET /api/v1/developer/tokens/search` | `q` (string, required), `chain` (optional lowercase name) |
| latest price | `POST /api/v1/developer/prices` | JSON **array**: `[{ "chain": "<name>", "token_address": "<0x>" }]` |

Price body pattern (string fields only — `${param}` is not type-coerced):

```json
[{ "chain": "ethereum", "token_address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984" }]
```

Native ETH uses the zero address on `ethereum`. Do not pass Solana mints.

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`GatewayWalletBatched`). **GET with
query-string params**, same as `stock-direction-signals`.

| Capability | Endpoint | Query params |
| --- | --- | --- |
| Advanced search (manifest step) | `/twitter/tweet/advanced_search` | `query` (string, required), `queryType` (`Latest` / `Top`) |

Responses are raw tweet objects — no sentiment score is included.

## Live probes (free; no wallet)

```bash
# x402 via Circle Gateway (GET query)
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=uniswap%20OR%20UNI&queryType=Latest" \
  --chain base --probe-only
selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0x1f9840a85d5af5bf1d1762f925bdaddc4201f984" \
  --chain base --probe-only

# MPP on Tempo (GET query + POST body)
selat-pay GET "https://agents.allium.so/api/v1/developer/tokens/search?q=uniswap&chain=ethereum" \
  --chain base --probe-only
selat-pay POST "https://agents.allium.so/api/v1/developer/prices" \
  --body '[{"chain":"ethereum","token_address":"0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"}]' \
  --chain base --probe-only
```

A served endpoint prints `detected ... price=$X`. Twitter and Alchemy show
`x402 via Circle Gateway`. Allium's bare probe is dual-protocol (Tempo `charge`
+ x402); default selat-pay mode is `routed-mpp` and the router 500s that
translation today. Add `--prefer-x402` to the Allium probes to get a live
router quote (`routed-x402`, $0.0315 / $0.021).
