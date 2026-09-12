---
name: comprehensive-enrichment
description: Use this skill when the user wants one fixed, read-only, multi-source enrichment bundle for a fully specified person and their company. Triggers on "run a comprehensive enrichment bundle", "cross-check this lead across providers", or "research this person and company across Clado, Apollo, Hunter, Company Enrich, Diffbot, Exa, and Firecrawl". Before any paid run, require a known work email, first and last name, matching company and domain, the same person's LinkedIn URL, and a public company pricing/features URL. The CLI runs all 13 MPP steps; partial-identifier and cheap/subset requests should use a smaller enrichment skill instead.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet for paid runs. All 13 steps settle through the SELAT Router over MPP on Tempo. `selat skill verify --live-probe` is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: MPP on Tempo
  kind: multi
---

# comprehensive-enrichment

## When To Use

Use this skill for a **full, fixed 13-call enrichment bundle** on one known
person and their employer/company. It cross-checks identity and contact data,
verifies a supplied work email, looks for a phone number from a supplied
LinkedIn profile, and adds company overview, company email patterns, funding,
pricing/features, similar companies, and recent research.

This is not a single-identifier waterfall. Before a paid run, collect all seven
inputs and confirm they describe the same target. If the user has only an email,
name, domain, or LinkedIn URL—or wants to minimize cost—use a smaller enrichment
skill or free discovery instead.

Every provider call is read-only and settles through the SELAT Router over
**MPP on Tempo**. The only side effect is the approved USDC spend.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install comprehensive-enrichment
   ```

2. Collect and validate all required inputs: `email`, `firstName`, `lastName`,
   `company`, `domain`, `linkedinUrl`, and `pricingUrl`. Refuse obvious identity
   mixtures—for example, a Stripe email with a LinkedIn profile for a person at
   Microsoft.

3. Probe all 13 payment challenges for free before wallet setup or spending:

   ```bash
   selat skill verify ~/.config/selat/skills/comprehensive-enrichment \
     --email <known-work-email> \
     --firstName <first-name> \
     --lastName <last-name> \
     --company "<company-name>" \
     --domain <bare-domain> \
     --linkedinUrl <person-linkedin-url> \
     --pricingUrl <public-https-pricing-or-features-url> \
     --live-probe
   ```

4. Show the user every live quote, the expected cumulative total, and a proposed
   absolute session cap. Obtain explicit approval for that exact workload.

5. Only after approval and a spendable Gateway balance, arm the approved
   cumulative cap, run the fixed bundle, and disarm the budget after success or
   failure:

   ```bash
   selat budget start --amount <approved-cumulative-cap>
   selat skill run comprehensive-enrichment \
     --email <known-work-email> \
     --firstName <first-name> \
     --lastName <last-name> \
     --company "<company-name>" \
     --domain <bare-domain> \
     --linkedinUrl <person-linkedin-url> \
     --pricingUrl <public-https-pricing-or-features-url>
   selat budget stop
   ```

The CLI compiles each manifest step into one independently capped `selat-pay`
call and continues across steps by default. Inspect the per-step result and
payment history; do not interpret a final partial failure as “nothing charged.”

### Fixed step groups

- **Person (7 calls)** — Clado deep search; Apollo person enrichment; Hunter
  email enrichment, email finder, and email verifier; Clado contacts; Exa person
  research.
- **Company (6 calls)** — Company Enrich overview; Hunter domain search;
  Diffbot KG funding/investors; Firecrawl pricing/features extraction; Exa
  similar-company discovery; Exa company research.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | yes | none | Known work email for the same person; enriched and verified as supplied. |
| `firstName` | yes | none | Person first name, matching the email and LinkedIn profile. |
| `lastName` | yes | none | Person last name, matching the email and LinkedIn profile. |
| `company` | yes | none | Employer/company name corresponding to the domain and pricing URL. |
| `domain` | yes | none | Bare company domain such as `stripe.com`. |
| `linkedinUrl` | yes | none | LinkedIn person-profile URL used by Apollo and Clado contacts. |
| `pricingUrl` | yes | none | Public HTTPS pricing/features page for the same company. |

Each step returns the provider's JSON plus the CLI's per-step status. Produce a
summary card first, then source-labelled details. Keep conflicting provider
values instead of silently overwriting them. Treat the supplied email and
LinkedIn URL as hypotheses to cross-check, not proof of identity.

## Gotchas

- **Fixed pipeline, not a menu.** `selat skill run` has no step selector and
  executes all 13 manifest entries. Do not promise that irrelevant or expensive
  steps will be skipped.
- **No inter-step dataflow.** The email found by Hunter is not automatically fed
  into the later verifier, and an employer inferred by one provider does not
  rewrite company inputs for later steps. This is why all seven coherent inputs
  are required before the run.
- **Per-step caps are not a cumulative cap.** The manifest limits each call; the
  separately armed session budget is the run-wide ceiling. Compute its amount
  from the fresh probe and the user's approval.
- **Live quote is authoritative.** Probe-only verification on 2026-08-29 quoted
  approximately $0.617662 for all 13 steps. Prices can change, so do not reuse
  that number as approval.
- **Paid failure can still cost money.** A provider may capture payment and then
  return an application error. The runner continues to later steps by default.
  Never retry a failed paid step without a new quote and approval.
- **Phone lookup requires the supplied LinkedIn URL.** Clado contacts does not
  derive that URL from a previous step.
- **Pricing extraction requires a real public HTTPS page.** Empty, private, or
  login-gated URLs can turn the Firecrawl call into a paid error.
- **Funding and investors share one Diffbot call.** Do not duplicate it.

## Validation

Validate structure locally:

```bash
selat skill validate ./skills/comprehensive-enrichment
npm run validate
```

Free end-to-end quote validation uses the full coherent parameter set and
`--live-probe` exactly as shown in Workflow Step 3. A passing receipt must show
all 13 endpoints reachable and each quote within its per-step cap. Do not add
`--pay` without separate approval and an armed session budget.

Useful single-endpoint probes while debugging (free; never settle):

- `selat-pay GET "https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com" --chain base --max-amount 0.02 --probe-only --live-probe`
- `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-enrichment" --body '{"first_name":"John","last_name":"Doe","organization_name":"Stripe"}' --chain base --max-amount 0.05 --probe-only --live-probe`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-verifier" --body '{"email":"john@stripe.com"}' --chain base --max-amount 0.015 --probe-only --live-probe`

## References

- `manifest.json` — the fixed, machine-readable 13-call payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — pinned endpoints, live
  probe quotes, per-step caps, and input mapping.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- `evals/evals.json` — routing, safety, and approval-behavior evals.
- selat-pay — https://github.com/SELAT-AI/selat-pay

> Third-party API names are trademarks of their respective owners; this skill
> only routes approved payments to their MPP endpoints.
