# Endpoints — crypto-fear-greed

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| fear & greed index | GET | `https://x402-data-tools.prd.arrays.org/api/v1/crypto/fear-greed-index?start_time=${start_time}&end_time=${end_time}` | direct (Gateway-batched) | $0.008 |

- **Provider:** Arrays
- **Payment:** Circle nanopayment, paid directly to the upstream (no router hop).
- **Query params:** `start_time`, `end_time` — Unix timestamps in **seconds** (UTC), `end_time` > `start_time`.
- **Upstream docs:** https://x402-data-tools.prd.space.id/docs/output/v1_crypto_fear-greed-index_get.json
