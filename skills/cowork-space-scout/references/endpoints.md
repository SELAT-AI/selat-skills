# Endpoints — cowork-space-scout

All seven steps are x402/MPP endpoints from the **SELAT federated catalogue**,
called at their payable **`serviceUrl`** (never the provider host) and routed
through the SELAT Router (`https://router.selat.ai`). Schemas were pinned from
each gateway's 402 `bazaar` input schema / live `--probe-only` probe and, where
a first-party provider is behind the gateway (Perplexity, Exa, BuiltWith,
ScreenshotOne, Firecrawl), cross-checked against the provider's public docs.
Prices are the **live router quotes** at authoring time; they drift a few
percent.

## The steps this skill wires

| # | Step | Method | URL | Rail | Live ~Price |
|---|---|---|---|---|---|
| 1 | Design-hub discovery | POST | `https://pplx.x402.paysponge.com/search` | routed x402 | $0.0105 |
| 2 | Web discovery | POST | `https://api.exa.ai/search` | routed MPP | $0.0074 |
| 3 | Product discovery | POST | `https://parallelmpp.dev/api/search` | routed MPP | $0.0105 |
| 4 | Design chatter | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${topic}&queryType=Latest` | routed x402 (Circle Gateway) | $0.001 |
| 5 | Depth on top pick | POST | `https://firecrawl.mpp.tempo.xyz/v1/extract` | routed MPP | $0.0053 |
| 6 | Tech stack | POST | `https://builtwith.x402.paywithlocus.com/builtwith/domain` | routed x402 | $0.0578 |
| 7 | Preview asset | POST | `https://screenshotone.x402.paywithlocus.com/screenshotone/take` | routed x402 | $0.0578 |

Full-run cost ≈ **$0.15**; top-level `maxAmount` is $0.30 (headroom filter, not
a price).

## 1 · Perplexity `POST /search` — design-hub discovery

Base: `https://pplx.x402.paysponge.com/search` (paysponge gateway; native x402,
`mode=routed-x402`).

| Field | Req | Type | Notes |
|---|---|---|---|
| `query` | ✅ | string | the search query (`${topic}`) |
| `max_results` | | integer | 1–20, default 10 (manifest uses `10`) |
| `search_recency_filter` | | string | `hour` \| `day` \| `week` \| `month` \| `year` (manifest uses `month`) |
| `search_domain_filter` | | string[] | ≤20 domains (manifest bakes the design-hub list) |
| `search_context_size` | | string | `low` \| `medium` \| `high`; conflicts with `max_tokens*` |

Manifest body:

```json
{
  "query": "${topic}",
  "max_results": 10,
  "search_recency_filter": "month",
  "search_domain_filter": ["awwwards.com", "behance.net", "dribbble.com", "siteinspire.com", "land-book.com", "godly.website"]
}
```

> `search_domain_filter` is an array and **cannot** be driven by a `${param}`
> (params substitute as strings). To target one custom domain, send a hand-built
> call: `selat-pay POST .../search --body '{"query":"<q>","search_domain_filter":["<domain>"]}'`.

## 2 · Exa `POST /search` — web discovery

Base: `https://api.exa.ai/search` (semantic/neural web search, `mode=routed-mpp`).

| Field | Req | Type | Notes |
|---|---|---|---|
| `query` | ✅ | string | the search query (`${topic}`) |
| `numResults` | | integer | ≤ 10 on the x402 route (manifest uses `10`) |
| `type` | | string | `auto` \| `keyword` \| `neural` \| `deep-lite` \| `deep` \| `deep-reasoning` (manifest uses `neural`) |
| `contents.text.maxCharacters` | | integer | cap on page-text returned (manifest uses `800`) |

## 3 · Parallel `POST /api/search` — Product Hunt discovery

Base: `https://parallelmpp.dev/api/search` (`mode=routed-mpp`). Search is scoped
to Product Hunt launches.

| Field | Req | Type | Notes |
|---|---|---|---|
| `objective` | ✅ | string | intent for the search (`${topic} coworking space Product Hunt launches`) |
| `search_queries` | | string[] | explicit query list — `["${topic} site:producthunt.com"]` |
| `max_results` | | integer | manifest uses `10` |

## 4 · SELAT Twitter `GET advanced_search` — design chatter

