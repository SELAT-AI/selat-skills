# Catalogue Findings

Free SELAT federated-catalogue searches on 2026-06-30 found candidate endpoints
for the budgeted economic-agent definition.

## Social Intelligence

- Otto AI KOL sentiment: `https://x402.ottoai.services/kol-sentiment`
- AgentMail pods for inbox/workflow infrastructure.
- StableEnrich influencer and LinkedIn-style enrichment endpoints.
- BlockRun prediction-market containers for market context.

## Financial Intelligence

- Otto AI Hyperliquid market data:
  `https://x402.ottoai.services/hyperliquid-market`
- Gloria AI ticker news summaries.
- Alchemy token prices by address.
- AIsa CoinGecko market charts.
- AIsa Kalshi market and trade data.
- Codex GraphQL token, trade, and liquidity data.

## Infrastructure

- AgentMail inbox creation:
  `https://x402.api.agentmail.to/v0/inboxes` at about `$2.00`.
- AgentMail inbox listing:
  `https://x402.api.agentmail.to/v0/inboxes` at `$0.00`.
- AgentMail threads and webhooks for receiving operational email and Circle OTPs.
- StableDomains availability:
  `https://stabledomains.dev/api/check`
- Modal sandbox execution:
  `https://modal.mpp.tempo.xyz/sandbox/exec`
- StableUpload and Build With Locus domain/hosting-related endpoints.

## Execution Gap

The catalogue search surfaced trade-capable endpoints, but no live-trade
execution endpoint was selected for the manifest. That is intentional: these
endpoints are **available but locked behind policy** and must not be called
until the user approves venue, risk policy, position sizing, and compliance
constraints.

Gated execution candidates found in the catalogue:

- Otto AI `POST https://x402.ottoai.services/trade-perpetuals` for opening
  Hyperliquid perpetual positions with optional TP/SL trigger orders.
- Otto AI `POST https://x402.ottoai.services/close-position` for full or
  partial Hyperliquid position closes.
- Otto AI `POST https://x402.ottoai.services/modify-hl-order` for modifying or
  cancelling TP/SL trigger orders and limit orders.
- Otto AI `POST https://x402.ottoai.services/update-position-margin` for
  changing leverage or adding/removing margin.
- Otto AI `POST https://x402.ottoai.services/hl-deposit-withdraw` for
  Hyperliquid USDC deposit or withdrawal flows.
- Otto AI `POST https://x402.ottoai.services/swap` for same-chain token swaps
  through Odos routing.
- Otto AI `POST https://x402.ottoai.services/withdraw` for withdrawing tokens
  from an Otto AI Safe.
- Otto AI `POST https://x402.ottoai.services/deposit` for building deposit
  transactions into yield protocols; treat unsigned transaction payloads as
  execution-adjacent and still policy-gated.

Useful supporting read-only candidates:

- Otto AI `GET https://x402.ottoai.services/hyperliquid-account` for account,
  position, margin, collateral, and active trigger-order context.
- Otto AI `GET https://x402.ottoai.services/transaction-history` for trade and
  transaction history.
- Otto AI `GET https://x402.ottoai.services/supported-tokens` for swap
  preflight.

## Manifest Choice

The manifest uses one social signal, one financial signal, and one domain quote
because those map directly to the user's definition while keeping the preflight
cheap and reversible.

AgentMail inbox creation is not in the manifest because it is an identity
bootstrap action, not an intelligence preflight. It should be quoted and run only
after the user approves the mailbox address, provider, and spend cap.
