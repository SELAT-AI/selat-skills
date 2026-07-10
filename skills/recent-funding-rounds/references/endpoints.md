# recent-funding-rounds — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router (`selat-pay --probe-only`, verified 2026-07-10). Caps are a 5 USDC spending filter, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| Brave Search (via Locus) | `POST brave.mpp.paywithlocus.com/brave/news-search` | $0.03675 |

Note: Brave news-search returns recent news articles about funding rounds (title, snippet, source, publish date, URL) — it is not a structured funding database. Deal details (company, round type, size) must be extracted from the article text.
