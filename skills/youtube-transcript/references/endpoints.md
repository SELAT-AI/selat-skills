# youtube-transcript — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router
(`selat-pay --probe-only`, verified 2026-08-12). Caps (`maxAmount`) include headroom
over the live Gateway-batched quote (~$0.021), not the catalogue floor alone.

| Merchant | Endpoint | Live probe price |
|---|---|---|
| Scrape Creators (via Orthogonal MPP) | `GET mpp.orthogonal.com/scrapecreators/v1/youtube/video/transcript` | $0.021000 |

## Request shape (pinned from live probe + gateway OpenAPI)

- **Method:** `GET`
- **Payable `serviceUrl` path:** `https://mpp.orthogonal.com/scrapecreators/v1/youtube/video/transcript`
  (do **not** call a descriptive provider host — the 402 is served only at this gateway URL)
- **Query param:** `url` (string, required) — full YouTube watch URL
- **Does not work:** `videoId` alone returns upstream 400 (probe got router 502 / expected 402)

Example free probe:

```bash
selat-pay GET \
  "https://mpp.orthogonal.com/scrapecreators/v1/youtube/video/transcript?url=https://www.youtube.com/watch?v=YxXrU0I6vT0" \
  --chain base --probe-only
```

Success prints `detected mpp=yes`, `mode=routed-mpp`, `price=$0.021000`.

## Notes

- Returns transcript text for the video (not comments, not metadata alone).
- The OpenAPI operation summary is `"Transcript"`; parameter docs are sparse — the live
  API accepts `url` and rejects bare `videoId`.
- Alternative rails listed in OpenAPI `x-payment-info` (x402 / np on Orthogonal) exist;
  this skill uses the MPP Tempo offer via `mpp.orthogonal.com` so it settles through the
  SELAT Router like other Orthogonal merchants.
