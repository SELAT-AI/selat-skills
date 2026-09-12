# lead-enrichment — endpoints

The table records the fixed manifest order and the free routed quotes observed
on 2026-08-30. The five-step `selat skill verify --live-probe` passed with every
endpoint reachable and within its repaired cap. A probe sends the declared
method and body to read the payment challenge but never signs or settles.

All calls are read-only MPP services reached through the SELAT Router. A
per-step cap is a ceiling, not a price and not a cumulative session budget.

| # | Purpose | Method and endpoint | Required request data | Live routed quote | Per-step cap |
|---:|---|---|---|---:|---:|
| 1 | Derive a work-email candidate | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | `domain`, `first_name`, `last_name` | $0.013650 | $0.020 |
| 2 | Verify the supplied work email | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | `email` | $0.008400 | $0.015 |
| 3 | Cross-check professional identity | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | `email`, `first_name`, `last_name`, `organization_name`, `domain`, `linkedin_url`; both reveal flags fixed `false` | $0.039900 | $0.050 |
| 4 | Explicitly enrich a business phone | `POST clado.mpp.paywithlocus.com/clado/contacts` | `linkedin_url`, `email`, `email_enrichment=false`, `phone_enrichment=true` | $0.108150 | $0.150 |
| 5 | Retrieve employer firmographics | `POST hunter.mpp.paywithlocus.com/hunter/company-enrichment` | `domain` | $0.013650 | $0.020 |

- **Observed expected fixed-run total:** $0.183750.
- **Sum of per-step caps:** $0.255. This is the worst-case manifest exposure;
  arm a separately approved cumulative session budget no higher than this sum.
- Re-probe immediately before payment. The current challenge is authoritative
  if it differs from these recorded values.

## Request-schema mapping

The public gateway OpenAPI documents the following shapes. Every `${param}` in
the manifest substitutes as a string; the boolean flags below are fixed JSON
literals rather than caller-controlled string parameters.

| Step | Gateway field | Type | Source |
|---:|---|---|---|
| 1 | `domain` | string | `${domain}` |
| 1 | `first_name` | string | `${firstName}` |
| 1 | `last_name` | string | `${lastName}` |
| 2 | `email` | string, required by OpenAPI | `${email}` |
| 3 | `email` | string | `${email}` |
| 3 | `first_name` | string | `${firstName}` |
| 3 | `last_name` | string | `${lastName}` |
| 3 | `organization_name` | string | `${company}` |
| 3 | `domain` | string | `${domain}` |
| 3 | `linkedin_url` | string | `${linkedinUrl}` |
| 3 | `reveal_personal_emails` | boolean | fixed `false` |
| 3 | `reveal_phone_number` | boolean | fixed `false` |
| 4 | `linkedin_url` | string | `${linkedinUrl}` |
| 4 | `email` | string | `${email}` |
| 4 | `email_enrichment` | boolean | fixed `false` |
| 4 | `phone_enrichment` | boolean | fixed `true` |
| 5 | `domain` | string, required by OpenAPI | `${domain}` |

Although the gateway schemas under-declare some fields as optional, the skill
requires every identity input so providers receive one internally consistent
target and every fixed paid call has enough information to be useful.

## Dataflow and privacy semantics

- The runner executes all five manifest steps independently. It cannot pass
  step 1's email candidate into step 2. Step 2 therefore verifies the caller's
  required `email`; compare it with the finder result during synthesis.
- There are no sample defaults. Validate that the normalized email suffix equals
  `domain` and that the name, company, and LinkedIn URL refer to the same person
  before probing or paying.
- Apollo's optional personal-email and phone reveal flags are explicitly false.
- Clado pricing is request-dependent. On 2026-08-30, LinkedIn-only quoted
  $0.045150, explicit phone-only enrichment quoted $0.108150, and combined email
  plus phone enrichment quoted $0.150150. This skill selects phone-only
  enrichment because Hunter already covers work email and the advertised task
  requires an actual phone request.
- Returned email or phone data is not consent to contact someone. Keep it within
  the requester-approved legitimate business purpose; the skill sends nothing.

## Free verification

Use synthetic, coherent inputs to inspect current challenges without payment:

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/lead-enrichment \
  --firstName "Research" \
  --lastName "Lead" \
  --company "Example" \
  --domain example.com \
  --email "research@example.com" \
  --linkedinUrl "https://www.linkedin.com/in/example-research-lead" \
  --live-probe
```

Missing-input checks must fail before any network probe. A free probe proves
payability and price, not response quality. The first paid smoke test must use a
coherent requester-approved target, a fresh quote, explicit approval, and an
armed session budget. A paid application error can still charge, so never retry
automatically.
