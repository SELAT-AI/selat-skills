# twitter-research — endpoints

A curated menu of **9 SELAT-native Twitter GET reads** (`catalog.selat.ai`),
each probe-verified live-payable as an **x402 via Circle Gateway** call
(Circle Gateway-batched; `selat-pay --probe-only`, 2026-07-25). `maxAmount` caps
carry headroom over the live price. The agent runs only the endpoints a request
needs — this is a menu, not a pipeline.

Request schemas below are pinned from the service's own OpenAPI
(`GET https://catalog.selat.ai/twitter/openapi.json`, "twitter service", OpenAPI
3.0.3). All params are `in: query`, type `string`. The spec is request-only (no
response schemas), so response fields are described from live reads, not the spec.

| # | Group | Endpoint | Params | Live price |
|---|---|---|---|---|
| 1 | account | `GET catalog.selat.ai/twitter/user/info?userName=${handle}` | `userName` | $0.001 |
| 2 | account | `GET catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | `userName`, `cursor` | $0.001 |
| 3 | account | `GET catalog.selat.ai/twitter/user/mentions?userName=${handle}` | `userName`, `cursor` | $0.001 |
| 4 | account | `GET catalog.selat.ai/twitter/user/followers?userName=${handle}` | `userName`, `cursor` | $0.001 |
| 5 | search | `GET catalog.selat.ai/twitter/tweet/advanced_search?query=${query}` | `query`, `cursor` | $0.001 |
| 6 | trends | `GET catalog.selat.ai/twitter/trends?woeid=${woeid}` | `woeid` | $0.001 |
| 7 | tweet | `GET catalog.selat.ai/twitter/tweets?tweet_ids=${tweetId}` | `tweet_ids` | $0.001 |
| 8 | tweet | `GET catalog.selat.ai/twitter/tweet/replies?tweetId=${tweetId}` | `tweetId`, `cursor` | $0.001 |
| 9 | tweet | `GET catalog.selat.ai/twitter/tweet/retweeters?tweetId=${tweetId}` | `tweetId`, `cursor` | $0.001 |

Per-step cap **$0.10**, full-run cap **$0.10**. A selected 1-3 endpoint run costs
$0.001-$0.003; the full 9-step smoke test (`verify --pay`) is ~$0.009.

## Request parameter schema (from OpenAPI)

Every parameter is `in: query`, type `string`. `req` = required by the spec.
"Manifest param" is the `${…}` skill input that fills it.

| # | Endpoint | Param | Req | Manifest param | Notes / format |
|---|---|---|---|---|---|
| 1 | `/twitter/user/info` | `userName` | ✅ | `${handle}` | Twitter screen name, **no leading `@`** (e.g. `openai`). |
| 2 | `/twitter/user/last_tweets` | `userName` | ✅ | `${handle}` | Screen name. |
| | | `cursor` | | — | Opaque pagination token from a prior page's response. |
| 3 | `/twitter/user/mentions` | `userName` | ✅ | `${handle}` | Screen name. |
| | | `cursor` | | — | Pagination token. |
| 4 | `/twitter/user/followers` | `userName` | ✅ | `${handle}` | Screen name. |
| | | `cursor` | | — | Pagination token. |
| 5 | `/twitter/tweet/advanced_search` | `query` | ✅ | `${query}` | X search grammar: `from:`, `to:`, `$TICKER`, `#tag`, `min_faves:`, `since:`/`until:`, `lang:`. URL-encode spaces. |
| | | `cursor` | | — | Pagination token. |
| 6 | `/twitter/trends` | `woeid` | ✅ | `${woeid}` | Yahoo WOEID as a **string** (`1` = worldwide, `23424977` = US, `2459115` = NYC). |
| 7 | `/twitter/tweets` | `tweet_ids` | ✅ | `${tweetId}` | **Comma-separated** numeric IDs — this endpoint batches many (`20,21,22`). The manifest passes one; hand-build the call for a batch. |
| 8 | `/twitter/tweet/replies` | `tweetId` ⚠ | ✅ | `${tweetId}` | **Singular** — one numeric ID. ⚠ Live API wants **`tweetId`** (camelCase); the OpenAPI's `tweet_id` returns `400 "tweetId is required"`. |
| | | `cursor` | | — | Pagination token. |
| 9 | `/twitter/tweet/retweeters` | `tweetId` ⚠ | ✅ | `${tweetId}` | **Singular** — one numeric ID. ⚠ Same as #8: live API wants **`tweetId`**, not the OpenAPI's `tweet_id`. |

### Schema gotchas (what to get right so a paid call doesn't 4xx)

- **The API param is `userName`, not `handle`.** The manifest maps `${handle}` →
  `userName=` in the URL; pass the handle **without** the `@`.
- **Three different tweet-id param names — the OpenAPI is unreliable here, live API is authoritative** (verified by paid `verify --pay`, 2026-07-25):
  - `/twitter/tweets` → **`tweet_ids`** (snake_case, plural, comma-separated batch).
  - `/tweet/replies` and `/tweet/retweeters` → **`tweetId`** (camelCase, singular).
    The OpenAPI documents these as `tweet_id`, but that returns
    `400 {"detail":"tweetId is required"}`. The manifest uses `tweetId`.
  - Don't send a comma-separated value to the singular endpoints.
- **`woeid` is typed `string`** in the spec even though it looks numeric — pass it
  as-is; it works either way through query-string substitution.
- **`cursor` is not a manifest param.** The 4 paginated reads
  (`last_tweets`, `mentions`, `followers`, `advanced_search` replies/retweeters)
  return a `cursor`/`next_cursor`; to page, take it from the response and issue a
  hand-built `selat-pay GET …&cursor=<token>` — each page is another ~$0.001 read.
- **URL-encode `query`** (spaces → `%20`) for `advanced_search`.

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
