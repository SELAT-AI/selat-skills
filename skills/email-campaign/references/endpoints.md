# Endpoints — email-campaign

Use only these endpoint families for `email-campaign`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Discover 10 companies by industry and size | POST | `https://mpp.orthogonal.com/fiber/v1/company-search` | MPP on Tempo | $0.21 | $0.30 |
| 2 — Emails by domain | POST | `https://hunter.mpp.paywithlocus.com/hunter/domain-search` | MPP on Tempo | $0.01365 | $0.02 |
| 3 — Find target work email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 | $0.02 |
| 4 — Verify supplied work email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 | $0.012 |
| 5 — Enrich target lead | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 | $0.06 |
| 6 — Company context | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 | $0.02 |

This is a fixed 6-call manifest. The step table matches `manifest.json` exactly.
`selat skill run` always executes all six calls; there is no step selector and
no inter-step dataflow. Live sum ≈ **$0.298** (free probes, 2026-10-04, every
step `routed-mpp`); sum of per-step caps $0.432. The top-level `maxAmount`
(`$0.30`) is only a per-step fallback, not a run cap.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Hunter and Apollo via Locus (`*.mpp.paywithlocus.com`). Fiber and Company Enrich via `mpp.orthogonal.com`.

## Fiber company search — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/fiber`

Live-probed price: `$0.21` (`routed-mpp`, 2026-10-04) for `pageSize: 10`.
Fiber prices company search **dynamically by result count** — an omitted page
size quoted `$0.525` — so the manifest pins `pageSize` to 10. Per-step cap
`$0.30`.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Discover companies | `/v1/company-search` | `searchParams.industriesV2.anyOf` (array of Fiber industry values), `searchParams.employeeCountV2` (`lowerBoundExclusive`, `upperBoundInclusive`), `pageSize` (number) |

```json
{
  "searchParams": {
    "industriesV2": { "anyOf": ["Software"] },
    "employeeCountV2": { "lowerBoundExclusive": 50, "upperBoundInclusive": 500 }
  },
  "pageSize": 10
}
```

The older `industries` and `employee_count_min/max` fields are not the current
schema. The first response includes `billing.requestId`; a continuation page
must pass it as top-level `parentRequestId` with unchanged filters. Pagination
is outside this manifest. Schema: https://docs.fiber.ai/build/sdks.

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`, 2026-10-04): domain-search / email-finder
`$0.01365`, email-verifier `$0.0084`. All endpoints are **POST with a JSON
body** — never query-string params, and never the `hunter.io/hunter/...` host.

The verifier runs **once**. Its verdict already covers deliverability, bounce
risk, and catch-all status; it checks the user-supplied `email`, not the
email-finder output (the runner does not chain steps).

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Emails by domain | `/hunter/domain-search` | `domain` (string, required) |
| Find target work email | `/hunter/email-finder` | `domain`, `first_name`, `last_name` |
| Verify supplied work email | `/hunter/email-verifier` | `email` (string, required) |

```json
{ "domain": "stripe.com", "first_name": "John", "last_name": "Doe" }
```

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.0399` per call (`routed-mpp`, 2026-10-04). All endpoints
are **POST with a JSON body**. Per-step cap `$0.06`.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Enrich target lead | `/apollo/people-enrichment` | `first_name`, `last_name`, `organization_name` |

```json
{ "first_name": "John", "last_name": "Doe", "organization_name": "Stripe" }
```

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` (`routed-mpp`, 2026-10-04). Domain lookup is
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

## Behavioral limits

- The skill prepares research and verification data only. It does not draft,
  schedule, or send email.
- Technical deliverability does not establish consent or legal permission to
  contact a recipient.
