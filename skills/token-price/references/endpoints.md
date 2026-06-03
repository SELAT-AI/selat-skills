# Endpoints — token-price

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| spot price | GET | `https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=${symbols}` | direct (Gateway-batched) | $0.005 |

- **Provider:** Alchemy
- **Payment:** Circle nanopayment, paid directly to the upstream (no router hop, no markup).
