---
name: comprehensive-enrichment
description: Use this skill when the user wants to enrich, look up, or research a lead, contact, person, or company — from an email, name, LinkedIn URL, domain, or company name. Triggers on "enrich this lead", "look up John at Stripe", "who is john@stripe.com", "research stripe.com", "profile this company", "find emails and phone for", "company funding and competitors". Resolves contact info, verified work + personal emails, phone, social profiles, company overview, leadership, funding, products, and competitors across many MPP data providers (Fiber, Nyne, Sixtyfour, Hunter, Tomba, Brand.dev, Linkup, ScrapeGraphAI, Exa). Every provider call is routed through the SELAT Router (MPP / tempo-native).
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). All steps are routed MPP, so a reachable SELAT Router (SELAT_ROUTER_URL) is required.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# comprehensive-enrichment

## When To Use

Use when the user wants maximum data plus correctness on a person and/or company — from any single identifier (email, name + company, LinkedIn URL, domain, or company name). The skill fans out across many data providers, cross-references them, and lets the user compile a full profile. Person enrichment naturally cascades into company enrichment: once an employer domain is known, the company steps fill in overview, leadership, funding, products, and competitors.

All provider calls are **routed MPP** (tempo-native) through the SELAT Router. There is no direct rail in this skill.

## Workflow

1. Install: `selat skill install comprehensive-enrichment`
2. Run: `selat skill run comprehensive-enrichment --email john@stripe.com --firstName John --lastName Doe --company Stripe --domain stripe.com --linkedinUrl https://linkedin.com/in/johndoe --pricingUrl https://stripe.com/pricing`
3. The CLI compiles each manifest step into a `selat-pay` payment (one capped MPP payment per step, routed via the SELAT Router), runs them in order, and prints a per-step ✓/✗ status summary.

Provide only the params you have — leave the rest empty. Person-only inputs (email, name, LinkedIn) drive the person steps; company inputs (domain, company) drive the company steps. Supplying both yields the full person + company profile.

Step groups (in manifest order):

- **Person** — Fiber kitchen-sink person; Nyne person/search; Sixtyfour enrich-lead; Tomba enrich; Hunter email-finder; Hunter + Tomba + Fiber email verifiers; Sixtyfour find-phone; Fiber LinkedIn profile + posts; Linkup person research.
- **Company** — Brand.dev retrieve; Hunter domain-search; Fiber kitchen-sink company; Fiber leadership profile search; Nyne funding + funders; Brand.dev AI products; ScrapeGraphAI extract; Exa findSimilar; Linkup company research.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | no | "" | Person work email (drives email-based lookups + verifiers) |
| `firstName` | no | "" | Person first name |
| `lastName` | no | "" | Person last name |
| `company` | no | "" | Company name |
| `domain` | no | "" | Company domain (drives company + domain email lookups) |
| `linkedinUrl` | no | "" | LinkedIn person profile URL |
| `pricingUrl` | no | "" | Company page to scrape for products/pricing |

Outputs: each step returns its provider's JSON (profile objects, email verification verdicts, phone, LinkedIn posts, brand overview, funding rounds, products, similar companies, sourced research). Merge across steps, keep both values with source labels when providers disagree, and present a summary card first, then full details.

## Gotchas

- **All steps are routed**: every step needs `SELAT_ROUTER_URL` set and the router reachable. There is no direct fallback.
- **Per-run cap is $3.20** (sum of per-step caps). The two priciest steps are Nyne funders ($1.44) and Nyne funding ($0.578); skip them for public megacorps to save cost.
- **Provide matching params**: a verifier step with an empty `email`, or a domain step with an empty `domain`, will return little of value — pass the identifiers you actually have.
- **Hunter is POST** at `hunter.io/hunter/*` with a JSON body (not GET query params).
- **Tomba is GET** at `api.tomba.io/v1/*` with query params encoded in the URL.
- **ScrapeGraphAI extract** needs a real `pricingUrl`; without one, skip that step.
- **Steps run independently** (continue-across-steps): one provider can fail while others succeed — check the per-step summary.
- **Verify every email** (work + personal) with all three verifiers (Hunter, Tomba, Fiber) and take consensus.

## Validation

Probe any endpoint for free (sends the 402 challenge, never pays) with `--probe-only`:

- `selat-pay POST "https://api.fiber.ai/v1/kitchen-sink/person" --body '{"emailAddress":"john@stripe.com"}' --chain base --probe-only`
- `selat-pay GET "https://api.tomba.io/v1/enrich?email=john@stripe.com" --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/email-verifier" --body '{"email":"john@stripe.com"}' --chain base --probe-only`
- `selat-pay GET "https://api.brand.dev/v1/brand/retrieve?domain=stripe.com" --chain base --probe-only`
- `selat-pay POST "https://api.nyne.ai/company/funding" --body '{"company_name":"Stripe"}' --chain base --probe-only`

A successful paid run prints `status=200` and a ✓ for each executed step.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoints, methods, and prices this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

> Third-party API names (Fiber, Nyne, Sixtyfour, Hunter, Tomba, Brand.dev, Linkup, ScrapeGraphAI, Exa) are trademarks of their respective owners; this skill only routes payments to their MPP endpoints.
