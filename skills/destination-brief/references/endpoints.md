# Endpoints — destination-brief

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1. points of interest | GET | `https://tripadvisor.x402.paysponge.com/api/v1/location/search` | routed (x402 outbound) | $0.0105 |
| 2. web context | POST | `https://x402.tavily.com/search` | routed (x402 outbound) | $0.0105 |
| 3. SERP | GET | `https://serpapi.mpp.tempo.xyz/search` | routed (MPP / tempo-native) | $0.0158 |

Full-run cost ≈ **$0.037**. Manifest `maxAmount` is `0.09` (per-step `0.03`) —
headroom over the ~5% router markup, not a price.

## 1. Tripadvisor — location search

- **Provider:** Tripadvisor, via the paysponge x402 gateway.
- **serviceUrl:** `https://tripadvisor.x402.paysponge.com` (catalogue `serviceUrl`,
  not the descriptive provider URL).
- **Payment:** routed via the SELAT Router; outbound leg x402 / erc-3009 on Base.
- **Catalogue source:** `agentic` (x402 Bazaar).

| Param | Required | Type | Notes |
|---|---|---|---|
| `searchQuery` | yes | string | Free-text place name. Fuzzy-resolved; qualify ambiguous names with a country. |

Corroborated live (the authoritative source per `schema-enrichment.md`):

```
$ selat-pay GET "https://tripadvisor.x402.paysponge.com/api/v1/location/search?searchQuery=Paris" \
    --chain base --max-amount 0.02
[selat-pay] price=$0.010500 on eip155:8453   mode=routed-x402
[selat-pay] status=200
```

`quoteId=selatxafb39bfd-b66c-4c2b-b989-932d7e3a4e1e`

## 2. Tavily — web search

- **Provider:** Tavily, first-party x402 endpoint.
- **serviceUrl:** `https://x402.tavily.com`
- **Payment:** routed via the SELAT Router; outbound leg x402 / erc-3009 on Base.
- **Catalogue source:** `agentic`.

Declared `inputSchema.required` is `[]`, but **the live API rejects a request
without `query`** — a documented instance of the spec-drift `schema-enrichment.md`
warns about. Trust the live API.

| Param | Required | Type | Notes |
|---|---|---|---|
| `query` | yes *(in practice)* | string | Non-empty, max 1000 chars. Empty ⇒ 400 **and you are still charged.** |
| `max_results` | no | integer | Skill sends `5`. |
| `search_depth` | no | string | Not used by this skill. |
| `include_answer` | no | boolean | Not used by this skill. |
| `include_domains` / `exclude_domains` | no | array | Not used by this skill. |

Corroborated live:

```
$ selat-pay POST https://x402.tavily.com/search --chain base --max-amount 0.02 \
    --body '{"query":"x402 agent payments protocol","max_results":3}'
[selat-pay] price=$0.010500 on eip155:8453   mode=routed-x402
[selat-pay] status=200
{"results":[{"url":"https://www.crossmint.com/learn/agentic-payments-protocols-compared", …}],
 "response_time":1.66}
```

`quoteId=selatx270ae450-2790-40e6-ba51-c9aa22a75acb`

The same call **without** `--body` returned `400 Validation failed` and was
charged $0.010500 — `quoteId=selatx202a7469-4800-464e-baa3-6e560ba6c471`. That is
the pay-before-validate hazard, observed rather than theorised.

## 3. SerpApi — Google SERP

- **Provider:** SerpApi, via the Tempo MPP gateway.
- **serviceUrl:** `https://serpapi.mpp.tempo.xyz`
- **Payment:** routed via the SELAT Router; outbound leg MPP, `tempo-native`.
- **Catalogue source:** `mpp`.

| Param | Required | Type | Notes |
|---|---|---|---|
| `q` | yes | string | Search term. |
| `engine` | no | string | Skill pins `google`. |

Corroborated live:

```
$ selat-pay GET "https://serpapi.mpp.tempo.xyz/search?q=x402+protocol&engine=google" \
    --chain base --max-amount 0.03
[selat-pay] price=$0.015750 on eip155:8453   mode=routed-mpp
[selat-pay] status=200
```

`quoteId=selatxfa4b7a07-b3db-484e-bde5-7a8a6b7796d2`

Catalogue lists this at `$0.0150`; charged `$0.015750` — the ~5% router markup.

## Notes for maintainers

- All three hosts are reachable from an egress-restricted environment **only if
  allowlisted individually** (`tripadvisor.x402.paysponge.com` is covered by
  `*.x402.paysponge.com`, `serpapi.mpp.tempo.xyz` by `*.mpp.tempo.xyz`;
  `x402.tavily.com` needs its own entry).
- Steps are independent. Order is cheapest-first per the authoring SOP; a failure
  in any one step should not abort the others.
