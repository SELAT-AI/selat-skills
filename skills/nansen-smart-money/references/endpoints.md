# Endpoints — nansen-smart-money

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| DEX Trades | POST | `https://api.nansen.ai/api/v1/smart-money/dex-trades` | routed (MPP outbound) | $0.0525 |
| Holdings | POST | `https://api.nansen.ai/api/v1/smart-money/holdings` | routed (MPP outbound) | $0.0525 |
| Netflows | POST | `https://api.nansen.ai/api/v1/smart-money/netflow` | routed (MPP outbound) | $0.0525 |

- **Provider:** Nansen AI
- **Payment:** Routed via the SELAT Router (outbound leg: MPP/tempo:4217).
