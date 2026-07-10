# scrapecreators — endpoints

Multi-merchant social scraping across **AIsa** (X/Twitter — Circle x402 catalog, direct, Circle Gateway-batched), **StableSocial** (Instagram + TikTok — MPP, routed via the SELAT Router), and **Clado** (LinkedIn — MPP, routed). Every endpoint below is probe-verified live-payable (`selat-pay --probe-only`, 2026-07-10). Caps are a 5 USDC spending filter, not the live price.

## Endpoints used

| # | Step | Method | URL | Rail | Live price |
|---|---|---|---|---|---|
| 1 | X/Twitter profile — AIsa | GET | `https://api.aisa.one/apis/v2/twitter/user/info?userName=${handle}` | direct | $0.00044 |
| 2 | X/Twitter user tweets — AIsa | GET | `https://api.aisa.one/apis/v2/twitter/user/last_tweets?userName=${handle}` | direct | $0.0036 |
| 3 | X/Twitter tweet details — AIsa | GET | `https://api.aisa.one/apis/v2/twitter/tweets?tweet_ids=${tweetId}` | direct | $0.0022 |
| 4 | LinkedIn profile — Clado | POST | `https://clado.mpp.paywithlocus.com/clado/linkedin-profile` body `{"linkedin_url":"${linkedinUrl}"}` | routed MPP | $0.01365 |
| 5 | LinkedIn post — Clado scrape | POST | `https://clado.mpp.paywithlocus.com/clado/scrape` body `{"linkedin_url":"${linkedinPostUrl}"}` | routed MPP | $0.02415 |
| 6 | LinkedIn company page — Clado scrape | POST | `https://clado.mpp.paywithlocus.com/clado/scrape` body `{"linkedin_url":"${linkedinCompanyUrl}"}` | routed MPP | $0.02415 |
| 7 | Instagram profile — StableSocial | POST | `https://stablesocial.dev/api/instagram/profile` body `{"handle":"${handle}"}` | routed MPP | $0.063 |
| 8 | Instagram profile by handle — StableSocial | POST | `https://stablesocial.dev/api/instagram/profile` body `{"handle":"${instagramHandle}"}` | routed MPP | $0.063 |
| 9 | Instagram recent posts — StableSocial | POST | `https://stablesocial.dev/api/instagram/posts` body `{"handle":"${handle}"}` | routed MPP | $0.063 |
| 10 | TikTok profile — StableSocial | POST | `https://stablesocial.dev/api/tiktok/profile` body `{"handle":"${handle}"}` | routed MPP | $0.063 |
| 11 | TikTok hashtag search — StableSocial | POST | `https://stablesocial.dev/api/tiktok/search-hashtag` body `{"hashtag":"${hashtag}"}` | routed MPP | $0.063 |
| 12 | TikTok trending via keyword search — StableSocial | POST | `https://stablesocial.dev/api/tiktok/search` body `{"query":"trending"}` | routed MPP | $0.063 |

Full-run cap (`maxAmount`): **$5.00** (loose spending filter); per-step cap **$5.00**. Live total across all 12 steps ≈ **$0.45**.

## Capability notes

- **Tweet details take a tweet ID, not a URL** (step 3): AIsa's `tweet_ids` param is the numeric tweet ID. The old `tweetUrl` param was renamed to `tweetId`.
- **Instagram lookups are by handle, not numeric userId** (step 8): StableSocial resolves profiles by handle. The old `instagramUserId` param was renamed to `instagramHandle`.
- **No single-Instagram-post-by-URL endpoint** (step 9): the closest equivalent is StableSocial's recent-posts-by-handle. The old `instagramPostUrl` param was removed; step 9 uses `${handle}`.
- **No TikTok trending-feed endpoint** (step 12): the closest equivalent is StableSocial's keyword search with `{"query":"trending"}`. The old `region` param was removed.
