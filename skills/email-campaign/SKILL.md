---
name: email-campaign
description: Use this skill when the user wants to build a verified cold-email or outreach list — e.g. "build an email campaign", "find and verify emails for a domain", "find someone's work email", "verify these emails before I send", "enrich a lead for personalized outreach", "get company brand context for outreach". Runs a 7-step pipeline across MPP merchants (Fiber company search, Hunter domain/email lookup + verification, Fiber bounce check, Sixtyfour lead enrichment, Brand.dev company context), all routed through the SELAT Router.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Every step is a routed MPP payment, so a reachable SELAT Router (SELAT_ROUTER_URL) is required for the run.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# email-campaign

## When To Use

Use when the user wants to assemble a targeted, verified outreach list end-to-end: discover target companies, pull emails for a domain, find a specific person's email, verify deliverability, enrich the lead for personalization, and pull company brand context. Every step is paid per-call through MPP merchants and routed via the SELAT Router — no API keys to manage.

## Workflow

1. Install: `selat skill install email-campaign`
2. Run: `selat skill run email-campaign --domain stripe.com --email john@stripe.com [--industry SaaS] [--firstName John] [--lastName Doe] [--company Stripe]`
3. The CLI compiles each step into a `selat-pay` call (one routed MPP payment per step), runs them in order, and prints a per-step status + summary.

Steps (in order):

- **Step 1 — Fiber** `POST /v1/company-search` — find target companies by industry and headcount.
- **Step 2 — Hunter** `POST /hunter/domain-search` — all emails found for the target domain.
- **Step 3 — Hunter** `POST /hunter/email-finder` — a specific person's email at that domain.
- **Step 4 — Hunter** `POST /hunter/email-verifier` — deliverability check for a single email.
- **Step 5 — Fiber** `POST /v1/validate-email/single` — bounce-risk check (handles catch-all domains).
- **Step 6 — Sixtyfour** `POST /enrich-lead` — enrich the lead with contact + company details for personalization.
- **Step 7 — Brand.dev** `GET /v1/brand/retrieve` — logos, colors, industry, and description for the company.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `industry` | no | `SaaS` | Industry filter for the Fiber company-search step |
| `domain` | yes | `stripe.com` | Target domain for Hunter domain-search, email-finder, and Brand.dev retrieve |
| `firstName` | no | `John` | First name for Hunter email-finder and Sixtyfour enrichment |
| `lastName` | no | `Doe` | Last name for Hunter email-finder and Sixtyfour enrichment |
| `company` | no | `Stripe` | Company name for the Sixtyfour enrich-lead step |
| `email` | yes | `john@stripe.com` | Email to verify (Hunter) and validate (Fiber) |

Outputs: Hunter returns email lists / verification status; Fiber returns matching companies and a bounce verdict; Sixtyfour returns enriched lead fields; Brand.dev returns brand assets and metadata.

## Gotchas

- All seven steps are **routed** MPP payments — the run needs `SELAT_ROUTER_URL` configured and the router reachable; there is no direct rail in this skill.
- The MPP-routed Hunter endpoints are **POST** with a JSON body (`{domain}`, `{email}`, `{domain,first_name,last_name}`) — not the GET/query form from the upstream Hunter docs.
- Per-step caps: $0.02 + $0.013 + $0.013 + $0.008 + $0.02 + $0.10 + $0.03; a full run caps at **$0.21** (`maxAmount`).
- The Sixtyfour `enrich-lead` step is the most expensive ($0.10) — drop it if you only need verified emails, not enrichment.
- Steps run independently: a later step can succeed even if an earlier one fails; always read the per-step summary.
- Brand.dev passes `domain` as a query string; the other merchants take JSON bodies.

## Validation

Probe each endpoint for a free 402 challenge (no payment sent) with `--probe-only`:

- `selat-pay POST "https://api.fiber.ai/v1/company-search" --body '{"searchParams":{"industries":["SaaS"],"employee_count_min":50,"employee_count_max":500}}' --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/domain-search" --body '{"domain":"stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/email-finder" --body '{"domain":"stripe.com","first_name":"John","last_name":"Doe"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/email-verifier" --body '{"email":"john@stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://api.fiber.ai/v1/validate-email/single" --body '{"email":"john@stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://api.sixtyfour.ai/enrich-lead" --body '{"lead_info":{"first_name":"John","last_name":"Doe","company":"Stripe"},"struct":{"email":"Work email","phone":"Phone number"}}' --chain base --probe-only`
- `selat-pay GET "https://api.brand.dev/v1/brand/retrieve?domain=stripe.com" --chain base --probe-only`

A probe returns the merchant's 402 payment requirements without charging. A successful paid run prints `status=200` and a ✓ for each step.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoints, methods, and prices this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
