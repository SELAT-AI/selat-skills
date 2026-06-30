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

The catalogue search surfaced useful read-only intelligence and infrastructure
planning endpoints, but no suitable direct live-trade execution endpoint was
selected for the manifest. That is intentional: live trading should be wired
only after the user approves venue, risk policy, position sizing, and compliance
constraints.

## Manifest Choice

The manifest uses one social signal, one financial signal, and one domain quote
because those map directly to the user's definition while keeping the preflight
cheap and reversible.

AgentMail inbox creation is not in the manifest because it is an identity
bootstrap action, not an intelligence preflight. It should be quoted and run only
after the user approves the mailbox address, provider, and spend cap.
