# Endpoints - vc-ai-infra-scout

VC deal-sourcing across mixed SELAT payment rails: direct Circle x402, routed MPP,
and routed x402 on Base. The skill discovers AI-infra + crypto-AI companies and
founders, searches recent pre-seed/seed fundraising news on Twitter/X and
LinkedIn, distills the lead funds' thesis from tweets, then enriches the top lead.
Paid per call via selat-pay (USDC via Circle Gateway), no API keys.

## Endpoints Used

| # | Step | Method | URL | Rail | Cap |
|---|---|---|---|---|---|
| 1 | Hacker News discovery - Tavily advanced search | POST | `https://x402.tavily.com/search` | direct x402 | $0.02 |
| 2 | Product Hunt discovery - Parallel web search | POST | `https://parallelmpp.dev/api/search` | routed MPP | $0.05 |
| 3 | Launch + web context - Exa | POST | `https://api.exa.ai/search` | routed x402 (Base) | $0.05 |
| 4 | Twitter/X founder & buzz - AIsa advanced_search | GET | `https://api.aisa.one/apis/v2/twitter/tweet/advanced_search` | direct x402 | $0.05 |
| 5 | Fundraising news on Twitter/X - AIsa advanced_search | GET | `https://api.aisa.one/apis/v2/twitter/tweet/advanced_search` | direct x402 | $0.05 |
| 6 | Fundraising news on LinkedIn - Tavily advanced search | POST | `https://x402.tavily.com/search` | direct x402 | $0.02 |
| 7 | Lead-investor thesis tweets - AIsa advanced_search | GET | `https://api.aisa.one/apis/v2/twitter/tweet/advanced_search` | direct x402 | $0.05 |
| 8 | Founder shortlist - Apollo people-search | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-search` | routed MPP | $0.05 |
| 9 | Company enrichment - Apollo org-enrichment | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | routed MPP | $0.05 |

Full-run cap (`maxAmount`): **$0.40**. Per-step caps range **$0.02-$0.05**.
The live 402 challenge is the source of truth for the actual price.

## Rails & Providers

- **Direct Circle x402** - Tavily advanced search for HN/LinkedIn scoped web
  discovery, plus AIsa advanced_search for Twitter/X founder buzz, fundraising
  announcements, and investor/fund thesis tweets.
- **Routed MPP** - Parallel for Product Hunt discovery, Apollo for people-search
  and org-enrichment.
- **Routed x402 on Base** - Exa web search for launch and funding context.

There are intentionally no `mpp.orthogonal.com` endpoints and no Otto Twitter
endpoint in this skill. Twitter/X comes from AIsa's Circle-registry advanced
search endpoint.

## Live Probes

```bash
# direct x402 - HN via Tavily
selat-pay POST "https://x402.tavily.com/search" \
  --body '{"query":"AI inference infrastructure site:news.ycombinator.com","search_depth":"advanced","max_results":10,"topic":"general"}' \
  --chain base --probe-only

# routed MPP - Product Hunt via Parallel
selat-pay POST "https://parallelmpp.dev/api/search" \
  --body '{"objective":"AI inference infrastructure Product Hunt launches","search_queries":["AI inference infrastructure site:producthunt.com"],"max_results":10}' \
  --chain base --probe-only

# routed x402 - Exa web context
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"AI inference infrastructure startup launch funding","numResults":10}' \
  --chain base --probe-only

# direct x402 - Twitter/X via AIsa advanced_search
selat-pay GET "https://api.aisa.one/apis/v2/twitter/tweet/advanced_search?query=AI%20inference%20infra%20founder&queryType=Latest" \
  --chain base --probe-only

# routed MPP - enrich the top lead
selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-search" \
  --body '{"q_keywords":"AI inference infrastructure founder","person_titles":["Founder","Co-Founder","CEO","CTO"]}' \
  --chain base --probe-only
selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/org-enrichment" \
  --body '{"domain":"modal.com"}' \
  --chain base --probe-only
```
