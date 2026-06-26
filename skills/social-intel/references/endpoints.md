# Endpoints — social-intel

Cross-platform social intelligence over **multiple x402 rails** from the SELAT
federated catalogue (Circle / Agentic Market / MPP). Direct-x402 web search +
MPP-routed social scraping, paid per call via selat-pay (USDC on Base), no API keys.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | Web context — Exa | POST | `https://api.exa.ai/search` | direct x402 (Base) | $0.007 |
| 2 | Web corroboration — Tavily | POST | `https://x402.tavily.com/search` | direct x402 (Base) | $0.011 |
| 3 | Reddit keyword search — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/reddit/search?query=${topic}` | routed MPP | $0.021 |
| 4 | Reddit subreddit top posts — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/reddit/subreddit?subreddit=${subreddit}` | routed MPP | $0.021 |
| 5 | X/Twitter profile — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/twitter/profile?handle=${handle}` | routed MPP | $0.021 |
| 6 | X/Twitter recent tweets — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/twitter/user-tweets?handle=${handle}` | routed MPP | $0.021 |

Full-run cap (`maxAmount`): **$0.50**; per-step cap **$0.05**. Live total ≈ $0.10.

## Rails & providers

- **Direct x402** — Exa (`api.exa.ai`) and Tavily (`x402.tavily.com`) serve a
  native x402 challenge and settle USDC on Base directly to the provider's `payTo`.
  Sourced from the Circle / Agentic Market catalogs.
- **Routed MPP** — Scrape Creators is wired at its MPP gateway `serviceUrl`
  (`mpp.orthogonal.com/scrapecreators/...`, **not** the provider host
  `api.scrapecreators.com`) and settles MPP through the SELAT Router. Sourced from
  the MPP catalog.

## Live probes (free; no wallet)

```bash
# direct x402 (POST body)
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"agent payments","numResults":5}' --chain base --probe-only
selat-pay POST "https://x402.tavily.com/search" \
  --body '{"query":"agent payments"}' --chain base --probe-only

# routed MPP (GET query)
selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/reddit/search?query=usdc" \
  --chain base --probe-only
selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/twitter/profile?handle=OpenAI" \
  --chain base --probe-only
```

A served endpoint prints `detected ... price=$X on eip155:8453`. Direct steps show
`mode=routed-x402`; MPP steps show `mode=routed-mpp`.
