# Endpoints — find-twitter-influencers

Use only these endpoint families for `find-twitter-influencers`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Resolve company by name | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-search` | MPP on Tempo | $0.00525 |
| 2 — Resolve company by domain | POST | `https://abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup` | MPP on Tempo | $0.0063 |
| 3 — Discover curated listicles | POST | `https://exa.mpp.tempo.xyz/search` | MPP on Tempo | $0.00525 |
| 4 — Expand from a strong listicle | POST | `https://exa.mpp.tempo.xyz/findSimilar` | MPP on Tempo | $0.00525 |
| 5 — Fetch Twitter profile + counts | GET | `https://catalog.selat.ai/twitter/user/info?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 6 — Fetch top tweets + engagement | GET | `https://catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 7 — Find email by name + domain | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 |
| 8 — LinkedIn-to-contact | POST | `https://clado.mpp.paywithlocus.com/clado/contacts` | MPP on Tempo | $0.04515 |

This is a fixed 8-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`). Verify prints `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** Apollo, Abstract Company Enrichment, Hunter, and Clado via Locus (`*.mpp.paywithlocus.com`). Exa (`exa.mpp.tempo.xyz`) is MPP on Tempo but not Locus.

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.00525` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Resolve company by name | `/apollo/org-search` | `q_organization_name` (string, required) |

```json
{ "q_organization_name": "Stripe" }
```

## Abstract Company Enrichment — `MPP on Tempo`

serviceUrl: `https://abstract-company-enrichment.mpp.paywithlocus.com`

Last documented price: `$0.0063` per call (`routed-mpp`). Today's live probe
did not surface a 402 — re-probe. All endpoints are **POST with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Resolve company by domain | `/abstract-company-enrichment/lookup` | `domain` (string, required) |

```json
{ "domain": "stripe.com" }
```

## Exa MPP — `MPP on Tempo`

serviceUrl: `https://exa.mpp.tempo.xyz`

Live-probed price: `$0.00525` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Discover curated listicles | `/search` | `query` (string), `numResults` (integer), `contents.text.maxCharacters` (integer) |
| Expand from a strong listicle | `/findSimilar` | `url` (string), `numResults` (integer), `contents.text.maxCharacters` (integer) |

```json
{ "query": "best fintech Twitter accounts to follow", "numResults": 10, "contents": { "text": { "maxCharacters": 5000 } } }
```

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`). All endpoints are **GET
with query-string params**.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Fetch Twitter profile + counts | `/twitter/user/info` | `userName` (string, required — handle, no `@`) |
| Fetch top tweets + engagement | `/twitter/user/last_tweets` | `userName` (string, required) |

Query pattern:

```text
https://catalog.selat.ai/twitter/user/info?userName=examplehandle
```

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed price: `$0.01365` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Find email by name + domain | `/hunter/email-finder` | `domain`, `first_name`, `last_name` |

```json
{ "domain": "janesmithcreative.com", "first_name": "Jane", "last_name": "Smith" }
```

## Clado MPP — `MPP on Tempo`

serviceUrl: `https://clado.mpp.paywithlocus.com`

Live-probed price: `$0.04515` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. Requires a LinkedIn URL.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| LinkedIn-to-contact | `/clado/contacts` | `linkedin_url` (string, required) |

```json
{ "linkedin_url": "https://linkedin.com/in/janesmith" }
```
