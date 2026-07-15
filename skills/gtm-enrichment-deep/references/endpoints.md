# gtm-enrichment-deep — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router (`selat-pay --probe-only`, 2026-07-10). Caps are ~10x each live price ($0.10–$0.15 per step), not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| apollo (via Locus) | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | $0.0084 |
| hunter (via Locus) | `POST hunter.mpp.paywithlocus.com/hunter/company-enrichment` | $0.01365 |
| apollo (via Locus) | `POST apollo.mpp.paywithlocus.com/apollo/org-enrichment` | $0.0084 |

Notes:

- Apollo `people-enrichment` serves both the primary person lookup and the former LinkedIn-match fallback — one call covers both, so the skill makes a single person-enrichment request.
- Neither Hunter nor Apollo returns an AI/B2B-SaaS classification field. Classification must be inferred from the returned company description/keywords and marked low confidence.