Base: `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${topic}&queryType=Latest`
(SELAT-native, `mode=routed` x402 via Circle Gateway, ~$0.001). Params go in the
query string. `queryType` may be `Latest` or `Top`.

## 5 · Firecrawl `POST /v1/extract` — depth on the top pick

Base: `https://firecrawl.mpp.tempo.xyz/v1/extract` (`mode=routed-mpp`, ~$0.0053).

| Field | Req | Type | Notes |
|---|---|---|---|
| `urls` | ✅ | string[] | one or more URLs to extract (manifest sends `["${showcaseUrl}"]`) |
| `prompt` | ✅ | string | natural-language extraction instruction |

Manifest body:

```json
{
  "urls": ["${showcaseUrl}"],
  "prompt": "Describe this coworking space's web design: layout, typography, color palette, 3D / interactive / WebGL features, architectural showcase elements, and branding. Return concise bullet points."
}
```

## 6 · BuiltWith `POST /builtwith/domain` — tech stack

Base: `https://builtwith.x402.paywithlocus.com/builtwith/domain` (native x402,
`mode=routed-x402`, ~$0.0578). Body is a single string-typed field:

```json
{ "domain": "${domain}" }
```

`domain` must be the top pick's real domain (e.g. `zenhouse.io`), not a URL.

## 7 · ScreenshotOne `POST /screenshotone/take` — preview asset

Base: `https://screenshotone.x402.paywithlocus.com/screenshotone/take` (native
x402, `mode=routed-x402`, ~$0.0578). Returns the rendered image (or a JSON
pointer, per `response_type`).

| Field | Req | Type | Notes |
|---|---|---|---|
| `url` | ✅ | string | one of `url`/`html`/`markdown` required; the showcase URL |
| `format` | | string | `png` \| `jpeg` \| `webp` \| `gif` \| `pdf` (manifest uses `png`) |
| `full_page` | | boolean | capture the whole page (manifest uses `true`) |
| `viewport_width` / `viewport_height` | | integer | default 1280 × 1024 |
| `device_scale_factor` | | integer | 1–5 (manifest uses `1`) |
| `block_cookie_banners` / `block_ads` | | boolean | clean shots (manifest enables both) |
| `response_type` | | string | `by_format` \| `json` \| `empty` |

Integers/booleans are **static** in the manifest body — the runner substitutes
`${param}` as strings only, so never wire numeric fields through `${…}`.

## Rails & providers

- **routed x402** — Perplexity, BuiltWith, ScreenshotOne: native x402
  challenges fronted by the paysponge / locus gateways; the SELAT Router settles
  them (`GatewayWalletBatched`, USDC on Base). Twitter's SELAT-native endpoint is
  a Circle Gateway batched nanopayment.
- **routed MPP** — Exa, Parallel, Firecrawl: served via MPP on Tempo
  (`mode=routed-mpp`), settled through the SELAT Router.

## Rejected candidates (probed, not wired)

| Endpoint | Why rejected |
|---|---|
| `https://x402.tavily.com/search` / Tavily search+crawl | `x402.tavily.com/search` down in the reliability registry; locus mirrors quote $0.09–$0.22/call — overpriced for discovery |
| `https://mpp.orthogonal.com/tomba/v1/technology` | live probe returns 400 (upstream param validation) |
| `https://mpp.orthogonal.com/brand-dev/v1/brand/styleguide` | live probe returns 400 |
| `https://stablesocial.dev/api/pinterest/search`, `/api/behance/search` | no x402/MPP challenge served |

## Live probes (free; no wallet)

```bash
selat-pay POST "https://pplx.x402.paysponge.com/search" \
  --body '{"query":"coworking space website design","max_results":10,"search_recency_filter":"month","search_domain_filter":["awwwards.com"]}' \
  --chain base --probe-only
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"coworking space website design","numResults":10,"type":"neural"}' \
  --chain base --probe-only
selat-pay POST "https://builtwith.x402.paywithlocus.com/builtwith/domain" \
  --body '{"domain":"zenhouse.io"}' --chain base --probe-only
selat-pay POST "https://screenshotone.x402.paywithlocus.com/screenshotone/take" \
  --body '{"url":"https://www.awwwards.com/websites/co-working-space/","format":"png","full_page":true}' \
  --chain base --probe-only
```

Each prints `detected … mode=… price=$X`. Probing checks **payability only** —
it never validates the body, so match the schemas above before a paid call.