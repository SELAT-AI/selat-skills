---
name: sales-prospecting
description: Use this skill when the user wants to build a B2B prospect or lead list with verified contact info — e.g. "build a prospect list", "find decision makers at these companies", "get verified emails for this domain", "find the CTO's email and verify it", "sales prospecting", "lead enrichment for outreach". Runs a routed MPP pipeline — company search (Fiber), people search (Fiber), domain email lookup (Hunter), specific-contact email (Hunter email finder), email verification (Hunter email verifier), and company enrichment (Abstract Company Enrichment), all paid through the SELAT Router.
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
- **Step 4 — Hunter** `POST /hunter/email-finder` — find the email for a specific `${firstName} ${lastName}` at `${domain}`.
- **Step 5 — Hunter** `POST /hunter/email-verifier` — verify `${email}` deliverability before outreach.
- **Step 6 — Abstract Company Enrichment** `POST /abstract-company-enrichment/lookup` — enrich `${domain}` with company data (industry, size, description) for personalization.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `companyQuery` | no | `B2B SaaS startups in San Francisco with 50-200 employees Series A or B funded` | Free-form ICP text for the Fiber company search |
| `jobTitles` | no | `CTO,VP Engineering,Head of Engineering` | Comma-separated decision-maker titles |
| `companyNames` | no | `Stripe,Figma,Notion` | Comma-separated company names for the people search |
| `locations` | no | `San Francisco` | Comma-separated locations for the people search |
| `domain` | **yes** | `stripe.com` | Domain used by the Hunter domain-search, Hunter email-finder, and Abstract Company Enrichment steps |
| `firstName` | no | `Sarah` | First name for the Hunter email-finder lookup |
| `lastName` | no | `Chen` | Last name for the Hunter email-finder lookup |
| `email` | no | `sarah@stripe.com` | Email to verify via the Hunter email verifier |

Outputs: Fiber returns matching companies / people lists; Hunter returns the emails found at the domain, the best-match email for the named lead, and an email-deliverability verdict; Abstract Company Enrichment returns company enrichment for the domain.

## Gotchas

- **All steps are routed MPP.** The whole run needs `SELAT_ROUTER_URL` configured and the router reachable — there is no direct fallback.
- **Per-step caps are a loose $5.00 spending filter, not the live price.** Live prices (probe-verified 2026-07-10): Hunter domain search $0.10815, Hunter email finder $0.01365, Hunter email verifier $0.0084, Abstract Company Enrichment lookup $0.0063 — a full run of the manifest steps costs ≈ $0.1365 at today's router quotes.
- **Hunter is POST, not GET.** The grounded MPP endpoint is `POST hunter.mpp.paywithlocus.com/hunter/domain-search` with the domain in the JSON body — not a `?domain=` query. The same applies to the email-finder, email-verifier, and Abstract Company Enrichment steps: params go in the JSON body.
- **`${jobTitles}`, `${companyNames}`, `${locations}` are comma-joined strings** substituted into single-element arrays; pass one value each for the cleanest results, or adjust the manifest if you need multi-value arrays.
- **Steps run independently** (continue-across-steps): the people search can succeed while the email finder fails for a missing person — check the per-step summary.
- Verify every email (Step 5) before adding contacts to a sequence; target titles relevant to your product (Step 2).

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Run free 402 probes (no payment) before a real run:

- `selat-pay POST "https://api.fiber.ai/v1/natural-language-search/companies" --body '{"query":"B2B SaaS startups in San Francisco"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/domain-search" --body '{"domain":"stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-finder" --body '{"domain":"stripe.com","first_name":"Sarah","last_name":"Chen"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-verifier" --body '{"email":"sarah@stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup" --body '{"domain":"stripe.com"}' --chain base --probe-only`

A successful run prints `status=200` for each reachable step and a ✓ summary. A `--probe-only` call returns the 402 payment requirements without spending.

## References

- `manifest.json` — the machine-readable, MPP-routed payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the grounded MPP endpoints (merchant, method, path, price, source) this skill calls.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Third-party APIs (Fiber AI, Hunter, Abstract Company Enrichment) are the property of their respective owners and are accessed under their terms via the SELAT Router MPP rail.
