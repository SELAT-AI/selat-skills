# Endpoints — email-campaign

Use only these endpoint families for `email-campaign`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Emails by domain | POST | `https://hunter.mpp.paywithlocus.com/hunter/domain-search` | MPP on Tempo | $0.01365 |
| 2 — Find person email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 |
| 3 — Verify deliverability | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 |
| 4 — Bounce check | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 |
| 5 — Enrich lead | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 |
| 6 — Company context | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 |

This is a fixed 6-call manifest. The step table matches `manifest.json` exactly.
SKILL.md still describes a Fiber company-search step; that call is **not in
the default manifest**.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Hunter and Apollo via Locus (`*.mpp.paywithlocus.com`). Orthogonal Company Enrich via `mpp.orthogonal.com`.

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): domain-search / email-finder `$0.01365`,
email-verifier `$0.0084`. All endpoints are **POST with a JSON
body** — never query-string params.

Steps 3 and 4 hit the same `email-verifier` endpoint. Hunter's verdict already
covers bounce risk and catch-all domains; drop one of the two if a single
verification is enough.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Emails by domain | `/hunter/domain-search` | `domain` (string, required) |
| Find person email | `/hunter/email-finder` | `domain`, `first_name`, `last_name` |
| Verify deliverability | `/hunter/email-verifier` | `email` (string, required) |
| Bounce check | `/hunter/email-verifier` | `email` (string, required) |

```json
{ "domain": "stripe.com", "first_name": "John", "last_name": "Doe" }
```

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.0399` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Enrich lead | `/apollo/people-enrichment` | `first_name`, `last_name`, `organization_name` |

```json
{ "first_name": "John", "last_name": "Doe", "organization_name": "Stripe" }
```

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` (`routed-mpp`, 2026-09-12). Domain lookup is
**GET with a query-string `domain`** — the POST variant does **not** accept
`domain` (it enriches by name or social URL). Replaces the dead Abstract
Company Enrichment `POST /abstract-company-enrichment/lookup`. Per-step cap
`$0.02`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Company context | `/companies/enrich` | `domain` (string, required) — bare host, no protocol or path |

```text
https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com
```

## Fiber — not in the default manifest

SKILL.md still documents a Fiber company-search step. It is **not a manifest
step**. Do not treat it as part of the fixed 6-call run. Price: re-probe.
