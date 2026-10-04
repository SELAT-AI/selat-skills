# Endpoints — enrich-waterfall

Use only these endpoint families for `enrich-waterfall`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

Dead Clado `/linkedin-profile`, `/scrape`, and `/search` serve no 402 (re-checked
2026-10-04). The LinkedIn public-profile read uses Scrape Creators sync profile;
the former Clado `/scrape` step was dropped rather than duplicated (same person
URL already read in step 3); the five-result person search uses Apollo
people-search. Company overview uses Orthogonal Company Enrich GET-by-domain.
Clado `/clado/contacts` is kept. The StableSocial Instagram/TikTok async job
routes are not used.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Person cross-check (Apollo) | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 | $0.06 |
| 2 — Person by supplied email (Hunter) | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-enrichment` | MPP on Tempo | $0.01365 | $0.02 |
| 3 — Person by supplied LinkedIn URL | GET | `https://mpp.orthogonal.com/scrapecreators/v1/linkedin/profile?url=${linkedinUrl}` | MPP on Tempo | $0.021 | $0.03 |
| 4 — Person + company by email (Hunter combined) | POST | `https://hunter.mpp.paywithlocus.com/hunter/combined-enrichment` | MPP on Tempo | $0.02415 | $0.035 |
| 5 — Company search by name (Apollo org-search) | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-search` | MPP on Tempo | $0.0399 | $0.06 |
| 6 — Company profile by domain | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 | $0.02 |
| 7 — Company tech + headcount (Apollo) | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | MPP on Tempo | $0.0399 | $0.06 |
| 8 — Company cross-check (Hunter) | POST | `https://hunter.mpp.paywithlocus.com/hunter/company-enrichment` | MPP on Tempo | $0.01365 | $0.02 |
| 9 — Find target work email (Hunter) | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 | $0.02 |
| 10 — X/Twitter profile by handle | GET | `https://catalog.selat.ai/twitter/user/info?userName=${xHandle}` | x402 via Circle Gateway | $0.001 | $0.0015 |
| 11 — Job openings (Apollo) | POST | `https://apollo.mpp.paywithlocus.com/apollo/job-postings` | MPP on Tempo | $0.0399 | $0.06 |
| 12 — Recent company news (Brave) | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | MPP on Tempo | $0.03675 | $0.05 |
| 13 — Recent funding news (Brave) | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | MPP on Tempo | $0.03675 | $0.05 |
| 14 — Organization knowledge graph (Diffbot KG) | POST | `https://diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance` | MPP on Tempo | $0.03675 | $0.05 |
| 15 — Contact email + phone reveal (Clado contacts) | POST | `https://clado.mpp.paywithlocus.com/clado/contacts` | MPP on Tempo | $0.15015 | $0.20 |
| 16 — Five-result person search (Apollo people-search) | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-search` | MPP on Tempo | $0.00525 | $0.0075 |
| 17 — Verify supplied email (Hunter) | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 | $0.0125 |

This is a fixed 17-call manifest; `selat skill run` executes every step on every
run (there are no tiers, menus, or stop conditions). The step table matches
`manifest.json` exactly. Live sum ≈ $0.534 (free probe 2026-10-04); sum of
per-step caps $0.7565. The top-level `maxAmount` ($0.06) is only a per-step
fallback, not a run budget.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`). Verify prints `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** Apollo, Hunter, Clado, Brave, and Diffbot KG via Locus (`*.mpp.paywithlocus.com`). Orthogonal Company Enrich and Scrape Creators via `mpp.orthogonal.com`. Verify prints `routed-mpp`.

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`, 2026-10-04): people-enrichment /
org-enrichment / org-search / job-postings `$0.0399` (Locus `$0.038` flat;
people-enrichment rises to `$0.318` only with `reveal_phone_number`),
people-search `$0.00525`. All endpoints are **POST with a JSON body**.
`job-postings` takes the supplied `organizationId`; the runner cannot pass an
earlier step's id into it.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person cross-check | `/apollo/people-enrichment` | `email`, `first_name`, `last_name`, `organization_name`, `domain`, `linkedin_url`; `reveal_personal_emails: false`, `reveal_phone_number: false` |
| Company search by name | `/apollo/org-search` | `q_organization_name` (string), `per_page` (fixed `5`), `page` (fixed `1`) |
| Company tech + headcount | `/apollo/org-enrichment` | `domain` (string) |
| Job openings | `/apollo/job-postings` | `organization_id` (string, required), `per_page` (fixed `10`), `page` (fixed `1`) |
| Five-result person search | `/apollo/people-search` | `q_keywords` = `${firstName} ${lastName}`, `q_organization_domains_list` = `["${domain}"]`, `per_page` (fixed `5`), `page` (fixed `1`) |

