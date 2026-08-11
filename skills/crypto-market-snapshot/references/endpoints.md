# Endpoints — crypto-market-snapshot

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| token prices | GET | `https://store.agentexchange.work/crypto/prices?ids=${ids}` | routed x402 via SELAT Router | ~$0.0105/call |

- **Provider:** agentexchange store (Token Price Snapshot) — live USD prices by CoinGecko id, sourced from DefiLlama with attribution.
- **Payment:** routed via the SELAT Router (outbound leg: Gateway-batched x402, `payTo` on eip155:8453, verified by probe).
- **Schema (declared):** query param `ids` (string, comma-separated CoinGecko ids). No body, no auth header.
- **Probe evidence:** `selat-pay GET "https://store.agentexchange.work/crypto/prices?ids=bitcoin,ethereum,solana" --chain base --max-amount 0.015 --probe-only` → mode `routed-x402`, price `$0.010500 USDC`, `status=200`.
