# Endpoints — find-twitter-influencers

Use only these endpoint families for `find-twitter-influencers`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Resolve company by name | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-search` | MPP on Tempo | $0.00525 |
| 2 — Resolve company by domain | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 |
| 3 — Discover curated listicles | POST | `https://exa.mpp.tempo.xyz/search` | MPP on Tempo | $0.00525 |
| 4 — Expand from a strong listicle | POST | `https://exa.mpp.tempo.xyz/findSimilar` | MPP on Tempo | $0.00525 |
| 5 — Fetch Twitter profile + counts | GET | `https://catalog.selat.ai/twitter/user/info?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 6 — Fetch top tweets + engagement | GET | `https://catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 7 — Find email by name + domain | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 |
| 8 — LinkedIn-to-contact | POST | `https://clado.mpp.paywithlocus.com/clado/contacts` | MPP on Tempo | $0.04515 |

This is a fixed 8-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`). Verify prints `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** Apollo, Hunter, and Clado contacts via Locus (`*.mpp.paywithlocus.com`). Exa (`exa.mpp.tempo.xyz`) is MPP on Tempo but not Locus. Orthogonal Company Enrich via `mpp.orthogonal.com`.

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

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` (`routed-mpp`, 2026-09-12). Domain lookup is
**GET with a query-string `domain`**. Replaces the dead Abstract Company
Enrichment `POST /abstract-company-enrichment/lookup`. Per-step cap `$0.02`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Resolve company by domain | `/companies/enrich` | `domain` (string, required) — bare host, no protocol or path |

```text
https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com
```

## Exa MPP — `MPP on Tempo`

serviceUrl: `https://exa.mpp.tempo.xyz`

Live-probed price: `$0.00525` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. x.com / twitter.com profiles are not in Exa's index —
search for listicle pages.

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

## Clado contacts — `MPP on Tempo`

serviceUrl: `https://clado.mpp.paywithlocus.com`

Live-probed price: `$0.04515` per call (`routed-mpp`, re-probed 2026-09-12).
All endpoints are **POST with a JSON body**. Requires a LinkedIn URL. Keep
this route; Clado `/search`, `/linkedin-profile`, and `/scrape` are dead and
are not used here.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| LinkedIn-to-contact | `/clado/contacts` | `linkedin_url` (string, required) |

```json
{ "linkedin_url": "https://linkedin.com/in/janesmith" }
```
