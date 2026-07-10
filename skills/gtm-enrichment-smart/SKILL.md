---
name: gtm-enrichment-smart
description: Use this skill when the user wants to enrich a sales lead or GTM prospect from an email address — e.g. "enrich this lead", "who is jane@acme.com", "look up this prospect", "GTM enrichment", "find the person and company behind this email", "qualify this lead with buying signals". Runs a cost-efficient multi-provider waterfall (Apollo, Hunter, and Abstract Company Enrichment via Locus, plus AIsa Twitter) mostly routed via the SELAT Router (MPP), with one direct Circle x402 step, to return person + company data, funding, AI/B2B classification, and buying signals with confidence scoring.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Steps 1-7 are routed MPP, so a reachable SELAT Router (SELAT_ROUTER_URL) is required for them; the AIsa Twitter step is direct (Circle x402, Gateway-batched) and does not need the router.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
  kind: multi
---

# gtm-enrichment-smart

## When To Use

Use when the user hands you a lead's email (optionally a name/domain) and wants enriched person + company intelligence: title, LinkedIn, location, email deliverability, company description, funding, AI/B2B classification, and buying signals. The skill spends proportionally to lead quality — cheap primary calls first, conditional gap-fills only when earlier results leave gaps. Steps 1-7 are **routed MPP** payments through the SELAT Router; the final Twitter social-proof step is a **direct** Circle x402 call to AIsa (Circle Gateway-batched).

## Workflow

1. Install: `selat skill install gtm-enrichment-smart`
2. Run: `selat skill run gtm-enrichment-smart --email jane@acme.com [--domain acme.com] [--organizationId <apollo_org_id>] [--twitterHandle acmehq]`
3. The CLI compiles each manifest step into a `selat-pay` call (capped at its per-step `maxAmount`), runs them in order, and prints a per-step ✓/✗ summary.

Waterfall order (the manifest runs them sequentially; later steps are conditional and should be gated by the caller on earlier results). Prices are live router quotes, probe-verified 2026-07-10:

- **Step 1 — Apollo (via Locus)** `POST /apollo/people-enrichment` ($0.0084) — primary person + embedded company/funding. Capture `organization.id` for the job-postings step. This is also the person fallback: the old separate AI person-fallback step mapped to this same endpoint with the same params, so the two were merged into this single step.
- **Step 2 — Hunter (via Locus)** `POST /hunter/combined-enrichment` ($0.02415) — combined person+company cross-reference from the email.
- **Step 3 — Hunter (via Locus)** `POST /hunter/email-verifier` ($0.0084) — email deliverability (valid/risky/undeliverable).
- **Step 4 — Abstract Company Enrichment (via Locus)** `POST /abstract-company-enrichment/lookup` ($0.0063) — company description, industry/SIC, and firmographics. Skip for free-email domains.
- **Step 5 — Apollo (via Locus)** `POST /apollo/org-enrichment` ($0.0084) — funding/headcount gap-fill, only if step 1 returned no funding.
- **Step 6 — Hunter (via Locus)** `POST /hunter/email-enrichment` ($0.01365) — person tie-breaker, only if Apollo and Hunter disagree on name/title.
- **Step 7 — Hunter (via Locus)** `POST /hunter/company-enrichment` ($0.01365) — company fallback, only if major gaps remain and the company has >500 employees.
- **Step 8 — AIsa (direct)** `GET /apis/v2/twitter/user/info?userName=…` ($0.00044) — follower social proof, only if a Twitter handle was found. Direct Circle x402 rail; no router needed.
- **Optional caller-invoked signal (not a manifest step) — Apollo (via Locus)** `POST /apollo/job-postings` body `{"organization_id":"${organizationId}"}` ($0.00525) — hiring signals. The `organization_id` comes from the step-1 people-enrichment (or an org-search) result; only invoke it once an org id was captured.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | yes | — | Lead email; drives people-enrichment, combined-enrichment, email-verifier, email-enrichment |
| `domain` | no | — | Company domain from the email; drives Abstract lookup, Apollo org-enrichment, Hunter company-enrichment |
| `organizationId` | no | — | Apollo org id from step 1; required for the job-postings step |
| `twitterHandle` | no | — | Twitter/X handle from enrichment data; required for the AIsa Twitter step (sent as `userName`) |

Outputs: a merged JSON object with `person` (name, title, linkedin_url, location, email_verified, confidence, source), `company` (name, domain, description, funding, classification.is_ai / is_b2b_saas, buying_signals), and `meta` (per-call status, cost, phases run). Cross-reference Apollo + Hunter + Abstract for confidence (high = 2+ sources agree).

## Gotchas

- **Mixed rail**: steps 1-7 are routed MPP and need `SELAT_ROUTER_URL` set and the router reachable; the AIsa Twitter step (step 8) is direct Circle x402 (Gateway-batched) and works without the router.
- The old separate expensive AI person-fallback step was **merged into step 1**: its replacement resolved to the same Apollo `people-enrichment` endpoint with the same params, so a separate fallback call would just repeat step 1. If step 1 finds no person, the Hunter steps (2 and 6) are the remaining person sources.
- The product/pricing buying-signal call (formerly Brand.dev `ai/products`) has **no equivalent** among the replacement merchants and was removed from the workflow — a capability gap, not an oversight.
- The source skill's free GitHub-stars step is **dropped**: GitHub's public API is not a payable merchant, so it cannot be expressed as an inert payment step.
- Live prices sum to ≈ $0.083 for all 8 manifest steps (worst case); a typical waterfall (steps 1-4 + the org gap-fill) costs ≈ $0.056. Per-step `maxAmount` values are loose $5.00 spending filters, not price estimates.
- Steps run independently: gate the conditional steps (5-8 and job-postings) on prior results so you do not pay for gap-fill or buying-signal calls on unqualified leads.
- The Abstract Company Enrichment lookup should be skipped for free-email providers (gmail/yahoo/outlook/etc.) to save $0.0063.
- All calls in this waterfall are synchronous — no async polling.
- The job-postings call takes `organization_id` in the **body** (no path substitution); if it is empty the merchant returns an error — only invoke it once step 1 yields an org id.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Probe each endpoint for free (402 challenge, no payment) before a paid run:

- `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-enrichment" --body '{"email":"jane@acme.com","reveal_personal_emails":true}' --chain base --probe-only`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/combined-enrichment" --body '{"email":"jane@acme.com"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-verifier" --body '{"email":"jane@acme.com"}' --chain base --probe-only`
- `selat-pay POST "https://abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup" --body '{"domain":"acme.com"}' --chain base --probe-only`
- `selat-pay GET "https://api.aisa.one/apis/v2/twitter/user/info?userName=elonmusk" --chain base --probe-only`

A successful run prints `status=200` for each executed step and a ✓ summary; gated/skipped steps appear as skipped in the run summary.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — merchant / method+path / price / rail table for every step.
- selat-pay — https://github.com/SELAT-AI/selat-pay
