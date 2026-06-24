# find-twitter-influencers — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router (`selat-pay --probe-only`). Caps are a 5 USDC spending filter, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| brand-dev | `GET mpp.orthogonal.com/brand-dev/v1/brand/retrieve-by-name` | ~ |
| brand-dev | `GET mpp.orthogonal.com/brand-dev/v1/brand/retrieve` | ~ |
| exa | `POST exa.mpp.tempo.xyz/search` | $0.00525 |
| exa | `POST exa.mpp.tempo.xyz/findSimilar` | $0.00525 |
| scrapecreators | `GET mpp.orthogonal.com/scrapecreators/v1/twitter/profile` | ~ |
| scrapecreators | `GET mpp.orthogonal.com/scrapecreators/v1/twitter/user-tweets` | ~ |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | $0.01365 |
| tomba | `GET mpp.orthogonal.com/tomba/v1/linkedin` | ~ |
