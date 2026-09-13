# Endpoints — enrich-waterfall

Use only these endpoint families for `enrich-waterfall`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

Removed dead Clado `/linkedin-profile`, `/scrape`, and `/search` (no 402).
LinkedIn public-page read uses Scrape Creators sync profile. Company overview
uses Orthogonal Company Enrich GET-by-domain. Clado `/clado/contacts` is kept.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Person resolve (Apollo) | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 |
| 2 — Person resolve by email (Hunter) | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-enrichment` | MPP on Tempo | $0.01365 |
| 3 — Person resolve by LinkedIn | GET | `https://mpp.orthogonal.com/scrapecreators/v1/linkedin/profile?url=${linkedinUrl}` | MPP on Tempo | $0.021 |
| 4 — Person+company resolve (Hunter combined) | POST | `https://hunter.mpp.paywithlocus.com/hunter/combined-enrichment` | MPP on Tempo | $0.02415 |
| 5 — Company anchor by name (Apollo org-search) | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-search` | MPP on Tempo | $0.00525 |
| 6 — Company anchor by domain | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 |
| 7 — Company anchor + tech + headcount (Apollo) | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | MPP on Tempo | $0.0399 |
| 8 — Company anchor (Hunter) | POST | `https://hunter.mpp.paywithlocus.com/hunter/company-enrichment` | MPP on Tempo | $0.01365 |
| 9 — Email find by name (Hunter) | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 |
| 10 — X/Twitter profile | GET | `https://catalog.selat.ai/twitter/user/info?userName=${name}` | x402 via Circle Gateway | $0.001 |
| 11 — Instagram profile | POST | `https://stablesocial.dev/api/instagram/profile` | MPP on Tempo | $0.063 |
| 12 — TikTok profile | POST | `https://stablesocial.dev/api/tiktok/profile` | MPP on Tempo | $0.063 |
| 13 — Job openings (Apollo) | POST | `https://apollo.mpp.paywithlocus.com/apollo/job-postings` | MPP on Tempo | $0.00525 |
| 14 — News events (Brave) | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | MPP on Tempo | $0.03675 |
| 15 — Financing events (Brave) | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | MPP on Tempo | $0.03675 |
| 16 — Business connections (Diffbot KG) | POST | `https://diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance` | MPP on Tempo | $0.03675 |
| 17 — Contact reveal (Clado contacts) | POST | `https://clado.mpp.paywithlocus.com/clado/contacts` | MPP on Tempo | $0.04515 |
| 18 — Email verify (Hunter) | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 |

This is a fixed 18-call manifest (resolve → anchor → social → signals →
escalate → verify). The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`). Verify prints `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** Apollo, Hunter, Clado, Brave, and Diffbot KG via Locus (`*.mpp.paywithlocus.com`). StableSocial (`stablesocial.dev`) is MPP on Tempo but not Locus. Orthogonal Company Enrich and Scrape Creators via `mpp.orthogonal.com`.

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): people-enrichment / org-enrichment `$0.0399`,
org-search / job-postings `$0.00525`. All endpoints are **POST with a JSON
body**. `job-postings` needs `organization_id` from org-enrichment or
org-search — run an anchor step first.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person resolve | `/apollo/people-enrichment` | `email`, `first_name`, `last_name`, `organization_name`, `domain`, `linkedin_url` |
| Company anchor by name | `/apollo/org-search` | `q_organization_name` (string) |
| Company anchor + tech + headcount | `/apollo/org-enrichment` | `domain` (string) |
| Job openings | `/apollo/job-postings` | `organization_id` (string, required) |

```json
{ "email": "test@stripe.com", "first_name": "John", "last_name": "Doe", "organization_name": "Stripe", "domain": "stripe.com", "linkedin_url": "https://linkedin.com/in/williamhgates" }
```

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): email-enrichment / company-enrichment /
email-finder `$0.01365`, combined-enrichment `$0.02415`, email-verifier
`$0.0084`. All endpoints are **POST with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person resolve by email | `/hunter/email-enrichment` | `email` (string, required) |
| Person+company resolve | `/hunter/combined-enrichment` | `email` (string, required) |
| Company anchor | `/hunter/company-enrichment` | `domain` (string, required) |
| Email find by name | `/hunter/email-finder` | `domain`, `first_name`, `last_name` |
| Email verify | `/hunter/email-verifier` | `email` (string, required) |

```json
{ "email": "test@stripe.com" }
```

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` (`routed-mpp`, 2026-09-12). Domain lookup is
**GET with a query-string `domain`**. Replaces the dead Abstract Company
Enrichment `POST /abstract-company-enrichment/lookup`. Per-step cap `$0.02`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Company anchor by domain | `/companies/enrich` | `domain` (string, required) — bare host, no protocol or path |

```text
https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com
```

## Scrape Creators LinkedIn — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/scrapecreators`

Live-probed price: `$0.021` (`routed-mpp`, 2026-09-12) for `/v1/linkedin/profile`.
**GET with a query-string `url`.** Replaces dead Clado `/linkedin-profile`.
The former Clado `/scrape` social step was dropped rather than duplicated
(same person URL already read in resolve). Per-step cap `$0.03`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Person resolve by LinkedIn | `/v1/linkedin/profile` | `url` (public person-profile URL) |

```text
https://mpp.orthogonal.com/scrapecreators/v1/linkedin/profile?url=https://linkedin.com/in/williamhgates
```

## Clado contacts — `MPP on Tempo`

serviceUrl: `https://clado.mpp.paywithlocus.com`

Live-probed price: `$0.04515` (`routed-mpp`, re-probed 2026-09-12). All
endpoints are **POST with a JSON body**. Keep this route. Do not call
`/clado/search`, `/clado/linkedin-profile`, or `/clado/scrape`.

Escalate-tier step 17 is still **in the default manifest** (not an optional
add-on). Gate it on gaps if you are running the waterfall by hand.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Contact reveal | `/clado/contacts` | `linkedin_url` (string, required) |

```json
{ "linkedin_url": "https://linkedin.com/in/williamhgates" }
```

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`). All endpoints are **GET
with query-string params**. The manifest passes `${name}` as `userName`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| X/Twitter profile | `/twitter/user/info` | `userName` (string, required) |

Query pattern:

```text
https://catalog.selat.ai/twitter/user/info?userName=John%20Doe
```

## StableSocial — `MPP on Tempo`

serviceUrl: `https://stablesocial.dev`

Live-probed price: `$0.063` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. Profile-level Instagram/TikTok lookups go by handle.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Instagram profile | `/api/instagram/profile` | `handle` (string, required) |
| TikTok profile | `/api/tiktok/profile` | `handle` (string, required) |

```json
{ "handle": "John Doe" }
```

## Brave Search MPP — `MPP on Tempo`

serviceUrl: `https://brave.mpp.paywithlocus.com`

Live-probed price: `$0.03675` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. Steps 14 and 15 hit the same path with different queries.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| News events | `/brave/news-search` | `q` (string — `${company} news`) |
| Financing events | `/brave/news-search` | `q` (string — `${company} funding round`) |

```json
{ "q": "Stripe funding round" }
```

## Diffbot KG — `MPP on Tempo`

serviceUrl: `https://diffbot-kg.mpp.paywithlocus.com`

Live-probed price: `$0.03675` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. Funding rounds and investors are in the same Organization
`enhance` response.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Business connections / KG record | `/diffbot-kg/enhance` | `type` (string, `Organization`), `name` (string) |

```json
{ "type": "Organization", "name": "Stripe" }
```
