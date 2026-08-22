# Endpoints — wallet-desk-brief

Who-is-this-wallet brief over **one rail** (`x402 via Circle Gateway`;
verify prints `routed-x402` for both steps). Paid per call via selat-pay
(USDC via Circle Gateway), no API keys. Read only — no agent places a trade.

Pinned hosts (no in-skill discover):

- **Alchemy** — same `x402.alchemy.com` tokens-by-address GET as
  `account-intel`. Manifest rail `x402 via Circle Gateway`. Verify prints
  **`routed-x402`** — the call hops the SELAT Router. Not a no-router-hop claim.
- **Arkham** — `POST https://api.arkm.com/x402/intelligence/address`.
  Same host already in the SELAT federated catalog / discovery snapshot
  (`api.arkm.com/x402`). Manifest rail `x402 via Circle Gateway`. Verify
  prints **`routed-x402`**.

Not pinned:

- **CoinGecko simple-price**
  `POST https://coingecko.mpp.paywithlocus.com/coingecko/simple-price`
  live-402s (`MPP on Tempo` / `routed-mpp`, ~$0.063, 2026-08-22) but the
  body takes CoinGecko **coin ids** (`ids` + `vs_currencies`), not Alchemy
  contract holdings. It does not price those holdings. Not a third rail.
  Not a second skill.

| Step | Method | URL | Rail (manifest) | Verify prints | ~Price |
|---|---|---|---|---|---|
| 1 — On-chain holdings | GET | `https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=${address}` | x402 via Circle Gateway | routed-x402 | $0.001 |
| 2 — Wallet attribution | POST | `https://api.arkm.com/x402/intelligence/address` | x402 via Circle Gateway | routed-x402 | $0.21 |

Full-run cap (`maxAmount`): **$0.50**. Per-step caps **$0.01** (Alchemy) and
**$0.40** (Arkham). Do not raise the $1 CLI per-call ceiling.

- **SELAT Router:** every shipped step, including Alchemy, routes via
  `https://router.selat.ai`. `SELAT_ROUTER_URL` is required.
- **x402 via Circle Gateway:** Alchemy and Arkham. Verify prints
  `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain
  claim and not a no-router-hop claim.

## Alchemy — `x402 via Circle Gateway` (verify: `routed-x402`)

serviceUrl: `https://x402.alchemy.com`

Live-probed price (2026-08-22, `--probe-only --live-probe`): `$0.001`.
`selat skill verify --live-probe` prints **`routed-x402`**. The call hops
the SELAT Router. Do not describe this as a Gateway-batched nanopayment
with **no router hop**.

The manifest step is **GET with a query-string `address`** — the same path
`account-intel` already pins.

| Capability | Endpoint | Query params |
| --- | --- | --- |
| Token holdings (manifest step) | `/data/v1/assets/tokens/by-address` | `address` (EVM `0x…`, required) |

## Arkham — `x402 via Circle Gateway` (verify: `routed-x402`)

serviceUrl: `https://api.arkm.com/x402`

Live-probed price (2026-08-22, `--probe-only --live-probe`): `$0.21`
(upstream list price $0.20; router quote $0.21). Verify prints
**`routed-x402`**. Under the $1 CLI ceiling.

The manifest step is **POST with `address` in `body`**. Optional `chain`
is omitted so Arkham auto-detects. Do not invent other Arkham paths.

| Capability | Endpoint | Body |
| --- | --- | --- |
| Address intelligence (manifest step) | `POST /intelligence/address` | `{ "address": "<0x>" }` |

Response includes entity (`arkhamEntity`), label (`arkhamLabel`), chain,
and contract / user-address flags when Arkham has a match.

## CoinGecko simple-price — skipped

serviceUrl: `https://coingecko.mpp.paywithlocus.com`

| Endpoint | Body | Probe (2026-08-22, no `--pay`) |
| --- | --- | --- |
| `POST /coingecko/simple-price` | `{ "ids": "<coin-id>", "vs_currencies": "usd" }` | `mode=routed-mpp` ~$0.063 |

Skipped: coin-id input does not price Alchemy contract holdings.

## Live probes (free; no wallet)

```bash
# shipped — verify prints routed-x402
selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" \
  --chain base --probe-only --live-probe
selat-pay POST "https://api.arkm.com/x402/intelligence/address" \
  --body '{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}' \
  --chain base --probe-only --live-probe
```

Do not add `--pay`. Do not add `--yes`. Do not pin CoinGecko simple-price.
