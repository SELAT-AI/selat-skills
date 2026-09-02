# Endpoints — social-intel

This skill runs a fixed pair of read-only web searches through the SELAT Router.
It does not call Reddit, X/Twitter, or another social-platform API. Each step is
quoted and paid independently.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | Semantic web context — Exa | POST | `https://api.exa.ai/search` | routed MPP on Tempo | $0.00735 |
| 2 | Advanced web corroboration — Tavily | POST | `https://x402.tavily.com/search` | routed x402 via Circle Gateway | $0.0105 |

Expected total: **$0.01785**. Per-step caps are **$0.010** and **$0.015**;
maximum fixed-run exposure is **$0.025**. Quotes and routes were free-probe
verified with SELAT CLI 0.16.15 on 2026-08-31. Re-probe before payment.

## Rails & providers

- **Exa:** its direct HTTP 402 challenge advertised Tempo MPP plus other payment
  options. SELAT selected `routed-mpp` at `$0.00735`; the Tempo offer's raw amount
  was `$0.007`.
- **Tavily:** its direct HTTP 402 challenge advertised Base x402 plus another
  payment option. SELAT selected `routed-x402` at `$0.0105`; the Base x402 offer's
  raw amount was `$0.010`.

The SELAT live quote—not this snapshot or the endpoint hostname—is authoritative.
Router quotes can include routing cost above the provider's raw offer.

## Request and response contract

### Exa

Request body:

```json
{
  "query": "${topic}",
  "numResults": 10,
  "contents": {"text": {"maxCharacters": 4000}}
}
```

`query` is required. `numResults` bounds the result count, and the nested
`contents.text.maxCharacters` option requests bounded page text. Expected result
fields include URL, title, score, and requested content when available.

### Tavily

Request body:

```json
{
  "query": "${topic}",
  "search_depth": "advanced",
  "max_results": 10
}
```

`query` is required. Advanced depth retrieves multiple relevant snippets per
source and `max_results` bounds the result count. Expected output includes ranked
results with URL, title, content/snippet, and score. An optional generated answer
or raw page content is not requested by this manifest.

## Live probes (free; no wallet)

```bash
# web search (POST body)
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"agent payments","numResults":10,"contents":{"text":{"maxCharacters":4000}}}' \
  --chain base --max-amount 0.010 --probe-only --live-probe
selat-pay POST "https://x402.tavily.com/search" \
  --body '{"query":"agent payments","search_depth":"advanced","max_results":10}' \
  --chain base --max-amount 0.015 --probe-only --live-probe
```

These probes read live 402 challenges and do not settle payment. Passing proves
payment compatibility and cap fit, not the quality or success of the eventual
post-payment response. A paid provider or application error can still be charged;
do not retry automatically.

## Interpretation limits

- The two responses are raw and independent; the manifest performs no synthesis.
- The same page retrieved twice is one underlying source, not two confirmations.
- Web search does not provide platform-native engagement, audience, or sentiment
  measurements.
- Add dates or recency terms to `topic` when freshness matters, and preserve the
  publication dates returned by sources.
