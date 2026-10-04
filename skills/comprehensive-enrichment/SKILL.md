---
name: comprehensive-enrichment
description: Use this skill when the user wants one fixed, read-only, multi-source enrichment bundle for a fully specified person and their company. Triggers on "run a comprehensive enrichment bundle", "cross-check this lead across providers", or "research this person and company across Apollo, Hunter, Clado, Company Enrich, Diffbot, Exa, and Firecrawl". Before any paid run, require a known work email, first and last name, matching company and domain, the same person's LinkedIn URL, and a public company pricing/features URL. The CLI runs all 12 MPP steps; partial-identifier and cheap/subset requests should use a smaller enrichment skill instead.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay >= 0.12.0 with a funded Circle Agent Wallet for paid runs (the runner pays on whichever chain holds your Gateway balance). All 12 steps settle through the SELAT Router over MPP on Tempo. `selat skill verify --live-probe` is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.2"
  rail: MPP on Tempo
  kind: multi
---

# comprehensive-enrichment

## When To Use

Use this skill for a **full, fixed 12-call enrichment bundle** on one known
person and their employer/company. It cross-checks identity and contact data,
verifies a supplied work email, runs a Clado contacts lookup on a supplied
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
   `company`, `domain`, `linkedinUrl`, and `pricingUrl`. None has a default, so
   the CLI refuses to run without all seven. Refuse obvious identity
   mixtures—for example, a Stripe email with a LinkedIn profile for a person at
   Microsoft—and refuse an empty or non-HTTPS `pricingUrl` before probing (the
   CLI accepts an explicit empty string, and Firecrawl would then be paid for an
   empty URL).

