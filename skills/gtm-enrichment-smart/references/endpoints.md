# gtm-enrichment-smart — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router (`selat-pay --probe-only`). Caps are a 5 USDC spending filter, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| apollo | `POST mpp.orthogonal.com/apollo/api/v1/people/match` | $0.0105 |
| tomba | `GET mpp.orthogonal.com/tomba/v1/combined/find` | ~ |
| tomba | `GET mpp.orthogonal.com/tomba/v1/email-verifier` | ~ |
| brand-dev | `GET mpp.orthogonal.com/brand-dev/v1/brand/retrieve` | ~ |
| apollo | `GET mpp.orthogonal.com/apollo/api/v1/organizations/enrich` | ~ |
| tomba | `GET mpp.orthogonal.com/tomba/v1/enrich` | ~ |
| sixtyfour | `POST mpp.orthogonal.com/sixtyfour/enrich-lead` | $0.105 |
| sixtyfour | `POST mpp.orthogonal.com/sixtyfour/enrich-company` | $0.105 |
| scrapecreators | `GET mpp.orthogonal.com/scrapecreators/v1/twitter/profile` | ~ |
