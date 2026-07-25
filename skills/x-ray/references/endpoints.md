# x-ray — endpoints

A curated menu of **9 SELAT-native Twitter GET reads** (`catalog.selat.ai`),
each probe-verified live-payable as an **x402 via Circle Gateway** call
(Circle Gateway-batched; `selat-pay --probe-only`, 2026-07-25). `maxAmount` caps
carry headroom over the live price. The agent runs only the endpoints a request
needs — this is a menu, not a pipeline.

| # | Group | Endpoint | Params | Live price |
|---|---|---|---|---|
| 1 | account | `GET catalog.selat.ai/twitter/user/info?userName=${handle}` | `userName` | $0.001 |
| 2 | account | `GET catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | `userName`, `cursor` | $0.001 |
| 3 | account | `GET catalog.selat.ai/twitter/user/mentions?userName=${handle}` | `userName`, `cursor` | $0.001 |
| 4 | account | `GET catalog.selat.ai/twitter/user/followers?userName=${handle}` | `userName`, `cursor` | $0.001 |
| 5 | search | `GET catalog.selat.ai/twitter/tweet/advanced_search?query=${query}` | `query`, `cursor` | $0.001 |
| 6 | trends | `GET catalog.selat.ai/twitter/trends?woeid=${woeid}` | `woeid` | $0.001 |
| 7 | tweet | `GET catalog.selat.ai/twitter/tweets?tweet_ids=${tweetId}` | `tweet_ids` | $0.001 |
| 8 | tweet | `GET catalog.selat.ai/twitter/tweet/replies?tweet_id=${tweetId}` | `tweet_id`, `cursor` | $0.001 |
| 9 | tweet | `GET catalog.selat.ai/twitter/tweet/retweeters?tweet_id=${tweetId}` | `tweet_id`, `cursor` | $0.001 |

Per-step cap **$0.10**, full-run cap **$0.10**. A selected 1-3 endpoint run costs
$0.001-$0.003; the full 9-step smoke test (`verify --pay`) is ~$0.009.

## Rails & provider

- **x402 via Circle Gateway** — every step hits SELAT's own first-party Twitter
  API at `catalog.selat.ai`, which serves a native x402 (`GatewayWalletBatched`)
  challenge. The SELAT Router settles it on the wallet's funded Gateway chain, so
  `SELAT_ROUTER_URL` must be reachable. USDC on 11 EVM chains is accepted; the
  settlement chain is resolved at runtime from the funded Gateway balance.

## Live probes (free; no wallet)

```bash
selat-pay GET "https://catalog.selat.ai/twitter/user/info?userName=openai"                  --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/user/last_tweets?userName=openai"           --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/user/mentions?userName=openai"              --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/user/followers?userName=openai"             --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=AI%20agents"     --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/trends?woeid=1"                             --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/tweets?tweet_ids=20"                        --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/tweet/replies?tweet_id=20"                  --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/tweet/retweeters?tweet_id=20"               --chain base --probe-only
```

A served endpoint prints `detected x402=yes ... price=$0.001000 on eip155:8453`.
