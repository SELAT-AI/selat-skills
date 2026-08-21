# Endpoints — paid-capability-vendor-scout

| Step | Method | URL | Rail | Catalogue price | Verified routed quote |
|---|---|---|---|---:|---:|
| Website evidence | GET | `https://mpp.orthogonal.com/context-dev/web/scrape/markdown?url=${website}` | MPP on Tempo via SELAT Router | $0.03 | $0.0315 |
| External evidence | POST | `https://mpp.orthogonal.com/context-dev/web/search` | MPP on Tempo via SELAT Router | $0.03 | $0.0315 |
| Competitor market map | POST | `https://mpp.orthogonal.com/aviato/marketmap/generate` | MPP on Tempo via SELAT Router | $0.20 | $0.21 |

## Request shapes

### Context.dev markdown scraper

- Query parameter: `url` — required public HTTP(S) URL.
- Response observed from a paid call: `success`, `markdown`, `contentLength`, `url`, `metadata`, and provider credit metadata.
- Schema source: Context.dev OpenAPI plus a live settled `200` call.

### Context.dev intelligent web search

```json
{
  "query": "SELAT AI agent payments competitors x402 MPP Circle Gateway"
}
```

- `query` is a string and should include the vendor name plus specific category or competitor terms.
- The provider charges per returned result according to its endpoint description; the current catalogue price is $0.03.
- Schema source: Context.dev OpenAPI and live free 402 probe.

### Aviato market-map generation

```json
{
  "name": "SELAT",
  "website": "https://selat.ai"
}
```

- Supply `name` and `website` together, or an Aviato company ID in provider-native use.
- A paid settled `200` call with `name` and `website` returned `{ "mapID": "..." }`.
- Generation may be asynchronous; the skill must not claim the final map is available when only a `mapID` was returned.
- Schema source: Aviato OpenAPI endpoint summary plus a live settled `200` call.

## Payment notes

All three endpoints are catalogue `serviceUrl` routes. They issue MPP challenges on Tempo; SELAT Router quotes and settles them from the user's funded Circle Gateway balance. Manifest caps include headroom over the observed routed quotes.