```json
{ "q_keywords": "Patrick Collison", "q_organization_domains_list": ["stripe.com"], "per_page": 5, "page": 1 }
```

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`, 2026-10-04): email-enrichment /
company-enrichment / email-finder `$0.01365`, combined-enrichment `$0.02415`,
email-verifier `$0.0084`. All endpoints are **POST with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person by supplied email | `/hunter/email-enrichment` | `email` (string, required) |
| Person + company by email | `/hunter/combined-enrichment` | `email` (string, required) |
| Company cross-check | `/hunter/company-enrichment` | `domain` (string, required) |
| Find target work email | `/hunter/email-finder` | `domain`, `first_name`, `last_name` |
| Verify supplied email | `/hunter/email-verifier` | `email` (string, required) — the supplied email, not the finder output |

```json
{ "domain": "stripe.com", "first_name": "Patrick", "last_name": "Collison" }
```

## Scrape Creators LinkedIn — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/scrapecreators`

Live-probed price: `$0.021` (`routed-mpp`, 2026-10-04) for `/v1/linkedin/profile`.
**GET with a query-string `url`** (the CLI URL-encodes it). Synchronous; no job
id. Replaces dead Clado `/linkedin-profile`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Person by supplied LinkedIn URL | `/v1/linkedin/profile` | `url` (public person-profile URL) |

```text
https://mpp.orthogonal.com/scrapecreators/v1/linkedin/profile?url=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fpatrickcollison
```

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` (`routed-mpp`, 2026-10-04). **GET with a
query-string `domain`.** Replaces the dead Abstract Company Enrichment lookup.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Company profile by domain | `/companies/enrich` | `domain` (string, required) — bare host |

```text
https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com
```

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`, 2026-10-04). **GET with a
query-string `userName`** — an X username without `@`, not a full name.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| X/Twitter profile by handle | `/twitter/user/info` | `userName` = `${xHandle}` |

```text
https://catalog.selat.ai/twitter/user/info?userName=patrickc
```

## Brave Search — `MPP on Tempo`

serviceUrl: `https://brave.mpp.paywithlocus.com`

Live-probed price: `$0.03675` per call (`routed-mpp`, 2026-10-04). **POST with a
JSON body.**

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Recent company news | `/brave/news-search` | `q` = `${company} news`, `count` (fixed `10`), `freshness` (`pm`) |
| Recent funding news | `/brave/news-search` | `q` = `${company} funding round`, `count` (fixed `10`), `freshness` (`py`) |

```json
{ "q": "Stripe funding round", "count": 10, "freshness": "py" }
```

## Diffbot KG — `MPP on Tempo`

serviceUrl: `https://diffbot-kg.mpp.paywithlocus.com`

Live-probed price: `$0.03675` per call (`routed-mpp`, 2026-10-04; Locus lists
`$0.03`, `$0.12` with `refresh`). **POST with a JSON body.**

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Organization knowledge graph | `/diffbot-kg/enhance` | `type` (`Organization`), `name` (string array), `url` (string array), `refresh` (fixed `false`), `size` (fixed `1`) |

```json
{ "type": "Organization", "name": ["Stripe"], "url": ["https://stripe.com"], "refresh": false, "size": 1 }
```

## Clado contacts — `MPP on Tempo`

serviceUrl: `https://clado.mpp.paywithlocus.com`

Live-probed price: `$0.15015` (`routed-mpp`, 2026-10-04) with both enrichment
flags (`linkedin_url` only quotes `$0.04515`). **POST with a JSON body.**

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Contact email + phone reveal | `/clado/contacts` | `linkedin_url` (string, required), `email_enrichment: true`, `phone_enrichment: true` |

```json
{ "linkedin_url": "https://www.linkedin.com/in/patrickcollison", "email_enrichment": true, "phone_enrichment": true }
```

## Free verification

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/enrich-waterfall \
  --email <known-work-email> --firstName <first> --lastName <last> \
  --domain <bare-domain> --company "<company>" \
  --linkedinUrl <person-linkedin-url> \
  --organizationId <apollo-organization-id> --xHandle <x-username> \
  --live-probe
```
