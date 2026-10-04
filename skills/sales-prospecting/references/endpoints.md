# Endpoints — sales-prospecting

Use only these endpoint families for `sales-prospecting`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Bounded ICP company search | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-search` | MPP on Tempo | $0.0399 | $0.050 |
| 2 — Bounded professionals at known company | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-search` | MPP on Tempo | $0.00525 | $0.008 |
| 3 — Privacy-limited known-professional enrichment | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 | $0.050 |
| 4 — Supplied work-email deliverability check | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 | $0.012 |
| 5 — Known-company firmographics | POST | `https://hunter.mpp.paywithlocus.com/hunter/company-enrichment` | MPP on Tempo | $0.01365 | $0.020 |

This is a fixed 5-call manifest. The step table matches `manifest.json` exactly;
`selat skill run` always executes all five steps, and no step consumes another
step's output.

- **Live-probed 2026-10-04** (`selat-pay --probe-only --live-probe`, free, never
  signs): every step returned a 402, mode `routed-mpp`, within its step cap.
  Org search now quotes $0.0399 (it quoted $0.00525 on 2026-08-30); its cap was
  raised from $0.008 to $0.050 accordingly.
- **Expected fixed-run total:** $0.1071. **Sum of step caps:** $0.140.
- **Top-level `maxAmount` ($0.050)** is only the per-step fallback for a step that
  omits its own cap. It is not a full-run cap; arm a separately approved
  `selat budget` for the cumulative run.
- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Apollo and Hunter via Locus (`*.mpp.paywithlocus.com`).

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): org-search / people-enrichment `$0.0399`,
people-search `$0.00525`. All endpoints are **POST with a JSON body**.

| Step | Endpoint | Body params |
| --- | --- | --- |
| 1 — company search | `/apollo/org-search` | `q_keywords` ← `${companyKeywords}`; `organization_locations` ← `["${location}"]`; `organization_num_employees_ranges` ← `["${employeeRange}"]` (`lower,upper` string); `per_page` fixed `10`; `page` fixed `1` |
| 2 — people search | `/apollo/people-search` | `person_titles` ← `["${jobTitle}"]`; `person_locations` ← `["${location}"]`; `q_organization_domains` ← `["${companyDomain}"]`; `person_seniorities` ← `["${seniority}"]`; `per_page` fixed `10`; `page` fixed `1` |
| 3 — people enrichment | `/apollo/people-enrichment` | `first_name` ← `${firstName}`; `last_name` ← `${lastName}`; `domain` ← `${companyDomain}`; `reveal_personal_emails` fixed `false`; `reveal_phone_number` fixed `false` |

```json
{ "q_keywords": "B2B SaaS", "organization_locations": ["Austin"], "organization_num_employees_ranges": ["51,200"], "per_page": 10, "page": 1 }
```

- Org search validates the body before it challenges: a body with only
  `q_keywords` returns no 402. The manifest always sends location and employee
  range, so it quotes normally.
- Supported `person_seniorities`: `founder`, `c_suite`, `partner`, `vp`, `head`,
  `director`, `manager`, `senior`, `entry`, `intern`. Validate enum and range
  format before paying; a free probe checks price, not the application body.
- People search returns professional profile data and does not promise contact
  details. Agents must not override the two `reveal_*` literals.

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): email-verifier `$0.0084`, company-enrichment
`$0.01365`. All endpoints are **POST with a JSON body**.

| Step | Endpoint | Body params |
| --- | --- | --- |
| 4 — verify email | `/hunter/email-verifier` | `email` (string, required) ← `${workEmail}` |
| 5 — enrich company | `/hunter/company-enrichment` | `domain` (string, required) ← `${companyDomain}` |

```json
{ "email": "dana.whitfield@acmecorp.com" }
```

The verifier receives exactly the user-supplied `workEmail`; it never verifies a
value returned by step 3. If the two disagree, report the conflict rather than
paying for another call.

The 2026-10-04 probe's transactability reading for `/hunter/company-enrichment`
showed 1 of 4 captured network payments answered 2xx (last status 200). The
sample is small, but a free probe proves payability, not delivery.

## Why Fiber, Abstract, and Hunter domain-search are gone

The previous recipe documented two Fiber searches that were never in the
manifest; Fiber's own API requires its key and credits and serves no
SELAT-payable 402, so it cannot be part of a keyless recipe. The Abstract
company-enrichment host no longer returns a payment challenge (main replaced it
with Orthogonal Company Enrich in #113); this skill uses Hunter company
enrichment instead. Hunter domain-search and email-finder were dropped after
captured-payment readings showed 0% 2xx delivery.

## Free verification

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/sales-prospecting \
  --companyKeywords "B2B SaaS" \
  --location "Austin" \
  --employeeRange "51,200" \
  --jobTitle "VP Sales" \
  --seniority "vp" \
  --companyDomain "acmecorp.com" \
  --firstName "Dana" \
  --lastName "Whitfield" \
  --workEmail "dana.whitfield@acmecorp.com" \
  --live-probe
```

Single-step probe (the `--chain base` token is only selat-pay's required flag;
a probe never settles and the router quotes every Gateway chain identically):

```bash
selat-pay POST https://apollo.mpp.paywithlocus.com/apollo/org-search \
  --chain base --max-amount 0.050 --probe-only --live-probe \
  --body '{"q_keywords":"B2B SaaS","organization_locations":["Austin"],"organization_num_employees_ranges":["51,200"],"per_page":10,"page":1}'
```

A free probe proves the payment layer only, not paid output quality. A paid
application error may still charge; never auto-retry.
