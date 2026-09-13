# Endpoints — sales-prospecting

Use only these endpoint families for `sales-prospecting`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — All emails for domain | POST | `https://hunter.mpp.paywithlocus.com/hunter/domain-search` | MPP on Tempo | $0.01365 |
| 2 — Find specific contact email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 |
| 3 — Verify email deliverability | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 |
| 4 — Enrich with company data | POST | `https://abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup` | MPP on Tempo | $0.0063 |

This is a fixed 4-call manifest. The step table matches `manifest.json` exactly.
SKILL.md still describes Fiber company-search and people-search steps; those
calls are **not in the default manifest**.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Hunter and Abstract Company Enrichment via Locus (`*.mpp.paywithlocus.com`).

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): domain-search / email-finder `$0.01365`,
email-verifier `$0.0084`. All endpoints are **POST with a JSON
body** — never query-string params.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| All emails for domain | `/hunter/domain-search` | `domain` (string, required) |
| Find specific contact email | `/hunter/email-finder` | `domain`, `first_name`, `last_name` |
| Verify email deliverability | `/hunter/email-verifier` | `email` (string, required) |

```json
{ "domain": "stripe.com", "first_name": "Sarah", "last_name": "Chen" }
```

## Abstract Company Enrichment — `MPP on Tempo`

serviceUrl: `https://abstract-company-enrichment.mpp.paywithlocus.com`

Last documented price: `$0.0063` per call (`routed-mpp`). Today's live probe
did not surface a 402 — re-probe. All endpoints are **POST with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Enrich with company data | `/abstract-company-enrichment/lookup` | `domain` (string, required) |

```json
{ "domain": "stripe.com" }
```

## Fiber — not in the default manifest

SKILL.md still documents Fiber company-search and people-search steps. They
are **not manifest steps**. Do not treat them as part of the fixed 4-call run.
Price: re-probe.

| Capability | Endpoint | Body or Query params |
| --- | --- | --- |
| Company search (SKILL.md only) | `POST https://api.fiber.ai/v1/natural-language-search/companies` | `query` (ICP text) — re-probe for the live body schema |
| People search (SKILL.md only) | `POST https://api.fiber.ai/v1/people-search` | job titles / company names / locations — re-probe |
