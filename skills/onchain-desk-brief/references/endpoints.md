# Endpoints — onchain-desk-brief

Cited desk brief across **two settlement modes** from hosts already used in
this repo / live-probed 2026-08-21: `x402 via Circle Gateway` (Alchemy +
SELAT Twitter; verify prints `routed-x402`) and **MPP on Tempo** (Dune SQL
execute; verify prints `routed-mpp`). Paid per call via selat-pay (USDC via
Circle Gateway), no API keys.

Pinned hosts (no in-skill discover):

- **Alchemy** — same `x402.alchemy.com` token-by-address GET as
  `account-intel`. Manifest rail `x402 via Circle Gateway`. Verify prints
  **`routed-x402`** — the call hops the SELAT Router. Not a no-router-hop claim.
- **Dune** — `POST https://api.dune.com/api/v1/sql/execute` (docs MPP path
  under `/api/v1/…`). Manifest rail `MPP on Tempo`. Verify prints
  **`routed-mpp`** (Tempo `intent=session`). Live router quote **$4.20**.
- **SELAT Twitter** — same `catalog.selat.ai` advanced_search GET as
  `stock-direction-signals` / `find-twitter-influencers`. Verify prints
  **`routed-x402`**.

Not pinned (investigated, left out):

- **Allium** `https://agents.allium.so` — bare probe 402s (Tempo `charge` +
  x402; search $0.03 / prices $0.02). Default selat-pay / `selat skill verify`
  prefers MPP, then `router.selat.ai` returns
  `502 expected upstream 402 challenge, got 500` on every developer and
  explorer path tried (search, prices, tokens list, chain-address, prices
  history, wallet balances, explorer run-async). `--prefer-x402` quotes
  through the router ($0.0315 / $0.021) but the manifest cannot pass that
  flag. Nansen MPP on the same router still quotes ($0.0525) — Allium-specific,
  not a total MPP outage. No Locus Allium host 402s. Not pinned: a broken
  Allium step must not be the only MPP pin.
- **QuickNode** `https://x402.quicknode.com` — live 402, but JSON-RPC rather
  than a desk-brief REST. Alchemy already covers the x402 family.
- **Dune** `POST https://api.dune.com/v1/sql/execute` (no `/api/`) — no
  challenge. `GET /api/v1/execution/:id/results` MPP-detected at $1024; router
  503 (`upstream price exceeds MAX_UPSTREAM_PRICE_USD ($5)`). Sim
  (`api.sim.dune.com`) is not MPP.

| Step | Method | URL | Rail (manifest) | Verify prints | ~Price |
|---|---|---|---|---|---|
| 1 — Twitter chatter | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${twitter_query}&queryType=Latest` | x402 via Circle Gateway | routed-x402 | $0.001 |
| 2 — On-chain footprint | GET | `https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=${address}` | x402 via Circle Gateway | routed-x402 | $0.001 |
| 3 — On-chain SQL | POST | `https://api.dune.com/api/v1/sql/execute` | MPP on Tempo | routed-mpp | $4.20 |

Full-run cap (`maxAmount`): **$1.00** (selat CLI hard ceiling). Per-step caps
**$0.01** (Twitter, Alchemy) and **$1.00** (Dune). Dune's live $4.20 quote
exceeds that ceiling — verify will 402 and flag `withinCap`. Do not invent a
cheaper quote.

- **SELAT Router:** every step, including Alchemy, routes via
  `https://router.selat.ai`. `SELAT_ROUTER_URL` is required.
- **x402 via Circle Gateway:** Alchemy and SELAT Twitter. Verify prints
  `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain
  claim and not a no-router-hop claim.
- **MPP on Tempo:** Dune SQL execute serves Tempo `intent=session`. Verify
  prints `routed-mpp`. Buyer is the funded Gateway chain.

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

## Dune — `MPP on Tempo` (verify: `routed-mpp`)

serviceUrl: `https://api.dune.com`

Live-probed price: `$4.20` router quote on
`POST /api/v1/sql/execute` (`x402=no`, `mpp=yes` probe-1, Tempo
`intent=session`, upstream `amount` 4000000 + ~5% markup). Docs list this
path (and `/v1/execution/:id/results|csv`) as Dune's MPP surface.

| Step | Endpoint | Params |
| --- | --- | --- |
| on-chain SQL | `POST /api/v1/sql/execute` | JSON object: `{ "sql": "<text>" }` |

Body pattern (string fields only — `${param}` is not type-coerced):

```json
{ "sql": "SELECT 1" }
```

Rewrite `sql` to the named wallet or protocol before a paid attempt. Native
ETH / Solana / Arc / CCTP paths are out of scope.

The $4.20 quote exceeds the selat CLI **$1/call** hard ceiling
(`HARD_CLI_MAX_AMOUNT_USD`). Manifest `maxAmount` cannot be raised above $1.
`selat skill verify --live-probe` still returns a real 402 and then flags
`withinCap`.

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
# x402 via Circle Gateway — verify prints routed-x402
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=uniswap%20OR%20UNI&queryType=Latest" \
  --chain base --probe-only --live-probe
selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0x1f9840a85d5af5bf1d1762f925bdaddc4201f984" \
  --chain base --probe-only --live-probe

# MPP on Tempo — verify prints routed-mpp ($4.20)
selat-pay POST "https://api.dune.com/api/v1/sql/execute" \
  --body '{"sql":"SELECT 1"}' \
  --chain base --probe-only --live-probe
```

A served endpoint prints `detected ... price=$X`. Twitter and Alchemy show
`mode=routed-x402`. Dune shows `mode=routed-mpp`. Allium is not in this
manifest; do not add `--pay`.
