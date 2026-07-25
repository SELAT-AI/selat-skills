# twitter-profile-lookup — endpoints

Every endpoint below is probe-verified live-payable as a x402 via Circle Gateway call (Circle x402 catalog, Circle Gateway-batched; `selat-pay --probe-only`, 2026-07-10). Caps (`maxAmount`) are ~10x each live price, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| SELAT-native | `GET catalog.selat.ai/twitter/user/info?userName=${handle}` | $0.001 |
| SELAT-native | `GET catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | $0.001 |
