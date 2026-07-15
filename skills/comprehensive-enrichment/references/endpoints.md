# comprehensive-enrichment — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router (`selat-pay --probe-only`, verified 2026-07-10). Caps (`maxAmount`) are ~10x each live price, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| clado | `POST clado.mpp.paywithlocus.com/clado/search` | $0.31815 |
| apollo | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | $0.0084 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-enrichment` | $0.01365 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | $0.01365 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | $0.0084 |
| clado | `POST clado.mpp.paywithlocus.com/clado/contacts` | $0.04515 |
| exa | `POST exa.mpp.tempo.xyz/search` (person research) | $0.00525 |
| abstract-company-enrichment | `POST abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup` | $0.0063 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/domain-search` | $0.10815 |
| diffbot-kg | `POST diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance` | $0.03675 |
| firecrawl | `POST firecrawl.mpp.tempo.xyz/v1/extract` | $0.00525 |
| exa | `POST exa.mpp.tempo.xyz/findSimilar` | $0.00525 |
| exa | `POST exa.mpp.tempo.xyz/search` (company research) | $0.00525 |

Notes:

- **Clado search is synchronous** — natural-language people search returns in one call, no job polling.
- **Phone lookup requires a LinkedIn URL**: Clado contacts enriches by `linkedin_url` (there is no name+company phone lookup on this rail).
- **Funding and investors come from one call**: the Diffbot KG `enhance` Organization record includes both funding rounds and investors, so one step covers both.
- **Email verification is a single Hunter step**: the previous three-provider verifier fan-out collapsed into one Hunter email-verifier call (same endpoint, same params).
