# Endpoints — twitter-research

Use only these endpoint families for `twitter-research`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Account profile | GET | `https://catalog.selat.ai/twitter/user/info?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 2 — Recent tweets | GET | `https://catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 3 — Mentions | GET | `https://catalog.selat.ai/twitter/user/mentions?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 4 — Followers | GET | `https://catalog.selat.ai/twitter/user/followers?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 5 — Topic search | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${query}` | x402 via Circle Gateway | $0.001 |
| 6 — Trends | GET | `https://catalog.selat.ai/twitter/trends?woeid=${woeid}` | x402 via Circle Gateway | $0.001 |
| 7 — Tweet details | GET | `https://catalog.selat.ai/twitter/tweets?tweet_ids=${tweetId}` | x402 via Circle Gateway | $0.001 |
| 8 — Tweet replies | GET | `https://catalog.selat.ai/twitter/tweet/replies?tweetId=${tweetId}` | x402 via Circle Gateway | $0.001 |
| 9 — Tweet retweeters | GET | `https://catalog.selat.ai/twitter/tweet/retweeters?tweetId=${tweetId}` | x402 via Circle Gateway | $0.001 |

This is a fixed 9-call menu in `manifest.json` — not a cheapest-first pipeline.
The agent selects only the endpoints a request needs. A selected 1–3 endpoint
run costs $0.001–$0.003; the full 9-step smoke test is ~$0.009.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`) serves a native x402 (`GatewayWalletBatched`) challenge. Verify prints `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain claim.

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`). All endpoints are **GET
with query-string params**. Request schemas are pinned from
`GET https://catalog.selat.ai/twitter/openapi.json`. The live API is
authoritative for tweet-id param names.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Account profile | `/twitter/user/info` | `userName` (string, required — no `@`) |
| Recent tweets | `/twitter/user/last_tweets` | `userName` (required), `cursor` (optional pagination) |
| Mentions | `/twitter/user/mentions` | `userName` (required), `cursor` (optional) |
| Followers | `/twitter/user/followers` | `userName` (required), `cursor` (optional) |
| Topic search | `/twitter/tweet/advanced_search` | `query` (required — X operators), `cursor` (optional) |
| Trends | `/twitter/trends` | `woeid` (string — `1` worldwide, `23424977` US, `2459115` NYC) |
| Tweet details | `/twitter/tweets` | `tweet_ids` (comma-separated numeric IDs) |
| Tweet replies | `/twitter/tweet/replies` | `tweetId` (singular camelCase), `cursor` (optional) |
| Tweet retweeters | `/twitter/tweet/retweeters` | `tweetId` (singular camelCase), `cursor` (optional) |

Query pattern:

```text
https://catalog.selat.ai/twitter/tweet/advanced_search?query=AI%20agents
```

Schema gotchas (so a paid call does not 4xx):

- The API param is `userName`, not `handle`. The manifest maps `${handle}` →
  `userName=`.
- `/twitter/tweets` wants **`tweet_ids`** (plural, comma-separated batch).
  `/twitter/tweet/replies` and `/twitter/tweet/retweeters` want **`tweetId`**
  (camelCase, singular). The OpenAPI's `tweet_id` returns
  `400 "tweetId is required"`.
- `cursor` is not a manifest param. To page, take `cursor`/`next_cursor` from
  the response and issue a hand-built `selat-pay GET …&cursor=<token>` — each
  page is another ~$0.001 read.
- URL-encode `query` (spaces → `%20`) for `advanced_search`.
