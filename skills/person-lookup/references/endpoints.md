# Endpoints — person-lookup

Use only this endpoint family for `person-lookup`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

The previous Clado `POST /clado/search` route no longer serves a 402 (re-checked
2026-10-04). Apollo `people-search` is the live replacement: keyword search with
a numeric page size, free-probed 2026-10-04.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Five-result public professional search | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-search` | MPP on Tempo | $0.00525 | $0.0075 |

This is a fixed 1-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402). Live probe mode: `routed-mpp`.
- **MPP on Tempo:** Apollo via Locus (`apollo.mpp.paywithlocus.com`).

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.00525` per call (`routed-mpp`, 2026-10-04; Locus lists a
flat `$0.005` before the router fee, independent of result count). The endpoint
is **POST with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Public professional search | `/apollo/people-search` | `q_keywords` (string) = `${name} ${company}`; `per_page` (number, fixed `5`); `page` (number, fixed `1`) |

Body pattern:

```json
{ "q_keywords": "Jensen Huang NVIDIA", "per_page": 5, "page": 1 }
```

- `per_page` and `page` are fixed numeric literals because `${param}`
  substitution produces strings. Provider default is 25 per page (max 100).
- The route filters employers only by `q_organization_domains_list` or
  `organization_ids`; there is no company-name filter, so the company name is a
  keyword. Check each returned employer before calling a candidate a match.
- The gateway OpenAPI publishes no detailed response schema. Report only fields
  the live response actually returns.
- This recipe does not call Apollo `people-enrichment` (`reveal_*` flags) or any
  contact endpoint, and must not advertise private email or phone retrieval.
- A paid application error may still charge. Check payment history and obtain a
  fresh quote and approval before retrying.

Do not call Clado `/clado/search` (dead — no 402). Do not substitute StableEnrich
`contacts-enrich` ($0.21). Company Enrich `/people/search` is live but filters on
company name/domain, not a person name.

## Free verification

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/person-lookup \
  --name "Jensen Huang" \
  --company "NVIDIA" \
  --live-probe
```

Expected gate: one reachable `routed-mpp` challenge at or below the `$0.0075`
step cap. Re-probe immediately before payment.
