# Endpoints — allium-price

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| token price | POST | `https://agents.allium.so/api/v1/developer/prices` | routed (tempo-native MPP) | $0.021 |

- **Provider:** Allium
- **Payment:** routed via the SELAT Router — the router translates the agent's inbound Gateway-batched payment into an outbound MPP/tempo payment.
- **Body:** `[{ "chain": "${tokenChain}", "token_address": "${tokenAddress}" }]` (a JSON list)
