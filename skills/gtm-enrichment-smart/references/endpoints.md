# gtm-enrichment-smart — endpoints

Every endpoint below is probe-verified live-payable (`selat-pay --probe-only`, 2026-07-10). Routed rows go over MPP via the SELAT Router; the AIsa row is a direct Circle x402 call (Gateway-batched). Caps are a 5 USDC spending filter, not the live price.

| Merchant | Rail | Endpoint | Live price |
|---|---|---|---|
| apollo (via Locus) | routed | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | $0.0084 |
| hunter (via Locus) | routed | `POST hunter.mpp.paywithlocus.com/hunter/combined-enrichment` | $0.02415 |
| hunter (via Locus) | routed | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | $0.0084 |
| abstract-company-enrichment (via Locus) | routed | `POST abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup` | $0.0063 |
| apollo (via Locus) | routed | `POST apollo.mpp.paywithlocus.com/apollo/org-enrichment` | $0.0084 |
| hunter (via Locus) | routed | `POST hunter.mpp.paywithlocus.com/hunter/email-enrichment` | $0.01365 |
| hunter (via Locus) | routed | `POST hunter.mpp.paywithlocus.com/hunter/company-enrichment` | $0.01365 |
| aisa (Circle x402 catalog) | direct | `GET api.aisa.one/apis/v2/twitter/user/info` | $0.00044 |
| apollo (via Locus) — caller-invoked job-postings signal, not a manifest step | routed | `POST apollo.mpp.paywithlocus.com/apollo/job-postings` | $0.00525 |

Notes:

- The old separate AI person-fallback step resolved to the same `apollo/people-enrichment` endpoint as the primary person step and was merged into it.
- The former product/pricing buying-signal call (Brand.dev `ai/products`) has no equivalent among these merchants and was removed — capability gap.
