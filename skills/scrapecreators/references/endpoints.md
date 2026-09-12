# Endpoints — scrapecreators

Use only these endpoint families for `scrapecreators`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

LinkedIn public-page reads use Scrape Creators sync endpoints on
`mpp.orthogonal.com` (already the YouTube host in `account-intel`). Dead Clado
`/linkedin-profile` and `/scrape` were removed.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — X/Twitter profile | GET | `https://catalog.selat.ai/twitter/user/info?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 2 — X/Twitter user tweets | GET | `https://catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 3 — X/Twitter tweet details | GET | `https://catalog.selat.ai/twitter/tweets?tweet_ids=${tweetId}` | x402 via Circle Gateway | $0.001 |
| 4 — LinkedIn profile | GET | `https://mpp.orthogonal.com/scrapecreators/v1/linkedin/profile?url=${linkedinUrl}` | MPP on Tempo | $0.021 |
| 5 — LinkedIn post | GET | `https://mpp.orthogonal.com/scrapecreators/v1/linkedin/post?url=${linkedinPostUrl}` | MPP on Tempo | $0.021 |
| 6 — LinkedIn company page | GET | `https://mpp.orthogonal.com/scrapecreators/v1/linkedin/company?url=${linkedinCompanyUrl}` | MPP on Tempo | $0.021 |
| 7 — Instagram profile | POST | `https://stablesocial.dev/api/instagram/profile` | MPP on Tempo | $0.063 |
| 8 — Instagram profile by handle | POST | `https://stablesocial.dev/api/instagram/profile` | MPP on Tempo | $0.063 |
| 9 — Instagram recent posts | POST | `https://stablesocial.dev/api/instagram/posts` | MPP on Tempo | $0.063 |
| 10 — TikTok profile | POST | `https://stablesocial.dev/api/tiktok/profile` | MPP on Tempo | $0.063 |
| 11 — TikTok hashtag search | POST | `https://stablesocial.dev/api/tiktok/search-hashtag` | MPP on Tempo | $0.063 |
| 12 — TikTok trending via keyword | POST | `https://stablesocial.dev/api/tiktok/search` | MPP on Tempo | $0.063 |

This is a fixed 12-call manifest. The step table matches `manifest.json`
exactly. Live total across all 12 steps ≈ $0.45.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`). Verify prints `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** Scrape Creators (`mpp.orthogonal.com/scrapecreators`) and StableSocial (`stablesocial.dev`).

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`). All endpoints are **GET
with query-string params**. Tweet details take a numeric tweet ID, not a URL.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| X/Twitter profile | `/twitter/user/info` | `userName` (string, required — handle, no `@`) |
| X/Twitter user tweets | `/twitter/user/last_tweets` | `userName` (string, required) |
| X/Twitter tweet details | `/twitter/tweets` | `tweet_ids` (comma-separated numeric IDs) |

Query pattern:

```text
https://catalog.selat.ai/twitter/tweets?tweet_ids=1234567890123456789
```

## Scrape Creators LinkedIn — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/scrapecreators`

Live-probed price: `$0.021` per call (`routed-mpp`, 2026-09-12). All three
LinkedIn endpoints are **GET with a query-string `url`**. Each expects a
different URL type. Per-step cap `$0.03`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| LinkedIn profile | `/v1/linkedin/profile` | `url` — public person-profile URL |
| LinkedIn post | `/v1/linkedin/post` | `url` — public post or article URL |
| LinkedIn company page | `/v1/linkedin/company` | `url` — public company-page URL |

```text
https://mpp.orthogonal.com/scrapecreators/v1/linkedin/profile?url=https://linkedin.com/in/satyanadella
```

Do not call Clado `/linkedin-profile` or `/scrape` (dead — no 402).

## StableSocial — `MPP on Tempo`

serviceUrl: `https://stablesocial.dev`

Live-probed price: `$0.063` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. Instagram lookups are by handle, not numeric userId. There
is no single-Instagram-post-by-URL endpoint — the closest equivalent is
recent-posts-by-handle. There is no TikTok trending-feed endpoint — the closest
equivalent is keyword search with `{"query":"trending"}`.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Instagram profile | `/api/instagram/profile` | `handle` (string — `${handle}`) |
| Instagram profile by handle | `/api/instagram/profile` | `handle` (string — `${instagramHandle}`) |
| Instagram recent posts | `/api/instagram/posts` | `handle` (string) |
| TikTok profile | `/api/tiktok/profile` | `handle` (string) |
| TikTok hashtag search | `/api/tiktok/search-hashtag` | `hashtag` (string, no `#`) |
| TikTok trending via keyword | `/api/tiktok/search` | `query` (string — manifest sends `"trending"`) |

```json
{ "handle": "openai" }
```
