# email-campaign — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router (`selat-pay --probe-only`, probe-verified 2026-07-10). Caps are a 5 USDC spending filter, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/domain-search` | $0.10815 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | $0.01365 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | $0.0084 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` (bounce check) | $0.0084 |
| apollo | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | $0.0084 |
| abstract-company-enrichment | `POST abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup` | $0.0063 |

Notes:

- The bounce check is now a second pass through the same Hunter `email-verifier` endpoint as the deliverability step (Hunter's verdict covers bounce risk and catch-all domains); drop one of the two verifier steps if a single verification is enough.
- The company-context step returns firmographics (industry, description, size, location) from Abstract Company Enrichment — it does not return brand assets (logos, colors) the way the previous provider did.
