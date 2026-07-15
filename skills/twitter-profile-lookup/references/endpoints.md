# twitter-profile-lookup — endpoints

Every endpoint below is probe-verified live-payable as a direct x402 call (Circle x402 catalog, Circle Gateway-batched; `selat-pay --probe-only`, 2026-07-10). Caps (`maxAmount`) are ~10x each live price, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| AIsa | `GET api.aisa.one/apis/v2/twitter/user/info?userName=${handle}` | $0.00044 |
| AIsa | `GET api.aisa.one/apis/v2/twitter/user/last_tweets?userName=${handle}` | $0.0036 |
