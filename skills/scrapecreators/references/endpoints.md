# Endpoints — scrapecreators

Use only these endpoint families for `scrapecreators`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — X/Twitter profile | GET | `https://catalog.selat.ai/twitter/user/info?userName=${twitterHandle}` | x402 via Circle Gateway | $0.001 | $0.002 |
| 2 — X/Twitter recent posts | GET | `https://catalog.selat.ai/twitter/user/last_tweets?userName=${twitterHandle}` | x402 via Circle Gateway | $0.001 | $0.002 |
| 3 — X/Twitter supplied tweet | GET | `https://catalog.selat.ai/twitter/tweets?tweet_ids=${tweetId}` | x402 via Circle Gateway | $0.001 | $0.002 |
| 4 — LinkedIn person profile | GET | `https://mpp.orthogonal.com/scrapecreators/v1/linkedin/profile?url=${linkedinProfileUrl}` | MPP on Tempo | $0.021 | $0.03 |
| 5 — LinkedIn post or article | GET | `https://mpp.orthogonal.com/scrapecreators/v1/linkedin/post?url=${linkedinPostUrl}` | MPP on Tempo | $0.021 | $0.03 |
| 6 — LinkedIn company page | GET | `https://mpp.orthogonal.com/scrapecreators/v1/linkedin/company?url=${linkedinCompanyUrl}` | MPP on Tempo | $0.021 | $0.03 |
| 7 — Instagram profile | GET | `https://mpp.orthogonal.com/scrapecreators/v1/instagram/profile?handle=${instagramHandle}&trim=true` | MPP on Tempo | $0.021 | $0.03 |
| 8 — Instagram recent posts | GET | `https://mpp.orthogonal.com/scrapecreators/v2/instagram/user/posts?handle=${instagramHandle}&trim=true` | MPP on Tempo | $0.021 | $0.03 |
| 9 — TikTok profile | GET | `https://mpp.orthogonal.com/scrapecreators/v1/tiktok/profile?handle=${tiktokHandle}` | MPP on Tempo | $0.021 | $0.03 |
| 10 — TikTok hashtag results | GET | `https://mpp.orthogonal.com/scrapecreators/v1/tiktok/search/hashtag?hashtag=${tiktokHashtag}&region=${region}&trim=true` | MPP on Tempo | $0.021 | $0.03 |
| 11 — TikTok regional trending feed | GET | `https://mpp.orthogonal.com/scrapecreators/v1/tiktok/get-trending-feed?region=${region}&trim=true` | MPP on Tempo | $0.021 | $0.03 |

This is a fixed 11-call manifest. The step table matches `manifest.json`
exactly, and `selat skill run` pays for every step on every run. Live-probed
total (2026-10-04): **$0.171** (3 × $0.001 + 8 × $0.021). Sum of per-step caps:
**$0.246**. The top-level `maxAmount` (`$0.03`) is only a per-step fallback for
a step without its own cap; it is not a cumulative run cap. Each step is its own
payment, so there is no duplicate call: the two Instagram steps hit different
endpoints (profile vs. posts).

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`). The probe reports `routed-x402`. The buyer pays from whichever chain holds the funded Gateway balance. This is not a pay-chain claim.
- **MPP on Tempo:** Scrape Creators sync endpoints (`mpp.orthogonal.com/scrapecreators`). The probe reports `routed-mpp`.

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`, 2026-10-04). Per-step cap
`$0.002`. All endpoints are **GET with query-string params**. Strip a leading
`@`. Do not pass a profile URL where a handle is required, or a tweet URL where
a numeric ID is required.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| X/Twitter profile | `/twitter/user/info` | `userName` (string, required — handle, no `@`) |
| X/Twitter recent posts | `/twitter/user/last_tweets` | `userName` (string, required). Returns one page; a returned cursor is not followed automatically. |
| X/Twitter supplied tweet | `/twitter/tweets` | `tweet_ids` (comma-separated numeric IDs; this manifest supplies one) |

Query pattern:

```text
https://catalog.selat.ai/twitter/tweets?tweet_ids=20
```

## Scrape Creators — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/scrapecreators`

Live-probed price: `$0.021` per call (`routed-mpp`, 2026-10-04). Per-step cap
`$0.03`. All endpoints are **GET with query-string params** and are
synchronous: they return the requested data directly, not a
`{jobId, status: "pending"}` job. This is checked against the provider's
OpenAPI, not yet against a paid 200.

