# Endpoints — self-evolving-agent

Use only these endpoint families for `self-evolving-agent`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Social alpha (KOL sentiment) | GET | `https://x402.ottoai.services/kol-sentiment` | x402 on Base | $0.00315 |
| 2 — Financial context (Hyperliquid market) | GET | `https://x402.ottoai.services/hyperliquid-market` | x402 on Base | $0.00105 |
| 3 — Infrastructure quote (domain availability) | POST | `https://stabledomains.dev/api/check` | MPP on Tempo | $0.0105 |

This is a fixed 3-call manifest. The step table matches `manifest.json` exactly.
Trading / transfer endpoints below are **not in the default manifest**.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 on Base / Polygon:** Circle Otto (`x402.ottoai.services`) settles via Circle Gateway batched nanopayments. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** StableDomains (`stabledomains.dev`) is MPP on Tempo but not Locus.

## Circle Otto — `x402 on Base`

serviceUrl: `https://x402.ottoai.services`

Live-probed prices (`routed-x402`): `kol-sentiment` `$0.00315`,
`hyperliquid-market` `$0.00105`. Manifest steps are **GET with no required
query-string params**. Other Otto endpoints `$0.001`–`$0.005` unless noted
below — re-probe if the live quote is needed.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Social alpha — KOL sentiment | `/kol-sentiment` | none required |
| Financial context — Hyperliquid market | `/hyperliquid-market` | none required |

Query pattern:

```text
https://x402.ottoai.services/kol-sentiment
```

Optional read-only endpoints (same host — **not in the default manifest**;
call via `selat-pay` when the request needs them and they quote within cap):

| Capability | Endpoint | Use |
| --- | --- | --- |
| Hyperliquid account | `GET /hyperliquid-account` | Preflight account read. Price: re-probe. |
| Transaction history | `GET /transaction-history` | Preflight history read. Price: re-probe. |
| Supported tokens | `GET /supported-tokens` | Venue token list. Price: re-probe. |

The following endpoints can move assets, place orders, or prepare
transactions. They are **not manifest steps**. Treat them as unavailable for
live execution until a separate trading policy is approved.

| Capability | Endpoint | Policy gate |
| --- | --- | --- |
| Open Hyperliquid perpetual | `POST /trade-perpetuals` | live order approval, asset universe, notional cap, loss cap, leverage policy |
| Close Hyperliquid position | `POST /close-position` | live order approval, position identifier, max close size |
| Modify TP/SL or limit order | `POST /modify-hl-order` | approved order types, trigger rules, emergency-stop path |
| Update position margin | `POST /update-position-margin` | margin and leverage policy, liquidation-loss cap |
| Hyperliquid deposit/withdraw | `POST /hl-deposit-withdraw` | wallet funding approval, venue approval, transfer cap |
| Same-chain token swap | `POST /swap` | asset allowlist, slippage cap, notional cap |
| Otto Safe withdrawal | `POST /withdraw` | destination approval, transfer cap, treasury ledger entry |
| Yield deposit transaction builder | `POST /deposit` | protocol approval, unsigned-transaction review, treasury cap |

## StableDomains — `MPP on Tempo`

serviceUrl: `https://stabledomains.dev`

Live-probed price: `$0.0105` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. Check availability before any purchase — this step is a
quote, not a buy.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Domain availability | `/api/check` | `domain` (string, required) |

```json
{ "domain": "agent-alpha-research.com" }
```
