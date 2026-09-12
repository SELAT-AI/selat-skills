# Endpoints — gtm-enrichment-smart

This skill is a fixed three-call, read-only B2B lead qualification core. Free
live verification on **2026-08-30** observed three `routed-mpp` calls. Every
step executes during `selat skill run`; none is a conditional fallback.

## Endpoint matrix

| # | Purpose | Method and endpoint | Required request data | Live quote | Per-step cap |
|---|---|---|---|---:|---:|
| 1 | Combined professional and company context | `POST hunter.mpp.paywithlocus.com/hunter/combined-enrichment` | JSON: `email` | $0.024150 | $0.03 |
| 2 | Work-email deliverability | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | JSON: `email` | $0.008400 | $0.015 |
| 3 | Independent company profile | `GET mpp.orthogonal.com/company-enrich/companies/enrich?domain=…` | Query: `domain` | $0.012862 | $0.02 |

Expected fixed-run total at the recorded quotes: **$0.045412**. The independent
per-step caps sum to **$0.065**. Re-probe before payment; prices and modes can
change.

## Live schema and interpretation notes

### Combined enrichment

- Public OpenAPI requires `email` and describes the response as both person and
  company data from that address.
- Use returned names, titles, locations, and public profiles as evidence, not as
  guaranteed current facts.
- The recipe does not ask for personal-email or phone revelation.

### Email verifier

- Public OpenAPI requires `email` and documents MX/SMTP checks plus a confidence
  score.
- Deliverability is a technical observation. It is not proof of identity,
  employer relationship, recipient interest, or consent to outreach.

### Company Enrich

- The domain variant is a GET request with `domain` in the query string.
- Public OpenAPI describes company name, domain, industry, employee count,
  revenue, location, funding, technology, and social links.
- A not-found result is evidence of a coverage gap, not proof that the company
  does not exist.

## Input and privacy gate

- `email` and `domain` are both required because the manifest runner does not
  derive one parameter from another.
- Lowercase both and require the email suffix to equal the domain.
- Stop on Gmail, Yahoo, Outlook, or another consumer free-mail domain.
- Use only for a user-stated legitimate B2B purpose. Do not infer sensitive
  traits, expose personal contact data, or execute outreach.

## Removed calls

- **Abstract Company Enrichment:** removed because the live host no longer
  returns a detectable x402 or MPP challenge.
- **Apollo people enrichment:** removed from the cost-conscious core because the
  combined-enrichment call already supplies person and company context. Use
  `gtm-enrichment-deep` when a second person source is worth the added spend.
- **Apollo organization enrichment:** removed from the smart core because the
  independent company profile already includes funding and revenue. Use the
  deep skill when an additional organization-level cross-check is required.
- **Hunter email and company fallback calls:** removed because the manifest
  runner cannot gate them on missing or conflicting fields; they always charged.
- **Twitter social proof:** removed because the runner cannot derive a handle
  from an earlier response, and the old default could query an unrelated account.
- **Job postings:** not a manifest step because the runner cannot receive an
  organization ID from an earlier call. Treat hiring signals as a separate
  quoted follow-up after a real ID is obtained.

## Free live probe

This command reads payment challenges and does not sign or settle:

```bash
selat skill verify ./skills/gtm-enrichment-smart \
  --email "research@example.com" \
  --domain example.com \
  --live-probe
```

Equivalent single-endpoint probes:

```bash
selat-pay POST \
  "https://hunter.mpp.paywithlocus.com/hunter/combined-enrichment" \
  --body '{"email":"research@example.com"}' \
  --chain base --max-amount 0.03 --probe-only --live-probe

selat-pay POST \
  "https://hunter.mpp.paywithlocus.com/hunter/email-verifier" \
  --body '{"email":"research@example.com"}' \
  --chain base --max-amount 0.015 --probe-only --live-probe

selat-pay GET \
  "https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=example.com" \
  --chain base --max-amount 0.02 --probe-only --live-probe
```

`--chain base` is the settlement-chain argument required by `selat-pay`. It
does not turn a probe into a payment. A paid application error may still charge,
so inspect history before retrying.

Public schemas inspected on 2026-08-30:

- `https://hunter.mpp.paywithlocus.com/openapi.json`
- `https://mpp.orthogonal.com/company-enrich/openapi.json`

Provider names and trademarks belong to their respective owners and are used
only for endpoint identification.
