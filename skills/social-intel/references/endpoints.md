# Endpoints — social-intel

Cross-platform social intelligence over **two x402 protocols** from the SELAT
federated catalogue (Agentic Market / MPP), **both routed** through the SELAT
Router: x402 web search + MPP social scraping, paid per call via selat-pay (USDC
on Base), no API keys.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | Web context — Exa | POST | `https://api.exa.ai/search` | routed x402 (Base) | $0.007 |
| 2 | Web corroboration — Parallel | POST | `https://parallelmpp.dev/api/search` | routed MPP | $0.011 |
| 3 | Reddit keyword search — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/reddit/search?query=${topic}` | routed MPP | $0.021 |
| 4 | Reddit subreddit top posts — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/reddit/subreddit?subreddit=${subreddit}` | routed MPP | $0.021 |
| 5 | X/Twitter profile — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/twitter/profile?handle=${handle}` | routed MPP | $0.021 |
| 6 | X/Twitter recent tweets — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/twitter/user-tweets?handle=${handle}` | routed MPP | $0.021 |

Full-run cap (`maxAmount`): **$0.50**; per-step cap **$0.05**. Live total ≈ $0.10.

## Rails & providers

Both protocols settle **routed** through the SELAT Router.

- **routed x402** — Exa (`api.exa.ai`) serves a native x402 challenge; the router
  settles it on Base (`mode=routed-x402`). Sourced from the Agentic Market / MPP catalogs.
- **routed MPP** — Parallel (`parallelmpp.dev`) and Scrape Creators (wired at its
  MPP gateway `serviceUrl` `mpp.orthogonal.com/scrapecreators/...`, **not** the
  provider host `api.scrapecreators.com`) settle MPP through the SELAT Router
  (`mode=routed-mpp`). Sourced from the MPP catalog.

## Live probes (free; no wallet)

```bash
# web search (POST body)
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"agent payments","numResults":5}' --chain base --probe-only
selat-pay POST "https://parallelmpp.dev/api/search" \
  --body '{"objective":"agent payments","search_queries":["agent payments"]}' --chain base --probe-only

# MPP (GET query)
selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/reddit/search?query=usdc" \
  --chain base --probe-only
selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/twitter/profile?handle=OpenAI" \
  --chain base --probe-only
```

A served endpoint prints `detected ... price=$X on eip155:8453`. The web steps show
`mode=routed-x402`; the Scrape Creators steps show `mode=routed-mpp`.
