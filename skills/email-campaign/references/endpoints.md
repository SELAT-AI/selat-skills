# email-campaign — endpoints

This skill is a fixed, read-only six-call campaign-preparation pipeline. The
table records the free routed quotes observed on 2026-08-29. A live probe may
invoke the declared method/body but never settles payment. Re-probe before every
paid run because prices and availability can change.

| # | Merchant | Endpoint | Request input | Live routed quote | Per-step cap |
|---:|---|---|---|---:|---:|
| 1 | Fiber | `POST mpp.orthogonal.com/fiber/v1/company-search` | `searchParams.industriesV2.anyOf=[industry]`, `employeeCountV2=(50,500]`, `pageSize=10` | $0.210000 | $0.25 |
| 2 | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/domain-search` | `domain` | $0.108150 | $0.15 |
| 3 | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | `domain`, `first_name`, `last_name` | $0.013650 | $0.02 |
| 4 | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | supplied `email` | $0.008400 | $0.015 |
| 5 | Apollo | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | `first_name`, `last_name`, `organization_name` | $0.039900 | $0.05 |
| 6 | Company Enrich | `GET mpp.orthogonal.com/company-enrich/companies/enrich?domain=…` | `domain` query parameter | $0.012862 | $0.02 |

- **Observed expected total:** $0.392962.
- **Sum of per-step caps:** $0.505. This is a worst-case manifest ceiling only;
  the separately approved session budget is the cumulative tripwire.
- All six probes reported `routed-mpp` and were within cap after correction.

## Request notes

### Fiber company search

The current official Fiber schema uses:

```json
{
  "searchParams": {
    "industriesV2": {
      "anyOf": ["Software"]
    },
    "employeeCountV2": {
      "lowerBoundExclusive": 50,
      "upperBoundInclusive": 500
    }
  },
  "pageSize": 10
}
```

The previous documented body used `industries` and
`employee_count_min/max`; those fields do not appear in the current payment
challenge schema. Fiber prices company search dynamically by result count: the
correct ten-result request quoted $0.21, while an omitted page size quoted
$0.525. Official schema example: https://docs.fiber.ai/build/sdks.

The first Fiber response includes `billing.requestId`. A continuation page must
pass that value as top-level `parentRequestId` and keep non-pagination filters
unchanged. Pagination is outside this manifest and requires separate review.

### Hunter calls

- All Hunter steps use the MPP host and POST JSON bodies, not the stale
  `hunter.io/hunter/...` validation URLs.
- The verifier is intentionally present once. Its response already covers
  deliverability, bounce risk, and catch-all status; a second identical paid
  request is not an independent check.
- The verifier evaluates the supplied `email`. The runner does not feed the
  preceding email-finder output into it.

### Company context replacement

The previous Abstract Company Enrichment endpoint remained listed in discovery
but returned no live x402/MPP challenge during free verification. Company Enrich
replaced it after a free probe confirmed a required `domain` query parameter,
`routed-mpp`, and a live routed quote within the new cap.

## Behavioral limits

- `selat skill run` executes all six calls and has no step selector.
- The six calls are independent; results do not automatically flow into later
  request bodies.
- The skill prepares research and verification data only. It does not draft,
  schedule, or send email.
- Technical deliverability does not establish consent or legal permission to
  contact a recipient.
