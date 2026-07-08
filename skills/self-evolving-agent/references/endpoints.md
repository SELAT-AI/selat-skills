# Endpoints - self-evolving-agent

| Step | Method | URL | Rail | Catalogue price | Cap |
|---|---|---|---|---|---|
| KOL sentiment | GET | `https://x402.ottoai.services/kol-sentiment` | routed x402 | about $0.001 | $0.010 |
| Hyperliquid market context | GET | `https://x402.ottoai.services/hyperliquid-market` | routed x402 | about $0.001 | $0.010 |
| Domain availability | POST | `https://stabledomains.dev/api/check` | routed x402 | about $0.010 | $0.015 |

## Provenance

The endpoints came from free SELAT federated-catalogue searches for:

- `social intelligence sentiment influencers market chatter`
- `financial intelligence crypto price market data on-chain prediction markets`
- `compute hosting domain infrastructure deploy website server`

Other useful catalogue candidates found:

- Alchemy token prices by address.
- AIsa CoinGecko market chart.
- AIsa Kalshi markets and trades.
- Gloria AI 24-hour ticker news summary.
- BlockRun prediction-market containers and dFlow trade history.
- Modal sandbox execution.
- StableUpload and Build With Locus domain/hosting-related endpoints.

## Available But Locked Behind Policy

The following endpoints appear capable of moving assets, placing orders, or
preparing transactions. They are not manifest steps. Treat them as unavailable
for live execution until a separate trading policy is approved and the run has
explicit authorization and caps.

| Capability | Method | URL | Policy gate |
|---|---|---|---|
| Open Hyperliquid perpetual | POST | `https://x402.ottoai.services/trade-perpetuals` | live order approval, asset universe, notional cap, loss cap, leverage policy |
| Close Hyperliquid position | POST | `https://x402.ottoai.services/close-position` | live order approval, position identifier, max close size |
| Modify TP/SL or limit order | POST | `https://x402.ottoai.services/modify-hl-order` | approved order types, trigger rules, emergency-stop path |
| Update position margin | POST | `https://x402.ottoai.services/update-position-margin` | margin and leverage policy, liquidation-loss cap |
| Hyperliquid deposit/withdraw | POST | `https://x402.ottoai.services/hl-deposit-withdraw` | wallet funding approval, venue approval, transfer cap |
| Same-chain token swap | POST | `https://x402.ottoai.services/swap` | asset allowlist, slippage cap, notional cap |
| Otto Safe withdrawal | POST | `https://x402.ottoai.services/withdraw` | destination approval, transfer cap, treasury ledger entry |
| Yield deposit transaction builder | POST | `https://x402.ottoai.services/deposit` | protocol approval, unsigned-transaction review, treasury cap |

Supporting read-only endpoints may be used for preflight analysis when they
quote within cap:

- `GET https://x402.ottoai.services/hyperliquid-account`
- `GET https://x402.ottoai.services/transaction-history`
- `GET https://x402.ottoai.services/supported-tokens`

Live 402 probe results are authoritative. Do not submit this skill until the
manifest endpoints verify live within cap.
