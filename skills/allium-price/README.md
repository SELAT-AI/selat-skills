# allium-price

**Single-rail** · ROUTED (tempo-native MPP)

Latest token price via Allium, routed through the SELAT Router — the router translates the agent's inbound Gateway-batched payment into an outbound MPP/tempo payment.

## Params

| Param | Default | Notes |
|---|---|---|
| `tokenChain` | `ethereum` | Chain for the lookup |
| `tokenAddress` | `0xa0b8…eb48` (USDC) | Token contract |

## Run

```bash
selat skill install allium-price
selat skill run allium-price --tokenAddress 0x...
```

## Cost

≈ $0.021 per run (router-quoted), capped at $0.025.
