# email-campaign — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router (`selat-pay --probe-only`). Caps are a 5 USDC spending filter, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/domain-search` | $0.10815 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | $0.01365 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | $0.0084 |
| fiber | `POST mpp.orthogonal.com/fiber/v1/validate-email/single` | $0.021 |
| sixtyfour | `POST mpp.orthogonal.com/sixtyfour/enrich-lead` | $0.105 |
| brand-dev | `GET mpp.orthogonal.com/brand-dev/v1/brand/retrieve` | ~ |
