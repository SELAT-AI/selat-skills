---
name: email-campaign
description: Use this skill when the user wants to build a verified cold-email or outreach list — e.g. "build an email campaign", "find and verify emails for a domain", "find someone's work email", "verify these emails before I send", "enrich a lead for personalized outreach", "get company brand context for outreach". Runs a 7-step pipeline across MPP merchants (Fiber company search, Hunter domain/email lookup + verification + bounce check, Apollo lead enrichment, Abstract Company Enrichment company context), all routed through the SELAT Router.
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
- **Step 5 — Hunter** `POST /hunter/email-verifier` — second-pass bounce-risk check (Hunter's verdict covers catch-all domains; drop this step if one verification is enough).
- **Step 6 — Apollo** `POST /apollo/people-enrichment` — enrich the lead with contact + company details for personalization.
- **Step 7 — Abstract Company Enrichment** `POST /abstract-company-enrichment/lookup` — industry, description, size, and location for the company (no logo/color brand assets).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `industry` | no | `SaaS` | Industry filter for the Fiber company-search step |
| `domain` | yes | `stripe.com` | Target domain for Hunter domain-search, email-finder, and the Abstract Company Enrichment lookup |
| `firstName` | no | `John` | First name for Hunter email-finder and Apollo people-enrichment |
| `lastName` | no | `Doe` | Last name for Hunter email-finder and Apollo people-enrichment |
| `company` | no | `Stripe` | Company name (sent as `organization_name`) for the Apollo people-enrichment step |
| `email` | yes | `john@stripe.com` | Email to verify and bounce-check (both Hunter email-verifier) |

Outputs: Hunter returns email lists / verification verdicts (deliverability + bounce/catch-all); Fiber returns matching companies; Apollo returns enriched lead fields; Abstract Company Enrichment returns company firmographics (industry, description, size, location — not logos/colors).

## Gotchas

- All seven steps are **routed** MPP payments — the run needs `SELAT_ROUTER_URL` configured and the router reachable; there is no direct rail in this skill.
- The MPP-routed Hunter endpoints are **POST** with a JSON body (`{domain}`, `{email}`, `{domain,first_name,last_name}`) — not the GET/query form from the upstream Hunter docs.
- Per-step live prices (probe-verified 2026-07-10): $0.10815 + $0.01365 + $0.0084 + $0.0084 + $0.0084 + $0.0063 ≈ **$0.1533** for a full manifest run; the per-step and top-level `maxAmount` of 5.00 USDC is a loose spending filter, not the price.
- Hunter `domain-search` is the most expensive step ($0.10815) — drop it if you already know your target person and only need find + verify + enrich.
- The bounce check (step 5) is a second pass through the same Hunter `email-verifier` endpoint as step 4 — Hunter's verdict already covers bounce risk and catch-all domains, so drop one of the two if a single verification is enough.
- Steps run independently: a later step can succeed even if an earlier one fails; always read the per-step summary.
- Every manifest step is POST with a JSON body — no query-string endpoints remain.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Probe each endpoint for a free 402 challenge (no payment sent) with `--probe-only`:

- `selat-pay POST "https://api.fiber.ai/v1/company-search" --body '{"searchParams":{"industries":["SaaS"],"employee_count_min":50,"employee_count_max":500}}' --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/domain-search" --body '{"domain":"stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/email-finder" --body '{"domain":"stripe.com","first_name":"John","last_name":"Doe"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/email-verifier" --body '{"email":"john@stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-verifier" --body '{"email":"john@stripe.com"}' --chain base --probe-only` (bounce check — same endpoint as the deliverability step)
- `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-enrichment" --body '{"first_name":"John","last_name":"Doe","organization_name":"Stripe"}' --chain base --probe-only`
- `selat-pay POST "https://abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup" --body '{"domain":"stripe.com"}' --chain base --probe-only`

A probe returns the merchant's 402 payment requirements without charging. A successful paid run prints `status=200` and a ✓ for each step.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoints, methods, and prices this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
