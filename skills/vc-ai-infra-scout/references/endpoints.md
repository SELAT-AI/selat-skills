# Endpoints — vc-ai-infra-scout

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Broad Web Discovery | POST | `https://x402.tavily.com/search` | x402 on Base | $0.0105 |
| 2 — Product Hunt Discovery | POST | `https://parallelmpp.dev/api/search` | MPP on Tempo | $0.0105 |
| 3 — Launch + Funding Context | POST | `https://api.exa.ai/search` | MPP on Tempo | $0.00735 |
| 4 — Twitter/X Founder Buzz | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${twitterQuery}&queryType=Latest` | x402 via Circle Gateway | $0.001 |
| 5 — Twitter/X Fundraising News | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${fundraisingQuery}&queryType=Latest` | x402 via Circle Gateway | $0.001 |
| 6 — LinkedIn Fundraising News | POST | `https://x402.tavily.com/search` | x402 on Base | $0.0105 |
| 7 — Investor Thesis Tweets | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${investorQuery}&queryType=Latest` | x402 via Circle Gateway | $0.001 |
| 8 — Founder Shortlist | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-search` | MPP on Tempo | $0.00525 |
| 9 — Company Enrichment | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | MPP on Tempo | $0.0084 |

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 on Base / Polygon:** Settles via Circle Gateway batched nanopayments.
- **MPP on Tempo:** Settles via Locus MPP on Tempo (chain 4217).
