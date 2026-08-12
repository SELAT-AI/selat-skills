# Endpoints — site-presence-brief

Three federated-catalogue endpoints, all confirmed payable via free
`selat-pay --probe-only` (2026-08-12). Live quotes run a few percent above
catalogue floors once they hit the SELAT Router.

Full-run `maxAmount`: **$0.10**. Per-step caps are looser filters, not prices.

| # | Step | Method | serviceUrl + path | Mode | Live quote |
|---|------|--------|-------------------|------|------------|
| 1 | Page scrape | POST | `https://stableenrich.dev/api/firecrawl/scrape` | routed-mpp | ~$0.01323 |
| 2 | Web search | POST | `https://pplx.x402.paysponge.com/search` | routed-x402 | ~$0.01050 |
| 3 | OG card | POST | `https://og.bip-rep.com/generate` | routed-x402 | ~$0.01050 |

## 1. StableEnrich Firecrawl scrape

- **Catalogue host:** `stableenrich.dev` (also indexed on Circle / bazaar / mpp)
- **OpenAPI:** `GET https://stableenrich.dev/openapi.json` lists `/api/firecrawl/scrape`
- **Body (string fields only in manifest):**

| Field | Req | Type | Notes |
|-------|-----|------|-------|
| `url` | yes | string | Public `https://…` page |

```bash
selat-pay POST "https://stableenrich.dev/api/firecrawl/scrape" \
  --body '{"url":"https://www.selat.ai"}' \
  --chain base --probe-only
```

Paid 200 observed (2026-08-12): returns `title`, markdown-ish `content`, source URL.

Health (probe extension): recent `lastPaid.status=200`, strong success rate.

## 2. Perplexity search (paysponge)

- **Gateway:** `pplx.x402.paysponge.com`
- **OpenAPI:** `GET https://pplx.x402.paysponge.com/openapi.json`
- **Body wired in this skill:**

| Field | Req | Type | Values |
|-------|-----|------|--------|
| `query` | yes | string | search text |
| `search_recency_filter` | no | string | `hour` \| `day` \| `week` \| `month` \| `year` |

Integer fields like `max_results` exist in OpenAPI but are **not** wired through
`${param}` (string substitution would send `"8"` and can 4xx). Add them only via
a hand-built `selat-pay` call if needed.

```bash
selat-pay POST "https://pplx.x402.paysponge.com/search" \
  --body '{"query":"SELAT agent payments","search_recency_filter":"month"}' \
  --chain base --probe-only
```

## 3. Open Graph image generator

- **Host:** `og.bip-rep.com`
- **OpenAPI/name:** “Open Graph Image Generator” — 1200×630 PNG from text
- **Body used successfully on a paid 200 (2026-08-12):**

| Field | Req | Type | Notes |
|-------|-----|------|-------|
| `title` | yes | string | main line |
| `subtitle` | no | string | second line |

```bash
selat-pay POST "https://og.bip-rep.com/generate" \
  --body '{"title":"SELAT","subtitle":"Agent commerce brief"}' \
  --chain base --probe-only
```

Response includes `png_base64`, `width`, `height`, `size_bytes`. Don’t paste the
whole base64 blob into a user chat unless they ask for the file.

## Why these three (not random catalogue hits)

All three:

1. Returned a real 402 / MPP challenge on probe  
2. Settled **HTTP 200** on a paid call in the same session that authored this skill  
3. Use only **string** body fields safe for `${param}` substitution  

Avoided: Atelier-style endpoints that quote high and 400 after payment when the
body shape is wrong.
