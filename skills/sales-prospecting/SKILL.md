---
name: sales-prospecting
description: Use this skill when the user wants to build a B2B prospect or lead list with verified contact info — e.g. "build a prospect list", "find decision makers at these companies", "get verified emails for this domain", "find the CTO's email and verify it", "sales prospecting", "lead enrichment for outreach". Runs a routed MPP pipeline — company search (Fiber), people search (Fiber), domain email lookup (Hunter), specific-contact email (Sixtyfour), email verification (Fiber), and company enrichment (Brand.dev), all paid through the SELAT Router.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay, and a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Every step is a routed MPP call, so a reachable SELAT Router (SELAT_ROUTER_URL) is required for the whole run.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# sales-prospecting

## When To Use

Use when the user wants to assemble a targeted prospect list for outbound sales: define an ICP, find companies and decision-makers, collect and verify emails, and enrich with company context for personalization. Every step is a **routed MPP** call settled through the SELAT Router — there is no direct rail and no API keys to manage; payment is per-call in USDC on Base.

## Workflow

1. Install: `selat skill install sales-prospecting`
2. Run: `selat skill run sales-prospecting --domain stripe.com [--companyQuery "..."] [--jobTitles "CTO,VP Engineering"] [--companyNames "Stripe,Figma"] [--locations "San Francisco"] [--firstName Sarah --lastName Chen] [--email sarah@stripe.com]`
3. The CLI compiles each manifest step into a `selat-pay` call, routes it through the SELAT Router as an MPP payment, runs the steps in order, and prints a per-step ✓/✗ summary.

Steps (in order):

- **Step 1 — Fiber** `POST /v1/natural-language-search/companies` — find companies matching the ICP (`${companyQuery}`).
- **Step 2 — Fiber** `POST /v1/people-search` — find decision-makers by `${jobTitles}` at `${companyNames}` in `${locations}`.
- **Step 3 — Hunter** `POST /hunter/domain-search` — list all emails at `${domain}`.
- **Step 4 — Sixtyfour** `POST /find-email` — find the email for a specific `${firstName} ${lastName}` at `${domain}`.
- **Step 5 — Fiber** `POST /v1/validate-email/single` — verify `${email}` deliverability before outreach.
- **Step 6 — Brand.dev** `GET /v1/brand/retrieve?domain=${domain}` — enrich with logos, colors, industry, and description for personalization.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `companyQuery` | no | `B2B SaaS startups in San Francisco with 50-200 employees Series A or B funded` | Free-form ICP text for the Fiber company search |
| `jobTitles` | no | `CTO,VP Engineering,Head of Engineering` | Comma-separated decision-maker titles |
| `companyNames` | no | `Stripe,Figma,Notion` | Comma-separated company names for the people search |
| `locations` | no | `San Francisco` | Comma-separated locations for the people search |
| `domain` | **yes** | `stripe.com` | Domain used by the Hunter, Sixtyfour, and Brand.dev steps |
| `firstName` | no | `Sarah` | First name for the Sixtyfour email lookup |
| `lastName` | no | `Chen` | Last name for the Sixtyfour email lookup |
| `email` | no | `sarah@stripe.com` | Email to verify via Fiber |

Outputs: Fiber returns matching companies / people lists and an email-validation verdict; Hunter returns the emails found at the domain; Sixtyfour returns the best-match email for the named lead; Brand.dev returns brand/company enrichment for the domain.

## Gotchas

- **All steps are routed MPP.** The whole run needs `SELAT_ROUTER_URL` configured and the router reachable — there is no direct fallback.
- **Per-step caps:** Fiber company search $0.04, Fiber people search $0.04, Hunter domain search $0.023, Sixtyfour find-email $0.10, Fiber email validation $0.02, Brand.dev retrieve $0.03 — a full run costs up to ≈ $0.253 (top-level `maxAmount` cap $0.26).
- **Hunter is POST, not GET.** The grounded MPP endpoint is `POST hunter.io/hunter/domain-search` with the domain in the JSON body — not a `?domain=` query.
- **`${jobTitles}`, `${companyNames}`, `${locations}` are comma-joined strings** substituted into single-element arrays; pass one value each for the cleanest results, or adjust the manifest if you need multi-value arrays.
- **Steps run independently** (continue-across-steps): the people search can succeed while find-email fails for a missing person — check the per-step summary.
- Verify every email (Step 5) before adding contacts to a sequence; target titles relevant to your product (Step 2).

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Run free 402 probes (no payment) before a real run:

- `selat-pay POST "https://api.fiber.ai/v1/natural-language-search/companies" --body '{"query":"B2B SaaS startups in San Francisco"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/domain-search" --body '{"domain":"stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://api.sixtyfour.ai/find-email" --body '{"lead":{"first_name":"Sarah","last_name":"Chen","domain":"stripe.com"}}' --chain base --probe-only`
- `selat-pay POST "https://api.fiber.ai/v1/validate-email/single" --body '{"email":"sarah@stripe.com"}' --chain base --probe-only`
- `selat-pay GET "https://api.brand.dev/v1/brand/retrieve?domain=stripe.com" --chain base --probe-only`

A successful run prints `status=200` for each reachable step and a ✓ summary. A `--probe-only` call returns the 402 payment requirements without spending.

## References

- `manifest.json` — the machine-readable, MPP-routed payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the grounded MPP endpoints (merchant, method, path, price, source) this skill calls.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Third-party APIs (Fiber AI, Hunter, Sixtyfour, Brand.dev) are the property of their respective owners and are accessed under their terms via the SELAT Router MPP rail.
