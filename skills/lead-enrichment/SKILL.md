---
name: lead-enrichment
description: Use this skill when the user wants to enrich a sales lead or contact across multiple data sources — e.g. "enrich this lead", "find and verify their work email", "get a phone number for this prospect", "enrich the company", "pull their LinkedIn profile", "complete contact data for John Doe at Stripe". Chains six routed MPP merchants (Hunter for email find/verify and company enrichment, Sixtyfour for lead + phone enrichment, Fiber for live LinkedIn) in a single run, all paid through the SELAT Router (routed MPP rail).
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet on Base. Every step is a routed MPP payment, so a reachable SELAT Router (SELAT_ROUTER_URL) is required for the whole run.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# lead-enrichment

## When To Use

Use when the user has a partial lead (name + company + domain, optionally a LinkedIn URL or known email) and wants complete contact data: a found-and-verified work email, lead-level enrichment, a phone number, company details, and a live LinkedIn profile. Every step is a **routed MPP** payment translated by the SELAT Router into an outbound tempo-native payment — there is no direct rail in this skill.

## Workflow

1. Install: `selat skill install lead-enrichment`
2. Run: `selat skill run lead-enrichment --firstName John --lastName Doe --company Stripe --domain stripe.com [--email john@stripe.com] [--linkedinUrl https://linkedin.com/in/johndoe]`
3. The CLI compiles each step into a `selat-pay` call (each a routed MPP payment via the SELAT Router), runs them in order, and prints a per-step status (status=200 / ✓ or ✗) summary.

Steps, in order:

- **Step 1 — Hunter** `POST /hunter/email-finder` — find the work email from domain + name.
- **Step 2 — Hunter** `POST /hunter/email-verifier` — verify the email is deliverable (pass `--email`, or the email from step 1).
- **Step 3 — Sixtyfour** `POST /enrich-lead` — lead-level enrichment (email, phone, social/company details).
- **Step 4 — Sixtyfour** `POST /find-phone` — discover a phone number for the lead.
- **Step 5 — Hunter** `POST /hunter/company-enrichment` — enrich the company from its domain.
- **Step 6 — Fiber** `POST /v1/linkedin-live-fetch/profile/single` — fetch a real-time LinkedIn profile.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `firstName` | yes | — | Lead first name (Hunter email-finder, Sixtyfour steps) |
| `lastName` | yes | — | Lead last name (Hunter email-finder, Sixtyfour steps) |
| `company` | yes | — | Company name (Sixtyfour enrich-lead / find-phone) |
| `domain` | yes | — | Company domain (Hunter email-finder + company-enrichment) |
| `email` | no | (from step 1) | Work email to verify in step 2 |
| `linkedinUrl` | no | empty | LinkedIn URL for Sixtyfour enrich-lead and the Fiber live fetch |

Outputs: Hunter returns email/verification/company JSON; Sixtyfour returns enriched lead fields and a phone number; Fiber returns an enriched LinkedIn profile object.

## Gotchas

- **All six steps are routed.** The whole run needs `SELAT_ROUTER_URL` configured and the router reachable — there is no direct fallback.
- Per-step caps sum to $0.474; the top-level run cap is **$0.50** (rounded up). Find-phone (Sixtyfour, $0.30) dominates the cost.
- Step 2 needs an email. If you do not pass `--email`, feed the address returned by step 1 before running the verifier.
- Steps 3 and 6 want `linkedinUrl`; match rates drop sharply without it, but they still run.
- Steps run independently (continue-across-steps): one merchant can succeed while another fails — check the per-step summary.
- Hunter's MPP paths are `/hunter/...` and POST-only — they are not the public `/v2/...` GET routes.

## Validation

Run free 402 probes (no payment) before a paid run, per the repo convention:

- `selat-pay POST "https://hunter.io/hunter/email-finder" --body '{"domain":"stripe.com","first_name":"John","last_name":"Doe"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/email-verifier" --body '{"email":"john@stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://api.sixtyfour.ai/enrich-lead" --body '{"lead_info":{"first_name":"John","last_name":"Doe","company":"Stripe"},"struct":{"email":"Work email"}}' --chain base --probe-only`
- `selat-pay POST "https://api.sixtyfour.ai/find-phone" --body '{"lead":{"first_name":"John","last_name":"Doe","company":"Stripe"}}' --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/company-enrichment" --body '{"domain":"stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://api.fiber.ai/v1/linkedin-live-fetch/profile/single" --body '{"identifier":"https://linkedin.com/in/johndoe"}' --chain base --probe-only`

A successful run prints `status=200` for each step and a ✓ summary.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoints, methods, and prices this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
