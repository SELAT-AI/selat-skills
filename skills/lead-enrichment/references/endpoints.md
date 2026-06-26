# lead-enrichment — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router (`selat-pay --probe-only`). Caps are a 5 USDC spending filter, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | $0.01365 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | $0.0084 |
| sixtyfour | `POST mpp.orthogonal.com/sixtyfour/enrich-lead` | $0.105 |
| sixtyfour | `POST mpp.orthogonal.com/sixtyfour/find-phone` | $0.315 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/company-enrichment` | $0.01365 |
