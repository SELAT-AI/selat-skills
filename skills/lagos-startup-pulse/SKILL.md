---
name: lagos-startup-pulse
description: Use this skill when the user wants a quick pulse-check on a Nigerian/Lagos startup topic — e.g. "what's the buzz on Lagos fintech funding", "check recent Nigeria startup seed rounds and enrich [company]". Runs a Twitter/X buzz search, a web funding-news search, and one company enrichment lookup, paid per call across x402 (Circle Gateway + Base) and MPP (Tempo) rails.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.2, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: leemxy-16
  version: "1.0"
  rail: routed
  kind: multi
---
# lagos-startup-pulse
## When To Use
When the user wants a quick, cheap pulse-check on a specific Nigerian/Lagos startup topic and one company mentioned in that context — e.g. tracking a funding round, a founder announcement, or general ecosystem buzz — without manually running three separate searches by hand.
## Workflow
1. Install: `selat skill install lagos-startup-pulse`
2. Run: `selat skill run lagos-startup-pulse --topic "Lagos fintech funding" --company_domain moniepoint.com`
3. The CLI compiles each step into a `selat-pay` call and prints the result.
Steps:
1. **SELAT native Twitter/X search** `GET /twitter/tweet/advanced_search` — routed via the SELAT Router (x402 via Circle Gateway).
2. **Tavily advanced web search** `POST /search` — routed via the SELAT Router (x402 on Base).
3. **Apollo org-enrichment** `POST /apollo/org-enrichment` — routed via the SELAT Router (MPP on Tempo).
## Inputs And Outputs
| Param | Required | Default | Description |
|---|---|---|---|
| `topic` | yes | — | Search phrase used for both the Twitter/X search and the Tavily web search. |
| `company_domain` | yes | — | Domain of one company to enrich via Apollo, e.g. `moniepoint.com`. |
Output: three JSON responses in sequence — a Twitter/X search-results payload, a Tavily results payload (URLs + content snippets), and an Apollo org-enrichment record (firmographics: employee count, industry, funding, socials where available).
## Gotchas
- `topic` is reused verbatim in both the Twitter/X and Tavily queries — keep it short and specific (e.g. a company/sector + "funding" or "seed round") for the best signal-to-noise ratio.
- `company_domain` must be a bare domain (`moniepoint.com`), not a full URL — Apollo's org-enrichment endpoint rejects `https://` prefixes.
- Total cost across all three steps is typically under $0.03 at current catalog pricing; the `maxAmount` cap in `manifest.json` gives headroom for price drift.
## Validation
> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.
- Probe (no pay): `selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=test&queryType=Latest" --chain base --probe-only`
- A successful run prints `status=200` for each of the three steps.
## References
- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
