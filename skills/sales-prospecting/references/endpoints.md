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
| 4 — Enrich with company data | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 |

This is a fixed 4-call manifest. The step table matches `manifest.json` exactly.
SKILL.md still describes Fiber company-search and people-search steps; those
calls are **not in the default manifest**.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Hunter via Locus (`hunter.mpp.paywithlocus.com`). Orthogonal Company Enrich via `mpp.orthogonal.com`.

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

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` (`routed-mpp`, 2026-09-12). Domain lookup is
**GET with a query-string `domain`**. Replaces the dead Abstract Company
Enrichment `POST /abstract-company-enrichment/lookup`. Per-step cap `$0.02`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Enrich with company data | `/companies/enrich` | `domain` (string, required) — bare host, no protocol or path |

```text
https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com
```

## Fiber — not in the default manifest

SKILL.md still documents Fiber company-search and people-search steps. They
are **not manifest steps**. Do not treat them as part of the fixed 4-call run.
Price: re-probe.

| Capability | Endpoint | Body or Query params |
| --- | --- | --- |
| Company search (SKILL.md only) | `POST https://api.fiber.ai/v1/natural-language-search/companies` | `query` (ICP text) — re-probe for the live body schema |
| People search (SKILL.md only) | `POST https://api.fiber.ai/v1/people-search` | job titles / company names / locations — re-probe |
