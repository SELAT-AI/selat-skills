# Endpoints — vc-ai-infra-scout

Use only these endpoint families for `vc-ai-infra-scout`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Broad web discovery | POST | `https://x402.tavily.com/search` | x402 on Base | $0.0105 |
| 2 — Product Hunt discovery | POST | `https://parallelmpp.dev/api/search` | MPP on Tempo | $0.0105 |
| 3 — Launch + funding context | POST | `https://api.exa.ai/search` | MPP on Tempo | $0.00735 |
| 4 — Twitter/X founder buzz | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${twitterQuery}&queryType=Latest` | x402 via Circle Gateway | $0.001 |
| 5 — Twitter/X fundraising news | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${fundraisingQuery}&queryType=Latest` | x402 via Circle Gateway | $0.001 |
| 6 — LinkedIn fundraising news | POST | `https://x402.tavily.com/search` | x402 on Base | $0.0105 |
| 7 — Investor thesis tweets | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${investorQuery}&queryType=Latest` | x402 via Circle Gateway | $0.001 |
| 8 — Founder shortlist | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-search` | MPP on Tempo | $0.00525 |
| 9 — Company enrichment | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | MPP on Tempo | $0.0399 |

This is a fixed 9-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 on Base / Polygon:** Tavily (`x402.tavily.com`) settles via Circle Gateway batched nanopayments. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`). Verify prints `routed-x402`.
- **MPP on Tempo:** Apollo via Locus (`apollo.mpp.paywithlocus.com`). Parallel (`parallelmpp.dev`) and Exa (`api.exa.ai`) are MPP on Tempo but not Locus.

## Tavily — `x402 on Base`

serviceUrl: `https://x402.tavily.com`

Live-probed price: `$0.0105` per call (`routed-x402`). All endpoints are **POST
with a JSON body**. Steps 1 and 6 hit the same path with different queries.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Broad web discovery | `/search` | `query` (`${thesis} startup funding`), `search_depth` (`advanced`), `max_results` (integer), `topic` (`general`) |
| LinkedIn fundraising news | `/search` | `query` (`${fundraisingQuery} site:linkedin.com/posts`), `search_depth` (`advanced`), `max_results` (integer), `topic` (`general`) |

```json
{ "query": "AI infrastructure startup funding", "search_depth": "advanced", "max_results": 10, "topic": "general" }
```

## Parallel — `MPP on Tempo`

serviceUrl: `https://parallelmpp.dev`

Live-probed price: `$0.0105` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Product Hunt discovery | `/api/search` | `objective` (string), `search_queries` (string array), `max_results` (integer) |

```json
{ "objective": "AI infrastructure Product Hunt launches", "search_queries": ["AI infrastructure site:producthunt.com"], "max_results": 10 }
```

## Exa — `MPP on Tempo`

serviceUrl: `https://api.exa.ai`

Live-probed price: `$0.00735` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Launch + funding context | `/search` | `query` (string), `numResults` (integer), `contents.text.maxCharacters` (integer) |

```json
{ "query": "AI infrastructure startup launch funding", "numResults": 10, "contents": { "text": { "maxCharacters": 3000 } } }
```

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`). All endpoints are **GET
with query-string params**. Steps 4, 5, and 7 hit the same path with different
queries.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Twitter/X founder buzz | `/twitter/tweet/advanced_search` | `query` (`${twitterQuery}`), `queryType` (`Latest`) |
| Twitter/X fundraising news | `/twitter/tweet/advanced_search` | `query` (`${fundraisingQuery}`), `queryType` (`Latest`) |
| Investor thesis tweets | `/twitter/tweet/advanced_search` | `query` (`${investorQuery}`), `queryType` (`Latest`) |

Query pattern:

```text
https://catalog.selat.ai/twitter/tweet/advanced_search?query=AI%20infra%20founder&queryType=Latest
```

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): people-search `$0.00525`, org-enrichment
`$0.0399`. All endpoints are **POST with a JSON body**. Override `${domain}`
to the top company the pipeline surfaced — the default `modal.com` is a
placeholder.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Founder shortlist | `/apollo/people-search` | `q_keywords` (string), `person_titles` (string array) |
| Company enrichment | `/apollo/org-enrichment` | `domain` (string, required) |

```json
{ "q_keywords": "AI infrastructure founder", "person_titles": ["Founder", "Co-Founder", "CEO", "CTO"] }
```
