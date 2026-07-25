# twitter-topic-monitor — endpoints

Both endpoints are probe-verified live-payable as **x402 via Circle Gateway**
calls (SELAT-native catalog, Circle Gateway-batched; `selat-pay --probe-only`,
2026-07-25). `maxAmount` caps carry headroom over the live price, they are not
the price.

| Step | Endpoint | Params | Live price |
|---|---|---|---|
| 1 | `GET catalog.selat.ai/twitter/tweet/advanced_search?query=${query}` | `query` (required), `cursor` (optional, pagination) | $0.001 |
| 2 | `GET catalog.selat.ai/twitter/trends?woeid=${woeid}` | `woeid` (required; `1` = worldwide) | $0.001 |

Full-run cap (`maxAmount`): **$0.10**; per-step cap **$0.10**. Live total ≈ $0.002.

## Rails & provider

- **x402 via Circle Gateway** — both steps hit SELAT's own first-party Twitter
  API at `catalog.selat.ai`, which serves a native x402 (`GatewayWalletBatched`)
  challenge. The SELAT Router settles it on the wallet's funded Gateway chain, so
  `SELAT_ROUTER_URL` must be reachable. USDC on 11 EVM chains is accepted; the
  settlement chain is resolved at runtime from the funded Gateway balance.

## Live probes (free; no wallet)

```bash
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=AI%20agents" \
  --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/trends?woeid=1" \
  --chain base --probe-only
```

A served endpoint prints `detected x402=yes ... price=$0.001000 on eip155:8453`.