### LinkedIn

All three endpoints use the query key `url`, but each expects a different URL
type. Only publicly visible information is in scope.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| LinkedIn person profile | `/v1/linkedin/profile` | `url` (public person-profile URL, required) |
| LinkedIn post or article | `/v1/linkedin/post` | `url` (public post or article URL, required) |
| LinkedIn company page | `/v1/linkedin/company` | `url` (public company-page URL, required) |

### Instagram

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Instagram profile | `/v1/instagram/profile` | `handle` (string, required), `trim` (`true`) |
| Instagram recent posts | `/v2/instagram/user/posts` | `handle` (string, required), `trim` (`true`). Returns one page; `next_max_id` would need a separate approved call. |

### TikTok

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| TikTok profile | `/v1/tiktok/profile` | `handle` (string, required). Returns profile metadata, not videos. |
| TikTok hashtag results | `/v1/tiktok/search/hashtag` | `hashtag` (string, required, no `#`), `region` (two-letter proxy region), `trim` (`true`) |
| TikTok regional trending feed | `/v1/tiktok/get-trending-feed` | `region` (two-letter, required), `trim` (`true`) |

The provider says `region` sets the proxy/feed context. It does not limit
results to creators located in that region. Hashtag and trending results are
topical context. Do not attribute them to the researched account.

## Free probes

Whole skill (reads payment challenges only, never settles):

```bash
selat skill verify ./skills/scrapecreators \
  --twitterHandle "satyanadella" \
  --tweetId "1632748758613241857" \
  --linkedinProfileUrl "https://www.linkedin.com/in/satyanadella/" \
  --linkedinPostUrl "https://www.linkedin.com/posts/satyanadella_its-been-a-busy-few-weeks-between-today-activity-7323480567562276865-F2mk" \
  --linkedinCompanyUrl "https://www.linkedin.com/company/microsoft/" \
  --instagramHandle "microsoft" \
  --tiktokHandle "microsoft" \
  --tiktokHashtag "microsoft" \
  --region "US" \
  --live-probe
```

Single step (`--chain base` is only selat-pay's required flag; a probe never
settles, and paid runs use whichever chain holds your Gateway balance):

```bash
selat-pay GET "https://catalog.selat.ai/twitter/user/info?userName=jack" --chain base --max-amount 0.002 --probe-only --live-probe
selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/linkedin/profile?url=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fsatyanadella%2F" --chain base --max-amount 0.03 --probe-only --live-probe
```

## Corrections made during QC

1. **Removed unrelated defaults.** All nine identifiers are required, with no
   default, and must describe one coherent target. There is no fabricated tweet
   ID or placeholder LinkedIn post URL.
2. **Fixed-run behavior.** The CLI runs every manifest step. It has no platform
   selector, conditional branch, or step-to-step dataflow.
3. **Replaced async StableSocial jobs.** The former Instagram/TikTok endpoints
   returned `{jobId, status: "pending", pollUrl, token}` and needed SIWX polling
   that a manifest cannot chain. They are now synchronous Scrape Creators reads.
4. **Real trending feed.** Keyword search for `trending` was replaced with the
   dedicated regional trending-feed endpoint.
5. **Matching LinkedIn routes.** The dead Clado routes were replaced on `main`
   (#113). Person, post, and company URLs now go to their matching Scrape
   Creators endpoint.
6. **Removed a duplicate paid call.** Two former Instagram profile steps called
   the same endpoint with the same default handle.
7. **Separate platform handles.** Twitter/X, Instagram, and TikTok each have
   their own required handle.
8. **Tightened caps.** Caps were $4.89 summed for a $0.444 live run. They are
   now $0.246 for $0.171.

## Provider schema sources

- Twitter: `https://catalog.selat.ai/twitter/openapi.json`
- Scrape Creators payment wrapper: `https://mpp.orthogonal.com/scrapecreators/openapi.json`
- Per-endpoint docs: `https://docs.scrapecreators.com/<version>/<platform>/<endpoint>/openapi.json`
  (e.g. `/v1/linkedin/profile`, `/v2/instagram/user/posts`, `/v1/tiktok/get-trending-feed`)

The live payment challenge is authoritative for reachability, routing mode,
and price. The upstream OpenAPI is authoritative for request and response shape.
Neither guarantees that a specific public identity will return data.
