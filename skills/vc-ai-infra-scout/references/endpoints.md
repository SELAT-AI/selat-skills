# Endpoints - vc-ai-infra-scout

VC deal-sourcing across mixed SELAT payment rails: x402 via Circle Gateway, MPP on Tempo,
and x402 on Base. The skill discovers AI-infra + crypto-AI companies and
founders, searches recent pre-seed/seed fundraising news on Twitter/X and
LinkedIn, distills the lead funds' thesis from tweets, then enriches the top lead.
Paid per call via selat-pay (USDC via Circle Gateway), no API keys.

## Endpoints Used

| # | Step | Method | URL | Rail | Cap |
|---|---|---|---|---|---|
| 1 | Hacker News discovery - Tavily advanced search | POST | `https://x402.tavily.com/search` | x402 on Base | $0.02 |
| 2 | Product Hunt discovery - Parallel web search | POST | `https://parallelmpp.dev/api/search` | MPP on Tempo | $0.05 |
| 3 | Launch + web context - Exa | POST | `https://api.exa.ai/search` | MPP on Tempo | $0.05 |
| 4 | Twitter/X founder & buzz - SELAT-native advanced_search | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search` | x402 via Circle Gateway | $0.001 |
| 5 | Fundraising news on Twitter/X - SELAT-native advanced_search | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search` | x402 via Circle Gateway | $0.001 |
| 6 | Fundraising news on LinkedIn - Tavily advanced search | POST | `https://x402.tavily.com/search` | x402 on Base | $0.02 |
| 7 | Lead-investor thesis tweets - SELAT-native advanced_search | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search` | x402 via Circle Gateway | $0.001 |
| 8 | Founder shortlist - Apollo people-search | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-search` | MPP on Tempo | $0.05 |
| 9 | Company enrichment - Apollo org-enrichment | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | MPP on Tempo | $0.05 |

Full-run cap (`maxAmount`): **$0.40**. Per-step caps range **$0.02-$0.05**.
The live 402 challenge is the source of truth for the actual price.

## Rails & Providers

- **x402 on Base** - Tavily advanced search for HN/LinkedIn scoped web
  discovery, plus SELAT-native advanced_search for Twitter/X founder buzz, fundraising
  announcements, and investor/fund thesis tweets.
- **MPP on Tempo** - Parallel for Product Hunt discovery, Apollo for people-search
  and org-enrichment.
- **x402 on Base** - Exa web search for launch and funding context.

There is intentionally no third-party Twitter-scraper merchant in this skill.
Twitter/X comes from SELAT-native's Circle-registry advanced search endpoint.

## Live Probes

```bash
# x402 on Base - HN via Tavily
selat-pay POST "https://x402.tavily.com/search" \
  --body '{"query":"AI inference infrastructure site:news.ycombinator.com","search_depth":"advanced","max_results":10,"topic":"general"}' \
  --chain base --probe-only

# MPP on Tempo - Product Hunt via Parallel
selat-pay POST "https://parallelmpp.dev/api/search" \
  --body '{"objective":"AI inference infrastructure Product Hunt launches","search_queries":["AI inference infrastructure site:producthunt.com"],"max_results":10}' \
  --chain base --probe-only

# x402 on Base - Exa web context
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"AI inference infrastructure startup launch funding","numResults":10}' \
  --chain base --probe-only

# x402 via Circle Gateway - Twitter/X via SELAT-native advanced_search
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=AI%20inference%20infra%20founder&queryType=Latest" \
  --chain base --probe-only

# MPP on Tempo - enrich the top lead
selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-search" \
  --body '{"q_keywords":"AI inference infrastructure founder","person_titles":["Founder","Co-Founder","CEO","CTO"]}' \
  --chain base --probe-only
selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/org-enrichment" \
  --body '{"domain":"modal.com"}' \
  --chain base --probe-only
```