3. Probe all 12 payment challenges for free before wallet setup or spending:

   ```bash
   SELAT_ROUTER_URL=https://router.selat.ai \
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

- **Person (6 calls)** — Apollo person enrichment (`reveal_*` flags off); Hunter
  email enrichment, email finder, and email verifier; Clado contacts lookup by
  LinkedIn URL; Exa person research.
- **Company (6 calls)** — Orthogonal Company Enrich overview; Hunter domain
  search (10 results); Diffbot KG funding/investors; Firecrawl pricing/features
  extraction; Exa similar-company discovery; Exa company research.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | yes | none | Known work email for the same person; enriched and verified as supplied. |
| `firstName` | yes | none | Person first name, matching the email and LinkedIn profile. |
| `lastName` | yes | none | Person last name, matching the email and LinkedIn profile. |
| `company` | yes | none | Employer/company name corresponding to the domain and pricing URL. |
| `domain` | yes | none | Bare company domain such as `stripe.com`. |
| `linkedinUrl` | yes | none | LinkedIn person-profile URL used by Apollo and Clado contacts. |
| `pricingUrl` | yes | none | Non-empty public HTTPS pricing/features page for the same company. |

Each step returns the provider's JSON plus the CLI's per-step status. Produce a
summary card first, then source-labelled details. Keep conflicting provider
values instead of silently overwriting them. Treat the supplied email and
LinkedIn URL as hypotheses to cross-check, not proof of identity.

## Rails And Costs

All 12 steps probe as `routed-mpp` (MPP on Tempo) through the SELAT Router.
Free probe on 2026-10-04 with a coherent real-company parameter set:

| Step | Live quote | Per-step cap |
|---|---:|---:|
| Apollo people-enrichment | $0.0399 | $0.06 |
| Hunter email-enrichment | $0.01365 | $0.02 |
| Hunter email-finder | $0.01365 | $0.02 |
| Hunter email-verifier | $0.0084 | $0.0125 |
| Clado contacts (LinkedIn URL only) | $0.04515 | $0.06 |
| Exa search (person) | $0.00525 | $0.0075 |
| Orthogonal Company Enrich | $0.012862 | $0.02 |
| Hunter domain-search (`limit: 10`) | $0.01365 | $0.02 |
| Diffbot KG enhance (`refresh: false`, `size: 1`) | $0.03675 | $0.05 |
| Firecrawl extract | $0.00525 | $0.0075 |
| Exa findSimilar | $0.00525 | $0.0075 |
| Exa search (company) | $0.00525 | $0.0075 |
| **Total** | **≈ $0.205** | sum of caps $0.2925 |

The top-level `maxAmount` (`$0.06`) is only the fallback cap for a step that
sets none; it is not a whole-run budget. The run-wide ceiling is the session
budget you arm with `selat budget start`.

## Gotchas

- **A found email can be a pattern guess.** On accept-all (catch-all) domains,
  Hunter's email finder returns `source_type: "generated"` (built from the
  domain's email pattern, with no published source) yet still marks it
  `verification.status: "valid"`. If `source_type` is `generated` or
  `accept_all` is true, report the address as an unconfirmed pattern guess, not
  a verified contact.
- **Fixed pipeline, not a menu.** `selat skill run` has no step selector and
  executes all 12 manifest entries every time. Do not promise that irrelevant
  or expensive steps will be skipped.
- **No inter-step dataflow.** The email found by Hunter is not automatically fed
  into the later verifier, and an employer inferred by one provider does not
  rewrite company inputs for later steps. This is why all seven coherent inputs
  are required before the run.
- **Per-step caps are not a cumulative cap.** The manifest limits each call; the
  separately armed session budget is the run-wide ceiling. Compute its amount
  from the fresh probe and the user's approval.
- **Live quote is authoritative.** Prices can change, so do not reuse the table
  above as approval.
- **Paid failure can still cost money.** A provider may capture payment and then
  return an application error. The runner continues to later steps by default.
  Never retry a failed paid step without a new quote and approval.
- **Clado contacts is a base lookup.** The step sends only `linkedin_url`; the
  paid `email_enrichment` / `phone_enrichment` flags are off (they raise the
  quote to $0.108–$0.150). Report a phone or email only if the response actually
  contains one. Clado does not derive the LinkedIn URL from a previous step.
- **Pricing extraction requires a real public HTTPS page.** Firecrawl is always
  called; an empty, private, or login-gated URL turns it into a paid error.
- **Funding and investors share one Diffbot call.** It sends `name` and `url` as
  arrays with `refresh: false` (a refresh re-crawl costs about 4×) and
  `size: 1`. Do not duplicate it.
- **Price-sensitive fields are fixed literals.** Hunter `limit: 10` (a larger
  limit quotes up to $0.108) and Diffbot `refresh` / `size` are numeric/boolean
  literals; do not turn them into params.
- Dead Clado `/clado/search` (no 402) and Abstract Company Enrichment are not
  used.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Validate structure locally:

```bash
selat skill validate ./skills/comprehensive-enrichment
npm run validate
```

Free end-to-end quote validation uses the full coherent parameter set and
`--live-probe` exactly as shown in Workflow Step 3. A passing receipt must show
all 12 endpoints reachable and each quote within its per-step cap. Do not add
`--pay` without separate approval and an armed session budget.

Useful single-endpoint probes while debugging (free; never settle; run with
`SELAT_ROUTER_URL=https://router.selat.ai`):

- `selat-pay GET "https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com" --chain base --max-amount 0.02 --probe-only --live-probe`
- `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-enrichment" --body '{"first_name":"Patrick","last_name":"Collison","organization_name":"Stripe","reveal_personal_emails":false,"reveal_phone_number":false}' --chain base --max-amount 0.06 --probe-only --live-probe`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/domain-search" --body '{"domain":"stripe.com","limit":10}' --chain base --max-amount 0.02 --probe-only --live-probe`
- `selat-pay POST "https://diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance" --body '{"type":"Organization","name":["Stripe"],"url":["https://stripe.com"],"refresh":false,"size":1}' --chain base --max-amount 0.05 --probe-only --live-probe`
- `selat-pay POST "https://firecrawl.mpp.tempo.xyz/v1/extract" --body '{"urls":["https://stripe.com/pricing"],"prompt":"Extract all products, pricing tiers, and features"}' --chain base --max-amount 0.0075 --probe-only --live-probe`

## References

- `manifest.json` — the fixed, machine-readable 12-call payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — pinned endpoints, live
  probe quotes, per-step caps, and input mapping.
- [`agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- `evals/evals.json` — routing, safety, and approval-behavior evals.
- selat-pay — https://github.com/SELAT-AI/selat-pay

> Third-party API names are trademarks of their respective owners; this skill
> only routes approved payments to their MPP endpoints and is not affiliated
> with or endorsed by them.
