# market-snapshot

**Multi-rail** · crypto spot price (DIRECT) + token price (ROUTED MPP)

A cross-rail price snapshot that deliberately exercises **both** SELAT payment rails in a single run:

1. **Step 1 — Alchemy** (`GET /prices/v1/tokens/by-symbol`) — a Circle nanopayment / Gateway-batched call paid **directly** to the upstream (no router hop, no markup).
2. **Step 2 — Allium** (`POST /api/v1/developer/prices`) — a tempo-native **MPP** call **routed through the SELAT Router**, which translates the agent's inbound Gateway-batched payment into an outbound MPP payment.

## Params

| Param | Default | Notes |
|---|---|---|
| `symbols` | `ETH,BTC` | Comma-separated symbols for the Alchemy step |
| `tokenChain` | `ethereum` | Chain for the Allium lookup |
| `tokenAddress` | `0xa0b8…eb48` (USDC) | Token contract for the Allium price |

## Run

```bash
selat skill install market-snapshot
selat skill run market-snapshot
selat skill run market-snapshot --symbols ETH,SOL --tokenAddress 0x...
```

## Cost

≈ $0.005 (direct) + ≈ $0.021 (routed) per run, capped by `maxAmount`.
