# Endpoints - self-evolving-agent

Free live probes on 2026-08-31 with SELAT CLI 0.16.15 produced the routed prices
below. Re-probe before payment because quotes and routing can change.

| Step | Method and request | Observed SELAT mode | Raw provider price | Routed quote | Per-call cap |
|---|---|---|---:|---:|---:|
| KOL sentiment | `GET https://x402.ottoai.services/kol-sentiment` | `routed-x402` | $0.003 | $0.00315 | $0.004 |
| Hyperliquid market context | `GET https://x402.ottoai.services/hyperliquid-market?asset=${asset}` | `routed-x402` | $0.001 | $0.00105 | $0.002 |
| Domain availability | `POST https://stabledomains.dev/api/check` with `{"domain":"${domainCandidate}"}` | `routed-mpp` | $0.010 | $0.0105 | $0.012 |

Expected total at that probe was **$0.01470**. The sum of the three independent
per-call caps is **$0.018**. The top-level manifest cap is only a fallback; the
runner does not treat it as a pooled session budget.

## Live Request Contracts

- **KOL sentiment:** no request parameters. The 402 response advertises Base
  and Solana x402 options. The report is broad and may expose freshness and
  degradation metadata; preserve those fields in analysis.
- **Hyperliquid market:** the live Bazaar input schema requires an `asset` query
  parameter such as `BTC`. The 402 response advertises Base x402. A bare URL can
  still return a valid quote, so quote-only verification would not catch the
  missing business input.
- **StableDomains:** the live schema requires a JSON body containing only
  `domain`. The endpoint advertises Base/Solana x402 offers and a Tempo payment
  challenge; SELAT classified the tested route as `routed-mpp`. The check does
  not register or reserve the domain.

## Provenance

The endpoints came from free SELAT federated-catalogue searches for:

- `social intelligence sentiment influencers market chatter`
- `financial intelligence crypto price market data on-chain prediction markets`
- `compute hosting domain infrastructure deploy website server`

Other useful catalogue candidates found in the 2026-06-30 snapshot (not
re-verified on 2026-08-31):

- Alchemy token prices by address.
- AIsa CoinGecko market chart.
- AIsa Kalshi markets and trades.
- Gloria AI 24-hour ticker news summary.
- BlockRun prediction-market containers and dFlow trade history.
- Modal sandbox execution.
- StableUpload and Build With Locus domain/hosting-related endpoints.

## Available But Locked Behind Policy

The following endpoints appeared capable of moving assets, placing orders, or
preparing transactions in the 2026-06-30 catalogue snapshot. Their present
availability and schemas were not re-verified. They are not manifest steps.
Treat them as unavailable for live execution until they are re-discovered, a
separate trading policy is approved, and the run has explicit authorization and
caps.

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

Live 402 probe results are authoritative for payment compatibility, not proof of
successful post-payment data delivery. A paid smoke test still requires a fresh
quote, a cumulative cap, an armed session budget, and explicit approval.
