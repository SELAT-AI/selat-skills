# Endpoints — gtm-enrichment-deep

This skill is a fixed three-call, read-only GTM enrichment cross-check. Free
live verification on **2026-08-30** observed three `routed-mpp` calls. All three
execute during `selat skill run`; none is a conditional fallback.

## Endpoint matrix

| # | Purpose | Method and endpoint | Request data | Live quote | Per-step cap |
|---|---|---|---|---:|---:|
| 1 | Professional person identity | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | `email`, `domain`, personal-email/phone revelation fixed `false` | $0.039900 | $0.05 |
| 2 | Company firmographics | `POST hunter.mpp.paywithlocus.com/hunter/company-enrichment` | `domain` | $0.013650 | $0.02 |
| 3 | Funding and revenue cross-check | `POST apollo.mpp.paywithlocus.com/apollo/org-enrichment` | `domain` | $0.039900 | $0.05 |

Expected fixed-run total at the recorded quotes: **$0.093450**. The independent
per-step caps sum to **$0.12**. Re-probe before payment; prices and modes can
change.

## Live schema and interpretation notes

### Apollo people enrichment

- Public OpenAPI accepts any combination of `first_name`, `last_name`, `email`,
  `linkedin_url`, `organization_name`, `domain`, and Apollo person `id`.
- This recipe uses only the known work `email` and matching `domain`.
- `reveal_personal_emails` and `reveal_phone_number` are explicitly `false`.
  The workflow does not need private contact data to produce a GTM brief.
- Returned professional identity fields can still be absent or stale. Preserve
  the provider and confidence for every claimed field.

### Hunter company enrichment

- Public OpenAPI requires a company `domain`.
- Its documented result covers description, industry, employee count, location,
  technology, and social profiles.
- Funding is not part of the documented endpoint contract. Do not attribute a
  funding field to Hunter unless the live response actually supplies it.

### Apollo organization enrichment

- Public OpenAPI accepts `domain`, `organization_name`, or Apollo organization
  `id`; this recipe uses the same required `domain` as the Hunter call.
- Its documented result covers industry, employee count, funding, revenue, and
  technology stack.
- This is always the third cross-check. The SELAT manifest schema and runner do
  not support result-dependent skipping.

## Input and privacy gate

- `email` and `domain` are both required because the manifest runner does not
  derive one parameter from another.
- Lowercase both and require the email suffix to equal the domain.
- Stop on Gmail, Yahoo, Outlook, or another consumer free-mail domain.
- Use only for a user-stated legitimate B2B purpose. Do not infer sensitive
  traits, expose personal contact data, or execute outreach.

## Free live probe

This command reads payment challenges and does not sign or settle:

```bash
selat skill verify ./skills/gtm-enrichment-deep \
  --email "research@example.com" \
  --domain example.com \
  --live-probe
```

Equivalent single-endpoint probes:

```bash
selat-pay POST \
  "https://apollo.mpp.paywithlocus.com/apollo/people-enrichment" \
  --body '{"email":"research@example.com","domain":"example.com","reveal_personal_emails":false,"reveal_phone_number":false}' \
  --chain base --max-amount 0.05 --probe-only --live-probe

selat-pay POST \
  "https://hunter.mpp.paywithlocus.com/hunter/company-enrichment" \
  --body '{"domain":"example.com"}' \
  --chain base --max-amount 0.02 --probe-only --live-probe

selat-pay POST \
  "https://apollo.mpp.paywithlocus.com/apollo/org-enrichment" \
  --body '{"domain":"example.com"}' \
  --chain base --max-amount 0.05 --probe-only --live-probe
```

`--chain base` is the settlement-chain argument required by `selat-pay`. It
does not turn a probe into a payment. A paid application error may still charge,
so inspect history before retrying.

Public schemas inspected on 2026-08-30:

- `https://apollo.mpp.paywithlocus.com/openapi.json`
- `https://hunter.mpp.paywithlocus.com/openapi.json`

Provider names and trademarks belong to their respective owners and are used
only for endpoint identification.
