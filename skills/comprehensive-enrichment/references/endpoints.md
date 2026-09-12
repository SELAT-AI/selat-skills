# Endpoints — comprehensive-enrichment

Use only these endpoint families for `comprehensive-enrichment`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Person deep search | POST | `https://clado.mpp.paywithlocus.com/clado/search` | MPP on Tempo | $0.31815 |
| 2 — Person enrichment | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 |
| 3 — Email enrich | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-enrichment` | MPP on Tempo | $0.01365 |
| 4 — Find work email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 |
| 5 — Verify email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 |
| 6 — Phone | POST | `https://clado.mpp.paywithlocus.com/clado/contacts` | MPP on Tempo | $0.04515 |
| 7 — Person research | POST | `https://exa.mpp.tempo.xyz/search` | MPP on Tempo | $0.00525 |
| 8 — Company overview | POST | `https://abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup` | MPP on Tempo | $0.0063 |
| 9 — Company emails | POST | `https://hunter.mpp.paywithlocus.com/hunter/domain-search` | MPP on Tempo | $0.01365 |
| 10 — Funding + investors | POST | `https://diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance` | MPP on Tempo | $0.03675 |
| 11 — Pricing / features | POST | `https://firecrawl.mpp.tempo.xyz/v1/extract` | MPP on Tempo | $0.00525 |
| 12 — Competitors | POST | `https://exa.mpp.tempo.xyz/findSimilar` | MPP on Tempo | $0.00525 |
| 13 — Company research | POST | `https://exa.mpp.tempo.xyz/search` | MPP on Tempo | $0.00525 |

This is a fixed 13-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Apollo, Hunter, Clado, Abstract Company Enrichment, and Diffbot KG via Locus (`*.mpp.paywithlocus.com`). Exa (`exa.mpp.tempo.xyz`) and Firecrawl (`firecrawl.mpp.tempo.xyz`) are MPP on Tempo but not Locus.

## Clado MPP — `MPP on Tempo`

serviceUrl: `https://clado.mpp.paywithlocus.com`

Last documented search price: `$0.31815` — today's live probe did not surface
a 402 (re-probe). Contacts live-probed `$0.04515` (`routed-mpp`). All
endpoints are **POST with a JSON body**. Clado search is synchronous — no
job polling. Phone lookup requires a LinkedIn URL.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person deep search | `/clado/search` | `query` (string, required) |
| Phone | `/clado/contacts` | `linkedin_url` (string, required) |

```json
{ "query": "John Doe Stripe" }
```

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

## Abstract Company Enrichment — `MPP on Tempo`

serviceUrl: `https://abstract-company-enrichment.mpp.paywithlocus.com`

Last documented price: `$0.0063` per call (`routed-mpp`). Today's live probe
did not surface a 402 — re-probe. All endpoints are **POST with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Company overview | `/abstract-company-enrichment/lookup` | `domain` (string, required) |

```json
{ "domain": "stripe.com" }
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
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Pricing / features | `/v1/extract` | `urls` (string array), `prompt` (string) |

```json
{ "urls": ["https://stripe.com/pricing"], "prompt": "Extract all products, pricing tiers, and features" }
```
