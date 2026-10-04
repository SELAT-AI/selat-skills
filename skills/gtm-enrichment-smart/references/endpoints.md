# Endpoints — gtm-enrichment-smart

Use only these endpoint families for `gtm-enrichment-smart`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Person and company core | POST | `https://hunter.mpp.paywithlocus.com/hunter/combined-enrichment` | MPP on Tempo | $0.02415 | $0.035 |
| 2 — Work-email deliverability | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 | $0.0125 |
| 3 — Independent company profile | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 | $0.02 |

This is a fixed 3-call, read-only manifest. The step table matches
`manifest.json` exactly. `selat skill run` executes all three steps every time;
none is conditional or skippable.

Live-probed 2026-10-04 (free, `--probe-only --live-probe`): expected total
**$0.045412** per run (one run = one lead). Per-step caps are $0.035 / $0.0125 /
$0.02 (sum **$0.0675**). The manifest's top-level `maxAmount` (`$0.035`) is only
a per-step fallback for a step without its own cap — it is not a full-run cap.
Arm a session budget for the cumulative limit.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Hunter via Locus (`hunter.mpp.paywithlocus.com`) and Orthogonal Company Enrich (`mpp.orthogonal.com`). Verify prints `routed-mpp` for all three steps.

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`, 2026-10-04): combined-enrichment `$0.02415`
(cap `$0.035`), email-verifier `$0.0084` (cap `$0.0125`). All endpoints are
**POST with a JSON body**.

- `combined-enrichment` returns person and company data for the address. Use
  returned names, titles, locations, and public profiles as evidence, not as
  guaranteed current facts. The recipe does not request personal-email or
  phone revelation.
- `email-verifier` documents MX/SMTP checks plus a confidence score.
  Deliverability is a technical observation — not proof of identity, employer
  relationship, recipient interest, or consent to outreach.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person and company core | `/hunter/combined-enrichment` | `email` (string, required) |
| Work-email deliverability | `/hunter/email-verifier` | `email` (string, required) |

```json
{ "email": "jane.doe@acme.com" }
```

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` per call (`routed-mpp`, 2026-10-04). **GET with a
query-string `domain`.** Per-step cap `$0.02`. Returns company name, domain,
industry, employee count, revenue, location, funding, technology, and social
links; 404 when the domain is unknown, which is a coverage gap, not proof the
company does not exist. Replaces the dead Abstract Company Enrichment route.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Independent company profile | `/companies/enrich` | `domain` (string, required) — bare host, no protocol or path |

```text
https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=acme.com
```

## Input and privacy gate

- `email` and `domain` are both required; the runner does not derive one
  parameter from another.
- Lowercase both and require the email suffix to equal the domain.
- Stop on Gmail, Yahoo, Outlook, or another consumer free-mail domain.
- Use only for a user-stated legitimate B2B purpose. Do not infer sensitive
  traits, expose personal contact data, or execute outreach.

## Removed calls

- **Abstract Company Enrichment:** the host no longer returns a payment challenge; replaced by Orthogonal Company Enrich.
- **Apollo people enrichment and organization enrichment:** removed from the cost-conscious core; combined enrichment and the company profile already cover person, funding, and revenue. Use `gtm-enrichment-deep` for the extra cross-check.
- **Hunter email and company "fallback" calls:** removed because the runner cannot gate a step on earlier results; they always charged.
- **Twitter social proof:** removed because the runner cannot derive a handle from an earlier response, and the old default (`elonmusk`) queried an unrelated account.
- **Job postings / buying signals:** not a manifest step (no `organizationId` param) because the runner cannot pass an organization ID from an earlier call. Treat hiring signals as a separately quoted follow-up.

## Free live probes

These commands read payment challenges and never sign or settle:

```bash
selat skill verify ./skills/gtm-enrichment-smart \
  --email "jane.doe@acme.com" \
  --domain acme.com \
  --live-probe

selat-pay POST \
  "https://hunter.mpp.paywithlocus.com/hunter/combined-enrichment" \
  --body '{"email":"jane.doe@acme.com"}' \
  --chain base --max-amount 0.035 --probe-only --live-probe

selat-pay POST \
  "https://hunter.mpp.paywithlocus.com/hunter/email-verifier" \
  --body '{"email":"jane.doe@acme.com"}' \
  --chain base --max-amount 0.0125 --probe-only --live-probe

selat-pay GET \
  "https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=acme.com" \
  --chain base --max-amount 0.02 --probe-only --live-probe
```

`--chain base` above is only selat-pay's required flag; a probe never settles
and the CLI resolves the funded Gateway chain for paid runs. A paid application
error may still charge, so inspect history before retrying.

Public schemas: `https://hunter.mpp.paywithlocus.com/openapi.json`,
`https://mpp.orthogonal.com/company-enrich/openapi.json`.

Provider names and trademarks belong to their respective owners and are used
only for endpoint identification.
