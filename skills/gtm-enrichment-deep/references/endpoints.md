# Endpoints — gtm-enrichment-deep

Use only these endpoint families for `gtm-enrichment-deep`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Professional person identity | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 | $0.06 |
| 2 — Company firmographics | POST | `https://hunter.mpp.paywithlocus.com/hunter/company-enrichment` | MPP on Tempo | $0.01365 | $0.02 |
| 3 — Funding and revenue cross-check | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | MPP on Tempo | $0.0399 | $0.06 |

This is a fixed 3-call, read-only manifest. The step table matches
`manifest.json` exactly. `selat skill run` executes all three steps every time;
none is a conditional fallback.

Live-probed 2026-10-04 (free, `--probe-only --live-probe`): expected total
**$0.09345** per run, which is the cost per lead (one run = one lead). Per-step
caps are $0.06 / $0.02 / $0.06 (sum **$0.14**). The manifest's top-level
`maxAmount` (`$0.06`) is only a per-step fallback for a step without its own
cap — it is not a full-run cap. Arm a session budget for the cumulative limit.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Apollo and Hunter via Locus (`*.mpp.paywithlocus.com`). Verify prints `routed-mpp` for all three steps.

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.0399` per call (`routed-mpp`, 2026-10-04). All endpoints
are **POST with a JSON body**. Per-step cap `$0.06` each.

- `people-enrichment` accepts any combination of `first_name`, `last_name`,
  `email`, `linkedin_url`, `organization_name`, `domain`, and Apollo person
  `id`; this recipe sends only the known work `email` and matching `domain`.
  `reveal_personal_emails` and `reveal_phone_number` are fixed `false`.
- `org-enrichment` accepts `domain`, `organization_name`, or Apollo
  organization `id`; this recipe sends the same `domain`. Its result covers
  industry, employee count, funding, revenue, and technology stack.
- Returned fields can be absent or stale. Preserve the provider and confidence
  for every claimed field. Neither Apollo nor Hunter returns an AI/B2B-SaaS
  classification; infer it from description/keywords and mark it low
  confidence.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Professional person identity | `/apollo/people-enrichment` | `email` (string, required), `domain` (string, required), `reveal_personal_emails` (fixed `false`), `reveal_phone_number` (fixed `false`) |
| Funding and revenue cross-check | `/apollo/org-enrichment` | `domain` (string, required) |

```json
{ "email": "jane.doe@acme.com", "domain": "acme.com", "reveal_personal_emails": false, "reveal_phone_number": false }
```

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed price: `$0.01365` per call (`routed-mpp`, 2026-10-04). **POST with a
JSON body.** Per-step cap `$0.02`. The documented result covers description,
industry, employee count, location, technology, and social profiles. Funding
is not part of the documented contract — do not attribute a funding field to
Hunter unless the live response actually supplies it.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Company firmographics | `/hunter/company-enrichment` | `domain` (string, required) |

```json
{ "domain": "acme.com" }
```

## Input and privacy gate

- `email` and `domain` are both required; the runner does not derive one
  parameter from another.
- Lowercase both and require the email suffix to equal the domain.
- Stop on Gmail, Yahoo, Outlook, or another consumer free-mail domain.
- Use only for a user-stated legitimate B2B purpose. Do not infer sensitive
  traits, expose personal contact data, or execute outreach.

## Free live probes

These commands read payment challenges and never sign or settle:

```bash
selat skill verify ./skills/gtm-enrichment-deep \
  --email "jane.doe@acme.com" \
  --domain acme.com \
  --live-probe

selat-pay POST \
  "https://apollo.mpp.paywithlocus.com/apollo/people-enrichment" \
  --body '{"email":"jane.doe@acme.com","domain":"acme.com","reveal_personal_emails":false,"reveal_phone_number":false}' \
  --chain base --max-amount 0.06 --probe-only --live-probe

selat-pay POST \
  "https://hunter.mpp.paywithlocus.com/hunter/company-enrichment" \
  --body '{"domain":"acme.com"}' \
  --chain base --max-amount 0.02 --probe-only --live-probe

selat-pay POST \
  "https://apollo.mpp.paywithlocus.com/apollo/org-enrichment" \
  --body '{"domain":"acme.com"}' \
  --chain base --max-amount 0.06 --probe-only --live-probe
```

`--chain base` above is only selat-pay's required flag; a probe never settles
and the CLI resolves the funded Gateway chain for paid runs. A paid application
error may still charge, so inspect history before retrying.

Public schemas: `https://apollo.mpp.paywithlocus.com/openapi.json`,
`https://hunter.mpp.paywithlocus.com/openapi.json`.

Provider names and trademarks belong to their respective owners and are used
only for endpoint identification.
