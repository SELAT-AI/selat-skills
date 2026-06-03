# Endpoints — market-snapshot

Multi-rail: one direct leg + one routed leg.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 · spot price | GET | `https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=${symbols}` | direct (Gateway-batched) | $0.005 |
| 2 · token price | POST | `https://agents.allium.so/api/v1/developer/prices` | routed (tempo-native MPP) | $0.021 |

- **Step 1 — Alchemy:** Circle nanopayment, paid directly to the upstream (no router hop).
- **Step 2 — Allium:** routed via the SELAT Router, which translates the inbound Gateway-batched payment into an outbound MPP payment. Body: `[{ "chain": "${tokenChain}", "token_address": "${tokenAddress}" }]`.
