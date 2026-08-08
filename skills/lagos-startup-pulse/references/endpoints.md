# Endpoints — lagos-startup-pulse
| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${topic}&queryType=Latest` | routed (x402 via Circle Gateway) | $0.001 |
| 2 | POST | `https://x402.tavily.com/search` | routed (x402 on Base) | $0.0105 |
| 3 | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | routed (MPP on Tempo) | $0.0084 |
- **Provider (step 1):** SELAT native catalog (catalog.selat.ai) — Twitter/X read API.
- **Provider (step 2):** Tavily — advanced web search.
- **Provider (step 3):** Apollo (via the paysponge/locus MPP gateway) — company/org enrichment.
- **Payment:** all three steps route via the SELAT Router; step 1 settles Gateway-batched (Circle), step 2 settles erc-3009 (Base), step 3 settles MPP (Tempo).
- Prices measured directly against live endpoints on 2026-08-02; catalog floors may drift.
