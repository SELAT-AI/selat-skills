# Endpoints — account-intel

Entity-centric footprint & reputation intelligence over **three rails** —
a direct Circle nanopayment (Alchemy on-chain), MPP social/web (Scrape Creators
+ Brave), and x402 web citations (Exa) — paid per call via selat-pay (USDC via
Circle Gateway), no API keys. Profiles ONE entity across X/Twitter, YouTube, the
web (news + citations), and any associated on-chain token.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | X/Twitter profile — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/twitter/profile?handle=${handle}` | routed MPP | $0.021 |
| 2 | X/Twitter recent tweets — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/twitter/user-tweets?handle=${handle}` | routed MPP | $0.021 |
| 3 | YouTube presence — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/youtube/search?query=${name}` | routed MPP | $0.021 |
| 4 | Web reputation / news — Brave | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | routed MPP | $0.0368 |
| 5 | Web context / citations — Exa | POST | `https://api.exa.ai/search` | routed x402 (Base) | $0.007 |
| 6 | On-chain token footprint — Alchemy | GET | `https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=${address}` | direct (Base) | $0.001 |

Full-run cap (`maxAmount`): **$0.50**; per-step cap **$0.05** (Brave $0.06, Alchemy $0.02). Live total ≈ $0.107.

## Rails & providers

This skill spans **three rails**: one direct Circle nanopayment plus two routed
protocols through the SELAT Router.

- **direct** — Alchemy (`x402.alchemy.com`) serves a native x402 challenge that
  resolves `mode=direct` — a Circle Gateway-batched nanopayment paid straight to
  the upstream on Base (`payTo` upstream), **bypassing the router**. On-chain
  token/asset data sourced from the x402 catalog.
- **routed MPP** — Scrape Creators (wired at its MPP gateway `serviceUrl`
  `mpp.orthogonal.com/scrapecreators/...`, **not** the provider host
  `api.scrapecreators.com`) and Brave news-search (via Locus,
  `brave.mpp.paywithlocus.com`) settle MPP through the SELAT Router
  (`mode=routed-mpp`). Sourced from the MPP catalog.
- **routed x402** — Exa (`api.exa.ai`) serves a native x402 challenge; the router
  settles it on Base (`mode=routed-x402`). Sourced from the Agentic Market / MPP catalogs.

> A non-AIsa direct **social** rail was probed (`stablesocial.dev/api/reddit/search`)
> but did not serve a live direct challenge — no challenge on GET, `routed-mpp` on
> POST — so the direct rail here is Alchemy's on-chain endpoint, not a social source.
> AIsa endpoints are excluded by policy.

## Live probes (free; no wallet)

```bash
# MPP (GET query) — X/Twitter + YouTube
selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/twitter/profile?handle=OpenAI" \
  --chain base --probe-only
selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/youtube/search?query=OpenAI" \
  --chain base --probe-only

# MPP (POST body) — Brave news
selat-pay POST "https://brave.mpp.paywithlocus.com/brave/news-search" \
  --body '{"q":"OpenAI"}' --chain base --probe-only

# x402 (POST body) — Exa citations
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"OpenAI","numResults":5}' --chain base --probe-only

# direct (GET query) — Alchemy on-chain token
selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0x0000000000000000000000000000000000000000" \
  --chain base --probe-only
```

A served endpoint prints `detected ... price=$X on eip155:8453`. The Scrape
Creators + Brave steps show `mode=routed-mpp`; Exa shows `mode=routed-x402`;
Alchemy shows `mode=direct`.
