# gtm-enrichment-deep — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router (`selat-pay --probe-only`). Caps are a 5 USDC spending filter, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| sixtyfour | `POST mpp.orthogonal.com/sixtyfour/enrich-lead` | $0.105 |
| sixtyfour | `POST mpp.orthogonal.com/sixtyfour/enrich-company` | $0.105 |
| apollo | `POST mpp.orthogonal.com/apollo/api/v1/people/match` | $0.0105 |
| apollo | `GET mpp.orthogonal.com/apollo/api/v1/organizations/enrich` | ~ |
