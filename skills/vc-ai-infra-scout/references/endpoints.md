# Endpoints — vc-ai-infra-scout

VC deal-sourcing across **two x402 protocols** from the SELAT federated catalogue,
both **routed** through the SELAT Router: **routed MPP** (Serper, Fiber, Apollo) +
**routed x402 on Base** (Exa). Discovers AI-infra + crypto-AI companies and
founders, searches recent pre-seed/seed fundraising news on Twitter/X and LinkedIn
and the lead funds' tweets to distill the thesis, then enriches the top lead. Paid
per call via selat-pay (USDC via Circle Gateway), no API keys.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | Hacker News discovery — Serper | POST | `https://mpp.orthogonal.com/serper/search` | routed MPP | $0.0021 |
| 2 | Product Hunt discovery — Serper | POST | `https://mpp.orthogonal.com/serper/search` | routed MPP | $0.0021 |
| 3 | Launch + web context — Exa | POST | `https://api.exa.ai/search` | routed x402 (Base) | $0.0073 |
| 4 | Twitter/X founder & buzz — Fiber | POST | `https://mpp.orthogonal.com/fiber/v1/twitter/search` | routed MPP | $0.042 |
| 5 | Fundraising news on Twitter/X — Fiber | POST | `https://mpp.orthogonal.com/fiber/v1/twitter/search` | routed MPP | $0.042 |
| 6 | Fundraising news on LinkedIn — Serper (`site:linkedin.com/posts`) | POST | `https://mpp.orthogonal.com/serper/search` | routed MPP | $0.0021 |
| 7 | Lead-investor thesis tweets — Fiber | POST | `https://mpp.orthogonal.com/fiber/v1/twitter/search` | routed MPP | $0.042 |
| 8 | Founder shortlist — Apollo people-search | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-search` | routed MPP | $0.00525 |
| 9 | Company enrichment — Apollo org-enrichment | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | routed MPP | $0.0084 |

Full-run cap (`maxAmount`): **$0.40**; per-step caps range **$0.02–$0.08**. Live total ≈ $0.15.

## Rails & providers

This skill spans two routed protocols (`rail: routed`); both settle through the SELAT Router.

- **routed MPP** — Serper (`mpp.orthogonal.com/serper`, used 3× with different
  `site:` queries for HN, Product Hunt, and LinkedIn), Fiber
  (`mpp.orthogonal.com/fiber`, twitter/search used 3× — founder buzz, fundraising
  news, lead-investor tweets), and Apollo (`apollo.mpp.paywithlocus.com`,
  people-search + org-enrichment) settle `mode=routed-mpp`. Sourced from the MPP catalog.
- **routed x402 on Base** — Exa (`api.exa.ai`) serves a native x402 challenge; the
  router settles it on Base (`mode=routed-x402`). Sourced from the Agentic Market /
  x402 catalogs.

There is no dedicated Hacker News, Product Hunt, or LinkedIn merchant — all three
are reached via Serper's `site:` operator. Twitter/X is reached via Fiber's native
keyword search. There is no direct (Circle Gateway-batched nanopayment) rail in
this skill (the earlier crypto-AI token-price steps that carried it were removed).
Fundable was intentionally dropped — fundraising signal now comes from social
(Twitter/X + LinkedIn) search rather than a structured rounds database.

## Live probes (free; no wallet)

```bash
# routed MPP — HN, Product Hunt, and LinkedIn via the same Serper endpoint (site:-scoped queries)
selat-pay POST "https://mpp.orthogonal.com/serper/search" \
  --body '{"q":"AI inference infrastructure site:news.ycombinator.com"}' --chain base --probe-only
selat-pay POST "https://mpp.orthogonal.com/serper/search" \
  --body '{"q":"AI inference infrastructure site:producthunt.com"}' --chain base --probe-only
selat-pay POST "https://mpp.orthogonal.com/serper/search" \
  --body '{"q":"AI infrastructure startup raised seed funding site:linkedin.com/posts"}' --chain base --probe-only

# routed x402 on Base — Exa web context
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"AI inference infrastructure startup launch funding","numResults":10}' --chain base --probe-only

# routed MPP — Fiber twitter keyword search (founder buzz, fundraising news, lead-investor tweets)
selat-pay POST "https://mpp.orthogonal.com/fiber/v1/twitter/search" \
  --body '{"query":"AI infrastructure startup raised seed pre-seed round"}' --chain base --probe-only

# routed MPP — enrich the top lead
selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-search" \
  --body '{"q_keywords":"AI inference infrastructure founder","person_titles":["Founder","Co-Founder","CEO","CTO"]}' --chain base --probe-only
selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/org-enrichment" \
  --body '{"domain":"modal.com"}' --chain base --probe-only
```

A served endpoint prints `detected ... price=$X on eip155:8453`. Serper (×3), Fiber
(×3), and Apollo (×2) show `mode=routed-mpp`; Exa shows `mode=routed-x402`.
