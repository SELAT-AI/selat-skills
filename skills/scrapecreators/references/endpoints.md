# scrapecreators — endpoint reference

This skill is a fixed 11-call, read-only bundle across two provider groups:

- three SELAT-native Twitter/X reads from `catalog.selat.ai`, settling as
  `routed-x402` via Circle Gateway; and
- eight synchronous Scrape Creators reads from `mpp.orthogonal.com`, settling
  as `routed-mpp` over MPP on Tempo.

Every endpoint below was checked against its provider OpenAPI document and
free-probed on 2026-08-31. A free probe validates the payment challenge, input
schema exposed by the Router, current routing mode, and price. It does not prove
that a particular identity is public, valid, or guaranteed to return data.

## Endpoint inventory

| # | Capability | Request | Required input | Live mode | Live quote | Cap |
|---|---|---|---|---|---:|---:|
| 1 | Twitter/X profile | `GET https://catalog.selat.ai/twitter/user/info?userName=${twitterHandle}` | `twitterHandle` | `routed-x402` | $0.001 | $0.002 |
| 2 | Twitter/X recent posts | `GET https://catalog.selat.ai/twitter/user/last_tweets?userName=${twitterHandle}` | `twitterHandle` | `routed-x402` | $0.001 | $0.002 |
| 3 | Twitter/X supplied tweet | `GET https://catalog.selat.ai/twitter/tweets?tweet_ids=${tweetId}` | `tweetId` | `routed-x402` | $0.001 | $0.002 |
| 4 | LinkedIn person profile | `GET https://mpp.orthogonal.com/scrapecreators/v1/linkedin/profile?url=${linkedinProfileUrl}` | person-profile URL | `routed-mpp` | $0.021 | $0.030 |
| 5 | LinkedIn post/article | `GET https://mpp.orthogonal.com/scrapecreators/v1/linkedin/post?url=${linkedinPostUrl}` | post/article URL | `routed-mpp` | $0.021 | $0.030 |
| 6 | LinkedIn company page | `GET https://mpp.orthogonal.com/scrapecreators/v1/linkedin/company?url=${linkedinCompanyUrl}` | company-page URL | `routed-mpp` | $0.021 | $0.030 |
| 7 | Instagram profile | `GET https://mpp.orthogonal.com/scrapecreators/v1/instagram/profile?handle=${instagramHandle}&trim=true` | `instagramHandle` | `routed-mpp` | $0.021 | $0.030 |
| 8 | Instagram recent posts | `GET https://mpp.orthogonal.com/scrapecreators/v2/instagram/user/posts?handle=${instagramHandle}&trim=true` | `instagramHandle` | `routed-mpp` | $0.021 | $0.030 |
| 9 | TikTok profile | `GET https://mpp.orthogonal.com/scrapecreators/v1/tiktok/profile?handle=${tiktokHandle}` | `tiktokHandle` | `routed-mpp` | $0.021 | $0.030 |
| 10 | TikTok hashtag results | `GET https://mpp.orthogonal.com/scrapecreators/v1/tiktok/search/hashtag?hashtag=${tiktokHashtag}&region=${region}&trim=true` | hashtag; optional provider region | `routed-mpp` | $0.021 | $0.030 |
| 11 | TikTok trending feed | `GET https://mpp.orthogonal.com/scrapecreators/v1/tiktok/get-trending-feed?region=${region}&trim=true` | `region` | `routed-mpp` | $0.021 | $0.030 |

Expected total at the 2026-08-31 quotes: **$0.171**. The sum of all per-step
caps is **$0.246**. The top-level `$0.03` is only a fallback cap and is not a
cumulative budget.

## Request and response contracts

### Twitter/X

- `user/info` requires `userName` and returns public profile data.
- `user/last_tweets` accepts `userName` and returns one page of recent public
  posts. A returned cursor is not followed automatically.
- `tweets` requires `tweet_ids`, a comma-separated list of numeric tweet IDs.
  This manifest intentionally supplies one numeric ID.

All three are GET requests. Strip a leading `@`; do not pass a profile URL or a
tweet URL where a handle or numeric ID is required.

### LinkedIn via Scrape Creators

The three endpoints use the query key `url`, but each expects a different URL
type:

- `/v1/linkedin/profile`: public person-profile URL;
- `/v1/linkedin/post`: public post or article URL; and
- `/v1/linkedin/company`: public company-page URL.

The profile response can include public experience, education, activity, and
recent-post context. The post endpoint returns the selected post/article and
available public engagement/comment fields. The company endpoint returns public
firmographics and recent-page context. Only information visible publicly is in
scope.

