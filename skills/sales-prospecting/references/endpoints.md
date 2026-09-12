# sales-prospecting — endpoints

The repaired skill is a fixed five-read bundle. Every call is read-only, routed
through the SELAT Router over MPP on Tempo, and independently compiled from the
same nine user-supplied inputs. Nothing is chained from one response into the
next request.

Free live probes on 2026-08-30 confirmed all five payment challenges within the
tightened caps:

| Step | Purpose | Endpoint | Fixed request controls | Live routed quote | Per-call cap |
|---:|---|---|---|---:|---:|
| 1 | ICP company candidates | `POST apollo.mpp.paywithlocus.com/apollo/org-search` | one keyword string, one location, one employee range, `per_page=10`, `page=1` | $0.005250 | $0.008 |
| 2 | Professional candidates at a known company | `POST apollo.mpp.paywithlocus.com/apollo/people-search` | one title, location, domain, and seniority; `per_page=10`, `page=1` | $0.005250 | $0.008 |
| 3 | Known-professional cross-check | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | first name, last name, domain; personal-email and phone revelation fixed `false` | $0.039900 | $0.050 |
| 4 | Supplied work-email verification | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | one `workEmail` | $0.008400 | $0.012 |
| 5 | Known-company firmographics | `POST hunter.mpp.paywithlocus.com/hunter/company-enrichment` | one `companyDomain` | $0.013650 | $0.020 |

Current expected total: **$0.072450**. Absolute cumulative cap: **$0.098**.
The live quote is authoritative; prices and availability can change.

## Why the old recipe was replaced

The previous SKILL and evals claimed a six-step pipeline containing two Fiber
searches, while its manifest contained only four different calls and no Fiber
steps. Direct free requests to the documented Fiber operations currently require
Fiber's own API key and credit system; they do not expose SELAT-payable 402/MPP
challenges. They therefore cannot be part of a keyless SELAT recipe.

The old manifest also had two additional blockers:

- its domain search and email-finder endpoints currently show captured-payment
  delivery cautions, with the observed network sample returning 0% 2xx and the
  last captured responses reported as 502;
- its company-enrichment endpoint no longer returns a payment challenge.

The repaired bundle uses live-payable search and enrichment operations whose
current network signal reports successful 2xx delivery. Some search and company
samples remain small, so treat those signals as limited evidence rather than a
guarantee.

## Request schemas

### 1. Organization search

The public OpenAPI documents `q_keywords`, `organization_locations`,
`organization_num_employees_ranges`, `per_page`, and `page`. The skill fixes
the first page to ten results. `employeeRange` must use the documented
`lower,upper` string form.

### 2. People search

The public OpenAPI documents arrays for `person_titles`, `person_locations`,
`q_organization_domains`, and `person_seniorities`. The skill uses one value in
each array and fixes the first page to ten results. Supported seniorities are:
`founder`, `c_suite`, `partner`, `vp`, `head`, `director`, `manager`, `senior`,
`entry`, and `intern`.

This operation returns professional profile data but does not promise contact
details. Do not claim otherwise.

### 3. People enrichment

The request uses `first_name`, `last_name`, and `domain`. It fixes
`reveal_personal_emails=false` and `reveal_phone_number=false`; agents must not
override those literals. Report only professional fields actually returned.

### 4. Email verifier

The verifier receives exactly the user-supplied `workEmail`. It does not receive
or automatically verify any value returned by the people-enrichment response.
If the two sources disagree, report the conflict and stop rather than paying for
another call.

### 5. Company enrichment

The operation accepts one company domain and may return industry, description,
employee count, location, technology, and public social profiles. Do not promise
a field the paid response does not contain.

## Scope and payment safety

- All nine parameters are required and have no defaults.
- Before payment, validate domain/email coherence, `employeeRange`, and the
  seniority enum. A free 402 probe establishes price and reachability before the
  upstream validates the application body.
- Every run executes all five independent calls. A partial intent should use a
  narrower reviewed skill or free discovery instead.
- A paid application error may still charge. Never auto-retry; inspect history,
  re-probe, and obtain a new approval first.
- The free probe verifies the payment layer only. It does not prove paid output
  quality or guarantee delivery.

## Free verification

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/sales-prospecting \
  --companyKeywords "B2B SaaS" \
  --location "San Francisco" \
  --employeeRange "51,200" \
  --jobTitle "VP Sales" \
  --seniority "vp" \
  --companyDomain "example.com" \
  --firstName "Research" \
  --lastName "Lead" \
  --workEmail "research@example.com" \
  --live-probe
```

Expected gate: five reachable `routed-mpp` challenges at or below their
manifest caps, with no payment signed or settled.
