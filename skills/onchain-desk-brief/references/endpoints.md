# Endpoints — onchain-desk-brief

**PR #85 parked (2026-08-21).** Shipped steps are Alchemy + SELAT Twitter
(`x402 via Circle Gateway`; verify prints `routed-x402`). The intended MPP
pin — Allium prices — **502s through the router**. Dune is **not** in the
manifest. Paid per call via selat-pay (USDC via Circle Gateway), no API keys.

Pinned hosts (no in-skill discover):

- **Alchemy** — same `x402.alchemy.com` token-by-address GET as
  `account-intel`. Manifest rail `x402 via Circle Gateway`. Verify prints
  **`routed-x402`** — the call hops the SELAT Router. Not a no-router-hop claim.
- **SELAT Twitter** — same `catalog.selat.ai` advanced_search GET as
  `stock-direction-signals` / `find-twitter-influencers`. Verify prints
  **`routed-x402`**.

Not pinned (do not ship as a third rail):

- **Allium prices** `POST https://agents.allium.so/api/v1/developer/prices`
  (retired `allium-price` skill URL; catalog ~$0.02). Probe-only 2026-08-21
  via `SELAT_ROUTER_URL=https://router.selat.ai` (no `--pay`):
  `detected: x402=yes mpp=yes(probe-1); mode=routed-mpp` then
  `expected 402 from router, got 502: {"error":"expected upstream 402 challenge, got 500"}`.
  Bare host 402 is ~$0.02 (Tempo `charge` + x402). **Not a router live-402.
  Not pinned. Do not pretend it 402s.**
- **Dune** `POST https://api.dune.com/api/v1/sql/execute` — live **$4.20**
  `routed-mpp` (Tempo `session`). Above the $1 CLI per-call ceiling. Not
  settleable. **Removed from the manifest.** Do not raise the ceiling.

| Step | Method | URL | Rail (manifest) | Verify prints | ~Price |
|---|---|---|---|---|---|
| 1 — Twitter chatter | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${twitter_query}&queryType=Latest` | x402 via Circle Gateway | routed-x402 | $0.001 |
| 2 — On-chain footprint | GET | `https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=${address}` | x402 via Circle Gateway | routed-x402 | $0.001 |

Full-run cap (`maxAmount`): **$0.50**. Per-step caps **$0.01**.

- **SELAT Router:** every shipped step, including Alchemy, routes via
  `https://router.selat.ai`. `SELAT_ROUTER_URL` is required.
- **x402 via Circle Gateway:** Alchemy and SELAT Twitter. Verify prints
  `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain
  claim and not a no-router-hop claim.

## Alchemy — `x402 via Circle Gateway` (verify: `routed-x402`)

serviceUrl: `https://x402.alchemy.com`

Live-probed price: `$0.001` per call. `selat skill verify --live-probe`
prints **`routed-x402`**. The call hops the SELAT Router. Do not describe
this as a Gateway-batched nanopayment with **no router hop**.

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

## Allium prices — parked (`MPP on Tempo`, router 502)

serviceUrl: `https://agents.allium.so`

Intended pin (not in the manifest):

| Step | Endpoint | Params |
| --- | --- | --- |
| latest price | `POST /api/v1/developer/prices` | JSON **array**: `[{ "chain": "<name>", "token_address": "<0x>" }]` |

Probe-only (2026-08-21, no `--pay`):

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
selat-pay POST "https://agents.allium.so/api/v1/developer/prices" \
  --body '[{"chain":"ethereum","token_address":"0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"}]' \
  --chain base --probe-only --live-probe
```

Result: `mode=routed-mpp` then **502**
`expected upstream 402 challenge, got 500`. Not pinned.

## SELAT-native Twitter — `x402 via Circle Gateway` (verify: `routed-x402`)

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call. Verify prints **`routed-x402`**.
**GET with query-string params**, same as `stock-direction-signals`.

| Capability | Endpoint | Query params |
| --- | --- | --- |
| Advanced search (manifest step) | `/twitter/tweet/advanced_search` | `query` (string, required), `queryType` (`Latest` / `Top`) |

Responses are raw tweet objects — no sentiment score is included.

## Live probes (free; no wallet)

```bash
# shipped — verify prints routed-x402
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=uniswap%20OR%20UNI&queryType=Latest" \
  --chain base --probe-only --live-probe
selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0x1f9840a85d5af5bf1d1762f925bdaddc4201f984" \
  --chain base --probe-only --live-probe
```

Do not add `--pay`. Do not pin Allium or Dune until the router serves a
sub-$1 live 402 on the default MPP path.
