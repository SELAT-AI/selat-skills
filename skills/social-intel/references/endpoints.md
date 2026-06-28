# Endpoints — social-intel

Cross-platform social intelligence over the SELAT federated catalogues. Web search
and Reddit are **routed** through the SELAT Router (x402 + MPP); X/Twitter is a
**direct** x402 call to AIsa (Circle x402 catalog) that settles **Circle
Gateway-batched**. Paid per call via selat-pay (USDC), no API keys.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | Web context — Exa | POST | `https://api.exa.ai/search` | routed x402 | $0.007 |
| 2 | Web corroboration — Parallel | POST | `https://parallelmpp.dev/api/search` | routed MPP | $0.011 |
| 3 | Reddit keyword search — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/reddit/search?query=${topic}` | routed MPP | $0.021 |
| 4 | Reddit subreddit top posts — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/reddit/subreddit?subreddit=${subreddit}` | routed MPP | $0.021 |
| 5 | X/Twitter profile — AIsa | GET | `https://api.aisa.one/apis/v2/twitter/user/info?userName=${handle}` | direct x402 (Gateway-batched) | $0.0004 |
| 6 | X/Twitter recent tweets — AIsa | GET | `https://api.aisa.one/apis/v2/twitter/user/last_tweets?userName=${handle}` | direct x402 (Gateway-batched) | $0.004 |

Full-run cap (`maxAmount`): **$0.50**; per-step cap **$0.05**. Live total ≈ $0.06.

## Rails & providers

- **routed x402** — Exa (`api.exa.ai`) serves a native x402 challenge; the router
  settles it (`mode=routed-x402`). Sourced from the Agentic Market / MPP catalogs.
- **routed MPP** — Parallel (`parallelmpp.dev`) and Scrape Creators (Reddit only,
  wired at its MPP gateway `serviceUrl` `mpp.orthogonal.com/scrapecreators/...`,
  **not** the provider host `api.scrapecreators.com`) settle MPP through the SELAT
  Router (`mode=routed-mpp`). Sourced from the MPP catalog.
- **direct x402, Gateway-batched** — AIsa (`api.aisa.one`) is called **directly**
  (no MPP router hop); selat-pay detects the native x402 challenge and settles it
  **Circle Gateway-batched** (`GatewayWalletBatched` scheme, `mode=direct`) against
  the unified cross-chain Gateway balance. Sourced from the Circle x402 catalog.
  `${handle}` maps to AIsa's `userName` query param.

## Live probes (free; no wallet)

```bash
# web search (POST body)
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"agent payments","numResults":5}' --chain base --probe-only
selat-pay POST "https://parallelmpp.dev/api/search" \
  --body '{"objective":"agent payments","search_queries":["agent payments"]}' --chain base --probe-only

# Reddit — routed MPP (GET query)
selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/reddit/search?query=usdc" \
  --chain base --probe-only

# X/Twitter — direct x402, Gateway-batched (GET query)
selat-pay GET "https://api.aisa.one/apis/v2/twitter/user/info?userName=OpenAI" \
  --chain base --probe-only
selat-pay GET "https://api.aisa.one/apis/v2/twitter/user/last_tweets?userName=OpenAI" \
  --chain base --probe-only
```

A served endpoint prints `detected ... price=$X on eip155:8453`. The Exa step shows
`mode=routed-x402`; Parallel and the Scrape Creators (Reddit) steps show
`mode=routed-mpp`; the AIsa (X/Twitter) steps show `mode=direct`.
