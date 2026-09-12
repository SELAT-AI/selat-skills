# Endpoints — wallet-desk-brief

Use only these endpoint families for `wallet-desk-brief`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — On-chain holdings | GET | `https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=${address}` | x402 via Circle Gateway | $0.001 |
| 2 — Wallet attribution | POST | `https://api.arkm.com/x402/intelligence/address` | x402 via Circle Gateway | $0.21 |

This is a fixed 2-call manifest. The step table matches `manifest.json` exactly.
CoinGecko simple-price is **not a manifest step**.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402). `SELAT_ROUTER_URL` is required — including for Alchemy.
- **x402 via Circle Gateway:** Alchemy (`x402.alchemy.com`) and Arkham (`api.arkm.com/x402`). Verify prints `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain claim and not a no-router-hop claim.

## Alchemy — `x402 via Circle Gateway`

serviceUrl: `https://x402.alchemy.com`

Live-probed price: `$0.001` per call (`routed-x402`). The manifest step is
**GET with a query-string `address`**. Same path `account-intel` already pins.
Do not describe this as a Gateway-batched nanopayment with no router hop.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| On-chain holdings | `/data/v1/assets/tokens/by-address` | `address` (EVM `0x…`, required) |

Query pattern:

```text
https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

## Arkham — `x402 via Circle Gateway`

serviceUrl: `https://api.arkm.com/x402`

Live-probed price: `$0.21` per call (`routed-x402`; upstream list price $0.20).
The manifest step is **POST with `address` in the JSON body**. Optional `chain`
is omitted so Arkham auto-detects. Do not invent other Arkham paths.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Wallet attribution | `/intelligence/address` | `address` (EVM `0x…`, required) |

```json
{ "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" }
```

Response includes entity (`arkhamEntity`), label (`arkhamLabel`), chain, and
contract / user-address flags when Arkham has a match.

## CoinGecko simple-price — not in the default manifest

serviceUrl: `https://coingecko.mpp.paywithlocus.com`

Live-probed price: `$0.063` (`routed-mpp`). **Not a manifest step.** The body
takes CoinGecko coin ids (`ids` + `vs_currencies`), not Alchemy contract
holdings, so it does not price those holdings.

| Capability | Endpoint | Body params |
| --- | --- | --- |
| Simple price (skipped) | `POST /coingecko/simple-price` | `ids` (coin id), `vs_currencies` (`usd`) |
