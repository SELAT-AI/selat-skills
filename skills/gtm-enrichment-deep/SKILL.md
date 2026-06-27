---
name: gtm-enrichment-deep
description: Use this skill when the user wants deep GTM lead enrichment from an email address — e.g. "enrich this lead", "who is jane@acme.com", "get me funding and company data for this contact", "enrich jane@acme.com with LinkedIn and funding", "deep enrichment for a prospect". Runs Sixtyfour AI agents as the primary enrichment source (person + company data, funding history, AI/B2B classification) with Apollo as the routed fallback for LinkedIn match and organization funding. All calls are routed MPP payments via the SELAT Router. Cost ≈ $0.20–$0.22 per lead.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). All steps are routed MPP and require a reachable SELAT Router (SELAT_ROUTER_URL) for the Sixtyfour (tempo) and Apollo (tempo) merchants.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# gtm-enrichment-deep

## When To Use

Use when the user has a lead's email address (optionally a name) and wants a comprehensive GTM enrichment: person identity + LinkedIn, company profile, funding history, and AI/B2B classification. Sixtyfour's AI agents browse the web and are the primary source; Apollo fills gaps via routed fallback. Every step is a **routed MPP payment** through the SELAT Router — there is no direct rail in this skill.

## Workflow

1. Install: `selat skill install gtm-enrichment-deep`
2. Run: `selat skill run gtm-enrichment-deep --email jane@acme.com [--firstName Jane] [--lastName Doe] [--company Acme] [--domain acme.com]`
3. The CLI compiles each manifest step into a `selat-pay` payment, runs them in order, and prints a per-step ✓/✗ summary.

Steps (in order):

- **Step 1 — Sixtyfour** `POST /enrich-lead` — **ROUTED MPP** — primary person data ($0.10 cap).
- **Step 2 — Sixtyfour** `POST /enrich-company` — **ROUTED MPP** — primary company + funding + AI/B2B classification ($0.10 cap).
- **Step 3 — Apollo** `POST /api/v1/people/match` — **ROUTED MPP** fallback — run only if Step 1 returned no LinkedIn URL ($0.01 cap).
- **Step 4 — Apollo** `GET /api/v1/organizations/enrich?domain=…` — **ROUTED MPP** fallback — run only if Step 2 returned no funding data ($0.01 cap).

Derive `domain` from the `email` (text after `@`) when not supplied. Sixtyfour is primary; Apollo is fallback only. Track the source (`sixtyfour` | `apollo`) and confidence (high = Sixtyfour direct, medium = Apollo fallback, low = inferred) per field.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | yes | — | Lead's email address, e.g. `jane@acme.com` |
| `domain` | no | derived from email | Company domain, e.g. `acme.com` |
| `firstName` | no | empty | Lead's first name (improves Sixtyfour match) |
| `lastName` | no | empty | Lead's last name (improves Sixtyfour match) |
| `company` | no | empty | Company name (improves Sixtyfour match) |

Outputs: a merged JSON object with `person` (full_name, title, linkedin_url, location, confidence, source), `company` (name, domain, linkedin_url, description, geo, employee_count, founded_year, funding{…}, classification{is_ai, is_b2b_saas}), and `meta` (total_cost, api_calls[], phases_run, timestamp). Track every API call in `meta.api_calls` with status, cost, latency, and any error — never silently skip a failure.

## Gotchas

- Every step is **routed**: `SELAT_ROUTER_URL` must be set and the router reachable for both the Sixtyfour and Apollo merchants.
- Sixtyfour AI agents take ~30–60s per call — be patient, do not time out early.
- Steps 3 and 4 are **conditional fallbacks**. Only run Apollo `/people/match` if Sixtyfour returned no LinkedIn URL, and Apollo `/organizations/enrich` only if Sixtyfour returned no funding data. A full run with both fallbacks costs ≈ $0.22; the manifest cap is $0.25.
- Per-step caps: $0.10 + $0.10 + $0.01 + $0.01. Caps are per step (`maxAmount`); they are not pooled.
- The Apollo org-enrich call is a **GET** with the domain as a query param; the other three are POST with a JSON body.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Free 402 probes (no payment) per repo convention:
  - `selat-pay POST "https://api.sixtyfour.ai/enrich-lead" --body '{"lead_info":{"email":"jane@acme.com","domain":"acme.com"}}' --chain base --probe-only`
  - `selat-pay POST "https://api.sixtyfour.ai/enrich-company" --body '{"target_company":{"domain":"acme.com"}}' --chain base --probe-only`
  - `selat-pay POST "https://api.apollo.io/api/v1/people/match" --body '{"email":"jane@acme.com","reveal_personal_emails":true}' --chain base --probe-only`
  - `selat-pay GET "https://api.apollo.io/api/v1/organizations/enrich?domain=acme.com" --chain base --probe-only`
- A successful run prints `status=200` for each executed step and a ✓ summary.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoints this skill calls (merchant, method/path, price, source).
- selat-pay — https://github.com/SELAT-AI/selat-pay

_Sixtyfour and Apollo are third-party services; their trademarks belong to their respective owners. This skill calls their public MPP-listed endpoints via the SELAT Router._