### Instagram via Scrape Creators

- `/v1/instagram/profile` requires `handle` and returns public profile data plus
  recent timeline context.
- `/v2/instagram/user/posts` requires `handle` and returns one paginated page of
  public posts. `next_max_id` from the result would require a separate approved
  continuation call.
- `trim=true` reduces oversized provider payloads; it does not change the
  target or expand access.

### TikTok via Scrape Creators

- `/v1/tiktok/profile` accepts `handle` and returns public profile metadata; it
  does not return the account's videos.
- `/v1/tiktok/search/hashtag` requires `hashtag` without `#`. `region` selects
  proxy context and `cursor` would paginate a later call.
- `/v1/tiktok/get-trending-feed` requires a two-letter `region`. The provider
  explicitly states that this does not restrict returned creators to that
  geographic region; it affects the feed/proxy context.

Hashtag and trending results provide topical context. Do not attribute every
returned post to the researched account.

## Free verification

Use coherent public inputs. This command reads payment challenges only and does
not settle funds:

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

The generated `.selat/verify-receipt.json` should have `ok: true`,
`paidMode: false`, `paid: null` for every step, and 11 reachable quotes within
their caps.

## Corrections made during QC

1. **Removed unrelated defaults.** The previous manifest could spend across all
   platforms using unrelated identities plus a fabricated tweet ID and a
   placeholder LinkedIn post URL. All nine identifiers are now required and
   must describe one coherent target.
2. **Documented fixed-run behavior.** The installed SELAT CLI executes every
   manifest step. It has no platform selector, conditional branch, or
   output-to-input dataflow, so the skill no longer implies that users can run
   only selected manifest steps.
3. **Replaced five incomplete async jobs.** The former StableSocial Instagram
   and TikTok endpoints return `{jobId, status: "pending", pollUrl, token}`.
   Their job results require later SIWX wallet-authenticated polling, which this
   manifest cannot chain. They were replaced with synchronous Scrape Creators
   endpoints that return the requested data directly.
4. **Corrected the TikTok search contract.** The removed StableSocial keyword
   request sent `query`, while the live OpenAPI requires `keywords`. The fixed
   bundle now uses Scrape Creators' dedicated regional trending-feed endpoint,
   so it no longer labels keyword search for `trending` as a true trending feed.
5. **Replaced misused LinkedIn routes.** The former Clado `/clado/scrape`
   endpoint is documented for LinkedIn person profiles, yet the manifest sent
   post and company URLs to it. Dedicated Scrape Creators person, post, and
   company endpoints now receive the matching URL types.
6. **Removed a duplicate paid call.** Two former Instagram profile steps called
   the same StableSocial endpoint and defaulted to the same handle.
7. **Separated platform handles.** Twitter/X, Instagram, and TikTok now have
   distinct required handle parameters; the skill no longer assumes the same
   username exists on all three platforms.
8. **Tightened caps.** The former per-step caps summed to `$5.60` for a live
   total of `$0.45295`. The repaired caps sum to `$0.246` for a current live
   total of `$0.171`.

## Provider schema sources

Request shapes were checked against current provider-owned OpenAPI documents on
2026-08-31, then corroborated with free live payment probes:

- Twitter: `https://catalog.selat.ai/twitter/openapi.json`
- Scrape Creators payment wrapper:
  `https://mpp.orthogonal.com/scrapecreators/openapi.json`
- LinkedIn profile: `https://docs.scrapecreators.com/v1/linkedin/profile/openapi.json`
- LinkedIn post: `https://docs.scrapecreators.com/v1/linkedin/post/openapi.json`
- LinkedIn company: `https://docs.scrapecreators.com/v1/linkedin/company/openapi.json`
- Instagram profile: `https://docs.scrapecreators.com/v1/instagram/profile/openapi.json`
- Instagram posts: `https://docs.scrapecreators.com/v2/instagram/user/posts/openapi.json`
- TikTok profile: `https://docs.scrapecreators.com/v1/tiktok/profile/openapi.json`
- TikTok hashtag: `https://docs.scrapecreators.com/v1/tiktok/search/hashtag/openapi.json`
- TikTok trending feed:
  `https://docs.scrapecreators.com/v1/tiktok/get-trending-feed/openapi.json`

The live payment challenge remains authoritative for reachability, routing
mode, and price. The upstream OpenAPI is authoritative for request and response
shape. Neither guarantees that a specific public identity will be available.
