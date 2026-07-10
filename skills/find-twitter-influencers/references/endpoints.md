# find-twitter-influencers — endpoints

Every endpoint below is probe-verified live-payable (probe-verified 2026-07-10 with `selat-pay --probe-only`). Caps are a 5 USDC spending filter, not the live price. Rails: `routed` = MPP via the SELAT Router (Locus / Tempo gateways); `direct` = Circle x402 catalog (AIsa), paid direct and Circle Gateway-batched.

| Merchant | Rail | Endpoint | Live price |
|---|---|---|---|
| apollo (via Locus) | routed | `POST apollo.mpp.paywithlocus.com/apollo/org-search` | $0.00525 |
| abstract-company-enrichment (via Locus) | routed | `POST abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup` | $0.0063 |
| exa (via Tempo) | routed | `POST exa.mpp.tempo.xyz/search` | $0.00525 |
| exa (via Tempo) | routed | `POST exa.mpp.tempo.xyz/findSimilar` | $0.00525 |
| aisa | direct | `GET api.aisa.one/apis/v2/twitter/user/info?userName=` | $0.00044 |
| aisa | direct | `GET api.aisa.one/apis/v2/twitter/user/last_tweets?userName=` | $0.0036 |
| hunter (via Locus) | routed | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | $0.01365 |
| clado (via Locus) | routed | `POST clado.mpp.paywithlocus.com/clado/contacts` | $0.04515 |
