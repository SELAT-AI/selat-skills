# Endpoints — wallet-holdings

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| token holdings | POST | `https://x402.alchemy.com/data/v1/assets/tokens/by-address` | direct (Gateway-batched) | $0.005 |

- **Provider:** Alchemy
- **Payment:** Circle nanopayment, paid directly to the upstream (no router hop).
- **Body:** `{ "addresses": ["${address}"] }`
