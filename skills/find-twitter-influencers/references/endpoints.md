# find-twitter-influencers — endpoints

Every endpoint below is probe-verified live-payable (probe-verified 2026-07-10 with `selat-pay --probe-only`). Caps (`maxAmount`) are ~10x each live price, not the live price. Rails: `MPP on Tempo` (via Locus / Tempo gateways); `x402 via Circle Gateway` = Circle x402 catalog, paid via Circle Gateway and Circle Gateway-batched.

| Merchant | Rail | Endpoint | Live price |
|---|---|---|---|
| apollo (via Locus) | MPP on Tempo | `POST apollo.mpp.paywithlocus.com/apollo/org-search` | $0.00525 |
| abstract-company-enrichment (via Locus) | MPP on Tempo | `POST abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup` | $0.0063 |
| exa (via Tempo) | MPP on Tempo | `POST exa.mpp.tempo.xyz/search` | $0.00525 |
| exa (via Tempo) | MPP on Tempo | `POST exa.mpp.tempo.xyz/findSimilar` | $0.00525 |
| selat | x402 via Circle Gateway | `GET catalog.selat.ai/twitter/user/info?userName=` | $0.001 |
| selat | x402 via Circle Gateway | `GET catalog.selat.ai/twitter/user/last_tweets?userName=` | $0.001 |
| hunter (via Locus) | MPP on Tempo | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | $0.01365 |
| clado (via Locus) | MPP on Tempo | `POST clado.mpp.paywithlocus.com/clado/contacts` | $0.04515 |
