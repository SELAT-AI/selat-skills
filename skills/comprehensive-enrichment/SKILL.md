---
name: comprehensive-enrichment
description: Use this skill when the user wants to enrich, look up, or research a lead, contact, person, or company — from an email, name, LinkedIn URL, domain, or company name. Triggers on "enrich this lead", "look up John at Stripe", "who is john@stripe.com", "research stripe.com", "profile this company", "find emails and phone for", "company funding and competitors". Resolves contact info, verified work emails, phone, social profiles, company overview, funding, products, and competitors across many MPP data providers (Apollo, Hunter, Clado, Abstract Company Enrichment, Diffbot KG, Exa, Firecrawl). Every provider call is routed through the SELAT Router (MPP).
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

Use when the user wants maximum data plus correctness on a person and/or company — from any single identifier (email, name + company, LinkedIn URL, domain, or company name). The skill fans out across many data providers, cross-references them, and lets the user compile a full profile. Person enrichment naturally cascades into company enrichment: once an employer domain is known, the company steps fill in overview, funding, products, and competitors.

All provider calls are **routed MPP** through the SELAT Router. There is no direct rail in this skill.

## Workflow

1. Install: `selat skill install comprehensive-enrichment`
2. Run: `selat skill run comprehensive-enrichment --email john@stripe.com --firstName John --lastName Doe --company Stripe --domain stripe.com --linkedinUrl https://linkedin.com/in/johndoe --pricingUrl https://stripe.com/pricing`
3. The CLI compiles each manifest step into a `selat-pay` payment (one capped MPP payment per step, routed via the SELAT Router), runs them in order, and prints a per-step ✓/✗ status summary.

Provide only the params you have — leave the rest empty. Person-only inputs (email, name, LinkedIn) drive the person steps; company inputs (domain, company) drive the company steps. Supplying both yields the full person + company profile.

Step groups (in manifest order):

- **Person** — Clado search (natural-language people search, synchronous — no polling); Apollo people-enrichment; Hunter email-enrichment; Hunter email-finder; Hunter email-verifier; Clado contacts (phone, by LinkedIn URL); Exa person research.
- **Company** — Abstract Company Enrichment lookup; Hunter domain-search; Diffbot KG enhance (funding + investors in one Organization record); Firecrawl extract; Exa findSimilar; Exa company research.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | no | "" | Person work email (drives email-based lookups + the verifier) |
| `firstName` | no | "" | Person first name |
| `lastName` | no | "" | Person last name |
| `company` | no | "" | Company name |
| `domain` | no | "" | Company domain (drives company + domain email lookups) |
| `linkedinUrl` | no | "" | LinkedIn person profile URL (required for the phone step — Clado contacts enriches by LinkedIn URL) |
| `pricingUrl` | no | "" | Company page to scrape for products/pricing |

Outputs: each step returns its provider's JSON (profile objects, email verification verdicts, phone, company overview, funding rounds + investors, products, similar companies, sourced research). Merge across steps, keep both values with source labels when providers disagree, and present a summary card first, then full details.

## Gotchas

- **All steps are routed**: every step needs `SELAT_ROUTER_URL` set and the router reachable. There is no direct fallback.
- **Per-step caps are ~10x each live price (max $1.00; manifest fallback cap $1.00)**; the sum of live prices (probe-verified 2026-07-10) is ~$0.58 per full run. The priciest steps are Clado search ($0.31815), Hunter domain-search ($0.10815), and Clado contacts ($0.04515); skip Clado search for public megacorps to save cost.
- **Provide matching params**: a verifier step with an empty `email`, or a domain step with an empty `domain`, will return little of value — pass the identifiers you actually have.
- **Phone needs a LinkedIn URL**: the phone step is Clado contacts, which enriches by `linkedinUrl` — without it, there is no phone lookup.
- **Funding + investors are one step**: the Diffbot KG enhance Organization record includes both, so don't look for a separate investors step.
- **Firecrawl extract** needs a real `pricingUrl`; without one, skip that step.
- **Steps run independently** (continue-across-steps): one provider can fail while others succeed — check the per-step summary.
- **Email verification is a single Hunter email-verifier call** — there is no multi-provider consensus fan-out.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Probe any endpoint for free (sends the 402 challenge, never pays) with `--probe-only`:

- `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-enrichment" --body '{"first_name":"John","last_name":"Doe","organization_name":"Stripe"}' --chain base --probe-only`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-verifier" --body '{"email":"john@stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://clado.mpp.paywithlocus.com/clado/contacts" --body '{"linkedin_url":"https://linkedin.com/in/johndoe"}' --chain base --probe-only`
- `selat-pay POST "https://abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup" --body '{"domain":"stripe.com"}' --chain base --probe-only`
- `selat-pay POST "https://diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance" --body '{"type":"Organization","name":"Stripe"}' --chain base --probe-only`

A successful paid run prints `status=200` and a ✓ for each executed step.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoints, methods, and prices this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

> Third-party API names (Apollo, Hunter, Clado, Abstract, Diffbot, Exa, Firecrawl) are trademarks of their respective owners; this skill only routes payments to their MPP endpoints.
