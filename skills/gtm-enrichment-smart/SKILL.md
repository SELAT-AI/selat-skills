---
name: gtm-enrichment-smart
description: Use this skill when the user wants to enrich a sales lead or GTM prospect from an email address — e.g. "enrich this lead", "who is jane@acme.com", "look up this prospect", "GTM enrichment", "find the person and company behind this email", "qualify this lead with buying signals". Runs a cost-efficient multi-provider waterfall (Apollo, Tomba, Brand.dev, Sixtyfour, Scrape Creators) fully routed via the SELAT Router (MPP) to return person + company data, funding, AI/B2B classification, and buying signals with confidence scoring.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet on Base. All steps are routed MPP, so a reachable SELAT Router (SELAT_ROUTER_URL) is required for every step.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# gtm-enrichment-smart

## When To Use

Use when the user hands you a lead's email (optionally a name/domain) and wants enriched person + company intelligence: title, LinkedIn, location, email deliverability, company description, funding, AI/B2B classification, and buying signals. The skill spends proportionally to lead quality — cheap routed APIs first, expensive AI agents only as fallback. Every call is a **routed MPP** payment through the SELAT Router; there is no direct rail in this skill.

## Workflow

1. Install: `selat skill install gtm-enrichment-smart`
2. Run: `selat skill run gtm-enrichment-smart --email jane@acme.com [--domain acme.com] [--organizationId <apollo_org_id>] [--twitterHandle acmehq]`
3. The CLI compiles each manifest step into a `selat-pay` MPP call (capped at its per-step `maxAmount`), runs them in order, and prints a per-step ✓/✗ summary.

Waterfall order (the manifest runs them sequentially; later steps are conditional and should be gated by the caller on earlier results):

- **Step 1 — Apollo** `POST /api/v1/people/match` — primary person + embedded company/funding. Capture `organization.id` for the job-postings step.
- **Step 2 — Tomba** `GET /v1/combined/find` — combined person+company cross-reference from the email.
- **Step 3 — Tomba** `GET /v1/email-verifier` — email deliverability (valid/risky/undeliverable).
- **Step 4 — Brand.dev** `GET /v1/brand/retrieve` — rich company description, industries, socials. Skip for free-email domains.
- **Step 5 — Apollo** `GET /api/v1/organizations/enrich` — funding/headcount gap-fill, only if step 1 returned no funding.
- **Step 6 — Tomba** `GET /v1/enrich` — person tie-breaker, only if Apollo and Tomba disagree on name/title.
- **Step 7 — Sixtyfour** `POST /enrich-lead` — expensive AI person fallback, only if no person found after steps 1-6.
- **Step 8 — Sixtyfour** `POST /enrich-company` — expensive AI company fallback, only if major gaps + >500 employees.
- **Step 9 — Brand.dev** `POST /v1/brand/ai/products` — product/pricing buying signals, qualified leads only (funded + B2B + >50 employees).
- **Step 10 — Apollo** `GET /api/v1/organizations/{organizationId}/job_postings` — hiring signals, only if `organizationId` captured.
- **Step 11 — Scrape Creators** `GET /v1/twitter/profile` — follower social proof, only if a Twitter handle was found.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | yes | — | Lead email; drives people-match, combined-find, email-verifier, tomba-enrich, sixtyfour-lead |
| `domain` | no | — | Company domain from the email; drives Brand.dev retrieve, Apollo org enrich, Brand.dev products, Sixtyfour company |
| `organizationId` | no | — | Apollo org id from step 1; required for the job-postings step |
| `twitterHandle` | no | — | Twitter/X handle from Brand.dev/Apollo data; required for the Scrape Creators step |

Outputs: a merged JSON object with `person` (name, title, linkedin_url, location, email_verified, confidence, source), `company` (name, domain, description, funding, classification.is_ai / is_b2b_saas, buying_signals), and `meta` (per-call status, cost, phases run). Cross-reference Apollo + Tomba + Brand.dev for confidence (high = 2+ sources agree).

## Gotchas

- Every step is **routed MPP** — all 11 calls need `SELAT_ROUTER_URL` set and the router reachable. There is no direct rail here.
- The source skill called Hunter `/v2/combined/find` and `/v2/email-verifier`; no Hunter merchant exists on the MPP rail, so those map to **Tomba** `/v1/combined/find` and `/v1/email-verifier` (same email→person+company / deliverability capability).
- The source skill's free GitHub-stars step is **dropped**: GitHub's public API is not an MPP merchant, so it cannot be expressed as an inert routed payment step.
- Per-step caps sum to $0.34; the top-level `maxAmount` is $0.35. A typical waterfall (steps 1-4 + a gap-fill) costs ≈ $0.06; worst case with both Sixtyfour fallbacks runs to ≈ $0.34.
- Steps run independently: gate the conditional steps (5-11) on prior results so you do not pay for Sixtyfour or buying-signal calls on unqualified leads.
- Brand.dev retrieve should be skipped for free-email providers (gmail/yahoo/outlook/etc.) to save $0.03.
- The job-postings URL needs `organizationId` substituted into the path; if it is empty the step will hit a malformed path — only run it once step 1 yields an org id.

## Validation

Probe each endpoint for free (402 challenge, no payment) before a paid run:

- `selat-pay POST "https://api.apollo.io/api/v1/people/match" --body '{"email":"jane@acme.com","reveal_personal_emails":true}' --chain base --probe-only`
- `selat-pay GET "https://api.tomba.io/v1/combined/find?email=jane@acme.com" --chain base --probe-only`
- `selat-pay GET "https://api.tomba.io/v1/email-verifier?email=jane@acme.com" --chain base --probe-only`
- `selat-pay GET "https://api.brand.dev/v1/brand/retrieve?domain=acme.com" --chain base --probe-only`
- `selat-pay POST "https://api.sixtyfour.ai/enrich-lead" --body '{"lead_info":{"email":"jane@acme.com","domain":"acme.com"}}' --chain base --probe-only`

A successful run prints `status=200` for each executed step and a ✓ summary; gated/skipped steps appear as skipped in the run summary.

## References

- `manifest.json` — the machine-readable routed-payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — merchant / method+path / price / source table for every step.
- selat-pay — https://github.com/SELAT-AI/selat-pay
