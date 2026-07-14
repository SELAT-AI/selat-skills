---
name: gtm-enrichment-deep
description: Use this skill when the user wants deep GTM lead enrichment from an email address — e.g. "enrich this lead", "who is jane@acme.com", "get me funding and company data for this contact", "enrich jane@acme.com with LinkedIn and funding", "deep enrichment for a prospect". Runs Apollo people enrichment as the primary person source (identity, title, LinkedIn), Hunter for company data, with Apollo organization enrichment as the routed fallback for funding. All calls are routed MPP payments via the SELAT Router. Cost ≈ $0.02–$0.03 per lead.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). All steps are routed MPP and require a reachable SELAT Router (SELAT_ROUTER_URL) for the Apollo and Hunter merchants (via Locus).
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# gtm-enrichment-deep

## When To Use

Use when the user has a lead's email address (optionally a name) and wants a comprehensive GTM enrichment: person identity + LinkedIn, company profile, and funding history. Apollo people enrichment is the primary person source, Hunter is the company source, and Apollo organization enrichment fills funding gaps via routed fallback. Every step is a **routed MPP payment** through the SELAT Router — there is no direct rail in this skill.

## Workflow

1. Install: `selat skill install gtm-enrichment-deep`
2. Run: `selat skill run gtm-enrichment-deep --email jane@acme.com [--firstName Jane] [--lastName Doe] [--company Acme] [--domain acme.com]`
3. The CLI compiles each manifest step into a `selat-pay` payment, runs them in order, and prints a per-step ✓/✗ summary.

Steps (in order):

- **Step 1 — Apollo** `POST /apollo/people-enrichment` — **ROUTED MPP** — primary person data: identity, title, LinkedIn URL ($0.0084 live price). This single call also covers what was previously a separate LinkedIn-match fallback — same endpoint, so the two steps are merged.
- **Step 2 — Hunter** `POST /hunter/company-enrichment` — **ROUTED MPP** — primary company profile ($0.01365 live price).
- **Step 3 — Apollo** `POST /apollo/org-enrichment` — **ROUTED MPP** fallback — run only if Step 2 returned no funding data ($0.0084 live price; also returns `technology_names` and headcount fields).

Derive `domain` from the `email` (text after `@`) when not supplied. Apollo/Hunter are primary; the Apollo org-enrichment fallback fills funding gaps. Track the source (`apollo` | `hunter`) and confidence (high = direct field, medium = fallback, low = inferred) per field. AI/B2B-SaaS classification is **not** returned by any endpoint — infer it from the company description/keywords and mark it low confidence.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | yes | — | Lead's email address, e.g. `jane@acme.com` |
| `domain` | no | derived from email | Company domain, e.g. `acme.com` |
| `firstName` | no | empty | Lead's first name (improves Apollo match) |
| `lastName` | no | empty | Lead's last name (improves Apollo match) |
| `company` | no | empty | Company name (improves Apollo match) |

Outputs: a merged JSON object with `person` (full_name, title, linkedin_url, location, confidence, source), `company` (name, domain, linkedin_url, description, geo, employee_count, founded_year, funding{…}, classification{is_ai, is_b2b_saas} — inferred, low confidence), and `meta` (total_cost, api_calls[], phases_run, timestamp). Track every API call in `meta.api_calls` with status, cost, latency, and any error — never silently skip a failure.

## Gotchas

- Every step is **routed**: `SELAT_ROUTER_URL` must be set and the router reachable for both the Apollo and Hunter merchants (via Locus).
- Step 3 is a **conditional fallback**. Only run Apollo `/apollo/org-enrichment` if Hunter returned no funding data. A full run with the fallback costs ≈ $0.03 (0.0084 + 0.01365 + 0.0084); without it ≈ $0.022.
- Caps are per step (`maxAmount`, ~10x each live price: $0.10–$0.15); they are not pooled.
- All three steps are POST with a JSON body — the org-enrichment domain goes in the body, not the query string.
- No endpoint returns an AI/B2B-SaaS classification; infer it from description/keywords and mark low confidence.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Free 402 probes (no payment) per repo convention:
  - `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-enrichment" --body '{"email":"jane@acme.com","first_name":"Jane","last_name":"Doe","organization_name":"Acme","domain":"acme.com"}' --chain base --probe-only`
  - `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/company-enrichment" --body '{"domain":"acme.com"}' --chain base --probe-only`
  - `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/org-enrichment" --body '{"domain":"acme.com"}' --chain base --probe-only`
- A successful run prints `status=200` for each executed step and a ✓ summary.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoints this skill calls (merchant, method/path, price, source).
- selat-pay — https://github.com/SELAT-AI/selat-pay

_Apollo and Hunter are third-party services; their trademarks belong to their respective owners. This skill calls their public MPP-listed endpoints via the SELAT Router._
