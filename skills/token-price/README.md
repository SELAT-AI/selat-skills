# token-price

**Single-rail** · DIRECT (Circle nanopayment)

Spot prices for one or more tokens by symbol via Alchemy, paid directly over Gateway-batched (no router hop).

## Params

| Param | Required | Notes |
|---|---|---|
| `symbols` | yes | Comma-separated symbols, e.g. `ETH,USDC,BTC` |

## Run

```bash
selat skill install token-price
selat skill run token-price --symbols ETH,USDC,BTC
```

## Cost

≈ $0.005 per run.
