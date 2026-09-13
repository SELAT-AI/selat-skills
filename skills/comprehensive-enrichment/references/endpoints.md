# Endpoints — comprehensive-enrichment

Use only these endpoint families for `comprehensive-enrichment`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

Dead Clado `/clado/search` was removed (no 402). Company overview now uses
Orthogonal Company Enrich GET-by-domain. Clado `/clado/contacts` is kept.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Person enrichment | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 |
| 2 — Email enrich | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-enrichment` | MPP on Tempo | $0.01365 |
| 3 — Find work email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 |
| 4 — Verify email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 |
| 5 — Phone | POST | `https://clado.mpp.paywithlocus.com/clado/contacts` | MPP on Tempo | $0.04515 |
| 6 — Person research | POST | `https://exa.mpp.tempo.xyz/search` | MPP on Tempo | $0.00525 |
| 7 — Company overview | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 |
| 8 — Company emails | POST | `https://hunter.mpp.paywithlocus.com/hunter/domain-search` | MPP on Tempo | $0.01365 |
| 9 — Funding + investors | POST | `https://diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance` | MPP on Tempo | $0.03675 |
| 10 — Pricing / features | POST | `https://firecrawl.mpp.tempo.xyz/v1/extract` | MPP on Tempo | $0.00525 |
| 11 — Competitors | POST | `https://exa.mpp.tempo.xyz/findSimilar` | MPP on Tempo | $0.00525 |
| 12 — Company research | POST | `https://exa.mpp.tempo.xyz/search` | MPP on Tempo | $0.00525 |

This is a fixed 12-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Apollo, Hunter, Clado, and Diffbot KG via Locus (`*.mpp.paywithlocus.com`). Exa (`exa.mpp.tempo.xyz`) and Firecrawl (`firecrawl.mpp.tempo.xyz`) are MPP on Tempo but not Locus. Orthogonal Company Enrich via `mpp.orthogonal.com`.

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.0399` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person enrichment | `/apollo/people-enrichment` | `first_name`, `last_name`, `organization_name`, `linkedin_url` |

```json
{ "first_name": "John", "last_name": "Doe", "organization_name": "Stripe", "linkedin_url": "https://linkedin.com/in/williamhgates" }
```

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): email-enrichment / email-finder /
domain-search `$0.01365`, email-verifier `$0.0084`. All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Email enrich | `/hunter/email-enrichment` | `email` (string, required) |
| Find work email | `/hunter/email-finder` | `domain`, `first_name`, `last_name` |
| Verify email | `/hunter/email-verifier` | `email` (string, required) |
| Company emails | `/hunter/domain-search` | `domain` (string, required) |

```json
{ "domain": "stripe.com", "first_name": "John", "last_name": "Doe" }
```

## Clado contacts — `MPP on Tempo`

serviceUrl: `https://clado.mpp.paywithlocus.com`

Live-probed price: `$0.04515` (`routed-mpp`, re-probed 2026-09-12). All
endpoints are **POST with a JSON body**. Phone lookup requires a LinkedIn URL.
Dead Clado `/search`, `/linkedin-profile`, and `/scrape` are not used.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Phone | `/clado/contacts` | `linkedin_url` (string, required) |

```json
{ "linkedin_url": "https://linkedin.com/in/williamhgates" }
```

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` (`routed-mpp`, 2026-09-12). Domain lookup is
**GET with a query-string `domain`**. Replaces the dead Abstract Company
Enrichment `POST /abstract-company-enrichment/lookup`. Per-step cap `$0.02`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Company overview | `/companies/enrich` | `domain` (string, required) — bare host, no protocol or path |

```text
https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com
```

## Exa MPP — `MPP on Tempo`

serviceUrl: `https://exa.mpp.tempo.xyz`

Live-probed price: `$0.00525` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person research | `/search` | `query` (string, required) |
| Competitors | `/findSimilar` | `url` (string), `numResults` (integer), `contents.text` (boolean) |
| Company research | `/search` | `query` (string, required) |

```json
{ "query": "Stripe recent news funding announcements partnerships press releases" }
```

## Diffbot KG — `MPP on Tempo`

serviceUrl: `https://diffbot-kg.mpp.paywithlocus.com`

Live-probed price: `$0.03675` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. One Organization `enhance` call covers funding rounds and
investors.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Funding + investors | `/diffbot-kg/enhance` | `type` (string, `Organization`), `name` (string, required) |

```json
{ "type": "Organization", "name": "Stripe" }
```

## Firecrawl — `MPP on Tempo`

serviceUrl: `https://firecrawl.mpp.tempo.xyz`

Live-probed price: `$0.00525` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. Needs a real public `pricingUrl`.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Pricing / features | `/v1/extract` | `urls` (string array), `prompt` (string) |

```json
{ "urls": ["https://stripe.com/pricing"], "prompt": "Extract all products, pricing tiers, and features" }
```
