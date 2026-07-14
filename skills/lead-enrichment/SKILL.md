---
name: lead-enrichment
description: Use this skill when the user wants to enrich a sales lead or contact across multiple data sources — e.g. "enrich this lead", "find and verify their work email", "get a phone number for this prospect", "enrich the company", "complete contact data for John Doe at Stripe". Chains three routed MPP merchants across five steps (Hunter for email find/verify and company enrichment, Apollo for lead enrichment, Clado for phone/contact discovery) in a single run, all paid through the SELAT Router (routed MPP rail).
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Every step is a routed MPP payment, so a reachable SELAT Router (SELAT_ROUTER_URL) is required for the whole run.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# lead-enrichment

## When To Use

Use when the user has a partial lead (name + company + domain, optionally a LinkedIn URL or known email) and wants complete contact data: a found-and-verified work email, lead-level enrichment, a phone number and contact details, and company details. Every step is a **routed MPP** payment translated by the SELAT Router into an outbound payment on the merchant's rail — there is no direct rail in this skill.

## Workflow

1. Install: `selat skill install lead-enrichment`
2. Run: `selat skill run lead-enrichment --firstName John --lastName Doe --company Stripe --domain stripe.com [--email john@stripe.com] [--linkedinUrl https://linkedin.com/in/johndoe]`
3. The CLI compiles each step into a `selat-pay` call (each a routed MPP payment via the SELAT Router), runs them in order, and prints a per-step status (status=200 / ✓ or ✗) summary.

Steps, in order:

- **Step 1 — Hunter** `POST /hunter/email-finder` — find the work email from domain + name.
- **Step 2 — Hunter** `POST /hunter/email-verifier` — verify the email is deliverable (pass `--email`, or the email from step 1).
- **Step 3 — Apollo** `POST /apollo/people-enrichment` — lead-level enrichment (person record: email, title, social/company details).
- **Step 4 — Clado** `POST /clado/contacts` — contact enrichment (including phone numbers) from the lead's LinkedIn URL.
- **Step 5 — Hunter** `POST /hunter/company-enrichment` — enrich the company from its domain.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `firstName` | yes | — | Lead first name (Hunter email-finder, Apollo people-enrichment) |
| `lastName` | yes | — | Lead last name (Hunter email-finder, Apollo people-enrichment) |
| `company` | yes | — | Company name (sent to Apollo as `organization_name`) |
| `domain` | yes | — | Company domain (Hunter email-finder + company-enrichment) |
| `email` | no | (from step 1) | Work email to verify in step 2 |
| `linkedinUrl` | no | empty | LinkedIn URL for Apollo people-enrichment and the Clado contacts (phone) step |

Outputs: Hunter returns email/verification/company JSON; Apollo returns an enriched person record; Clado returns contact details including phone numbers.

## Gotchas

- **All five steps are routed.** The whole run needs `SELAT_ROUTER_URL` configured and the router reachable — there is no direct fallback.
- Per-step caps are **~10x each live price ($0.10–$0.50)**; live prices (probe-verified 2026-07-10) sum to about **$0.089** per run. Clado contacts ($0.04515) dominates the cost.
- Step 2 needs an email. If you do not pass `--email`, feed the address returned by step 1 before running the verifier.
- Step 4 (Clado contacts) keys entirely off `linkedinUrl` — without a real LinkedIn URL the phone lookup cannot match. Step 3 (Apollo) also matches much better with it.
- Steps run independently (continue-across-steps): one merchant can succeed while another fails — check the per-step summary.
- The MPP paths are `/hunter/...`, `/apollo/...`, `/clado/...` and POST-only — they are not the merchants' public API routes.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Run free 402 probes (no payment) before a paid run, per the repo convention:

- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-finder" --body '{"domain":"stripe.com","first_name":"John","last_name":"Doe"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-verifier" --body '{"email":"john@stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-enrichment" --body '{"first_name":"John","last_name":"Doe","organization_name":"Stripe","linkedin_url":"https://linkedin.com/in/johndoe"}' --chain base --probe-only`
- `selat-pay POST "https://clado.mpp.paywithlocus.com/clado/contacts" --body '{"linkedin_url":"https://linkedin.com/in/johndoe"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/company-enrichment" --body '{"domain":"stripe.com"}' --chain base --probe-only`

A successful run prints `status=200` for each step and a ✓ summary.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoints, methods, and prices this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
