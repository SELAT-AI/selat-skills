# ai-research-scout endpoint notes

Use this reference when validating, updating, or debugging the
`ai-research-scout` manifest.

## Included endpoints

| Role | Endpoint | Method | Rail | Catalog price | Manifest cap | Payload |
|---|---|---:|---|---:|---:|---|
| Primary scrape | `https://mpp.orthogonal.com/serper-scrape/` | POST | MPP on Tempo | `$0.0200` | `$0.03` | `{ "url": "${url}" }` |
| Fallback scrape | `https://stableenrich.dev/api/firecrawl/scrape` | POST | routed MPP | `$0.0126` | `$0.02` | `{ "url": "${url}", "formats": ["markdown"] }` |
| Stock snapshot | `https://api.aisa.one/apis/v2/financial/prices/snapshot?ticker=${ticker}` | GET | x402 via Circle Gateway | `$0.0240` | `$0.04` | query param `ticker` |

Prices are catalog or observed live prices from July 2026. Caps include headroom
for router markup and minor quote drift; they are ceilings, not expected spend.

## Serper parameter correction

Serper Scrape is the preferred primary scraper because it validates malformed
requests before charging. A request without `url` returns an error such as
`Missing required parameters` and says no payment was charged. Do not classify
that as endpoint downtime. Correct usage is:

```json
{
  "url": "https://example.com/newsroom"
}
```

A free probe confirms the endpoint is payable; it does not guarantee a later
payload contains all required runtime parameters.

## StableEnrich fallback

StableEnrich Firecrawl Scrape is retained as a pinned fallback because it
successfully returned markdown for company newsroom pages during testing. Use it
only when Serper receives a valid `url` but returns no useful page content or an
upstream error.

Observed settled price during testing: `$0.013230`, matching the `$0.0126`
catalog price plus router markup.

## AIsa stock snapshot

Use AIsa only for public companies with known equity tickers. Successful output
has the shape:

```json
{
  "snapshot": {
    "ticker": "NVDA",
    "price": 211.19,
    "day_change": 7.66,
    "day_change_percent": 3.76,
    "time": "2026-07-15T09:01:43Z"
  }
}
```

For private startups and research labs, skip the step or preserve an explicit
brief section saying that public-market data is not applicable.

## Excluded enrichment endpoints

The following enrichment endpoints are intentionally excluded from the runnable
skill path:

| Endpoint | Catalog price | Observed charge | Failure observed |
|---|---:|---:|---|
| Abstract Company Enrichment lookup | `$0.0060` | `$0.006300` | upstream `502` |
| Company Enrich fallback | `$0.0123` | `$0.012862` | verification/payment failure after charge |

Those charges match catalog price plus approximately 5% router markup. They are
useful catalogue-quality findings, but including them in this skill would make a
routine scout vulnerable to paying for unusable enrichment results.

## Apify economics

Apify actors use a prepaid-token model rather than a small per-call x402 charge.
The first token purchase is about `$1.05` (`$1.00` prepaid credit plus SELAT
fee). That is too coarse-grained for this focused skill, whose normal scrape +
stock path should stay under about `$0.05`.
