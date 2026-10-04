---
name: enrich-waterfall
description: >-
  Use this skill for one fixed, read-only, multi-provider person-and-company
  enrichment bundle when the user has a complete and internally consistent
  target: known work email, first and last name, company, domain, LinkedIn
  person URL, Apollo organization ID, and X/Twitter handle. Triggers on "run the
  full enrichment bundle", "cross-check this lead across providers", "get
  contact, company, hiring, funding, news, and social context", or "verify this
  fully specified lead". The CLI runs all 17 paid calls independently; it
  cannot conditionally stop, skip tiers, or pass outputs between steps.
  Partial-identifier, subset, or cheapest-first requests should use a smaller
  skill or free endpoint discovery instead.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay >= 0.12.0 (the CLI's bundled copy is sufficient). Paid runs need a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). The 16 MPP calls and one x402 call all settle through the SELAT Router. `selat skill verify --live-probe` is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.2"
  rail: mixed
  kind: multi
---

# enrich-waterfall

## When To Use

Use this skill for a **full, fixed 17-call evidence bundle** on one known person
and their employer. It cross-checks identity and contact data, compares company
records, retrieves hiring and recent-news signals, reads a supplied LinkedIn and
X/Twitter profile, and verifies a supplied work email.

Despite the historical `enrich-waterfall` name, this is **not** a waterfall or a
menu: `selat skill run` always executes every step, and the CLI has no step
selector, stop-on-match, or tier escalation. Use this skill only when the user
wants the entire bundle and supplies every required identifier. If the user has
only one partial identifier, wants a cheaper subset, or asks for true
stop-on-match escalation, use a smaller skill, hand-built single `selat-pay`
calls after their own probe and approval, or free discovery instead.

All calls are read-only. The only side effect is the explicitly approved USDC
spend. Use personal and contact data only for a legitimate, lawful purpose; do
not use the skill for harassment, phishing, sensitive profiling, or unsolicited
bulk outreach.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install enrich-waterfall
   ```

2. Collect all eight inputs: `email`, `firstName`, `lastName`, `domain`,
   `company`, `linkedinUrl`, `organizationId`, and `xHandle`. None has a
   default, so the CLI refuses to run without all eight. Confirm that they
   describe the same person and company. Do not combine convenient placeholders
   from unrelated identities.

3. Probe all 17 payment challenges for free before wallet setup or spending:

   ```bash
   SELAT_ROUTER_URL=https://router.selat.ai \
     selat skill verify ~/.config/selat/skills/enrich-waterfall \
     --email <known-work-email> \
     --firstName <first-name> \
     --lastName <last-name> \
     --domain <bare-domain> \
     --company "<company-name>" \
     --linkedinUrl <person-linkedin-url> \
     --organizationId <apollo-organization-id> \
     --xHandle <x-username-without-at> \
     --live-probe
   ```

4. Show every live quote, the expected cumulative total, and the sum of the
   per-step caps. Propose an absolute session cap no higher than that cap sum and
   obtain explicit approval for the exact 17-call workload.

5. Only after approval and a spendable Gateway balance, arm the approved
   cumulative cap, run the fixed bundle once, and disarm the budget after success
   or failure:

   ```bash
   selat budget start --amount <approved-cumulative-cap>
   selat skill run enrich-waterfall \
     --email <known-work-email> \
     --firstName <first-name> \
     --lastName <last-name> \
     --domain <bare-domain> \
     --company "<company-name>" \
     --linkedinUrl <person-linkedin-url> \
     --organizationId <apollo-organization-id> \
     --xHandle <x-username-without-at>
   selat budget stop
   ```

The CLI compiles every manifest entry into one independently capped `selat-pay`
call and continues across failures by default. Inspect the per-step status and
payment history; a final failure does not mean earlier calls were not charged.

### Fixed step groups

- **Person and supplied identity (6 calls)** — Apollo people enrichment
  (`reveal_*` flags off); Hunter email and combined enrichment; Scrape Creators
  LinkedIn profile read; Hunter email finder; a five-result Apollo people-search
  filtered to the supplied domain.
- **Company and signals (8 calls)** — Apollo company search (5 results) and
  enrichment; Company Enrich and Hunter company cross-checks; Apollo job postings
  (10 results); two Brave searches for recent company and funding news; Diffbot
  organization data.
- **Contact, social, and verification (3 calls)** — Clado email-and-phone reveal;
  SELAT-native X/Twitter profile; Hunter verification of the supplied email.

The group labels are for reporting only. They do not create conditional
execution or data dependencies.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | yes | none | Known work email for the target; enriched and verified as supplied. |
| `firstName` | yes | none | Target first name matching the email and LinkedIn URL. |
| `lastName` | yes | none | Target last name matching the email and LinkedIn URL. |
| `domain` | yes | none | Bare employer domain such as `stripe.com`; also filters the people-search. |
| `company` | yes | none | Employer name corresponding to the domain and Apollo organization ID. |
| `linkedinUrl` | yes | none | LinkedIn person-profile URL for the same target. |
| `organizationId` | yes | none | Apollo organization ID for the same company. |
| `xHandle` | yes | none | X/Twitter username without `@`, matching the target. |

Return a source-labelled report rather than a raw data dump:

1. an identity-consistency assessment across the supplied identifiers;
2. the supplied-email verdict versus any separately inferred email;
3. person, role, LinkedIn, X/Twitter, and contact findings;
4. company firmographics, technology, hiring, knowledge-graph, news, and funding
   signals;
5. provider disagreements, missing fields, and confidence limits; and
6. every step's success/failure plus the final settled spend.

Do not silently merge conflicting people or companies. Treat every supplied
identifier and provider match as a hypothesis to cross-check, not proof of
identity. Do not expose unnecessary personal data in the final report.

## Rails And Costs

Free probe on 2026-10-04 with a coherent real-company parameter set; 16 steps
probe `routed-mpp` (MPP on Tempo) and the X/Twitter step `routed-x402` (x402 via
Circle Gateway), all through the SELAT Router.

| # | Step | Live quote | Per-step cap |
|---|---|---:|---:|
| 1 | Apollo people-enrichment | $0.0399 | $0.06 |
| 2 | Hunter email-enrichment | $0.01365 | $0.02 |
| 3 | Scrape Creators LinkedIn profile | $0.021 | $0.03 |
| 4 | Hunter combined-enrichment | $0.02415 | $0.035 |
| 5 | Apollo org-search | $0.0399 | $0.06 |
| 6 | Orthogonal Company Enrich | $0.012862 | $0.02 |
| 7 | Apollo org-enrichment | $0.0399 | $0.06 |
| 8 | Hunter company-enrichment | $0.01365 | $0.02 |
| 9 | Hunter email-finder | $0.01365 | $0.02 |
| 10 | SELAT X/Twitter user info | $0.001 | $0.0015 |
| 11 | Apollo job-postings | $0.0399 | $0.06 |
| 12 | Brave news-search (company news) | $0.03675 | $0.05 |
| 13 | Brave news-search (funding) | $0.03675 | $0.05 |
| 14 | Diffbot KG enhance | $0.03675 | $0.05 |
| 15 | Clado contacts (email + phone flags) | $0.15015 | $0.20 |
| 16 | Apollo people-search | $0.00525 | $0.0075 |
| 17 | Hunter email-verifier | $0.0084 | $0.0125 |
| | **Total** | **≈ $0.534** | sum of caps $0.7565 |

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
- **Fixed bundle, not a conditional waterfall.** `selat skill run` has no step
  selector and executes all 17 manifest entries every time. It cannot stop after
  a match or skip premium calls.
- **No inter-step dataflow.** Apollo's organization ID, Hunter's inferred email,
  and any discovered social link are not fed into later requests. That is why all
  eight coherent inputs are required before the run.
- **Per-step caps are not cumulative.** The manifest caps each call separately.
  The armed session budget is the only run-wide tripwire; calculate it from fresh
  quotes and explicit approval.
- **Paid failures can still cost money.** Providers may capture payment before
  validating the body. The runner then continues to later steps by default.
  Never retry automatically or treat a partial failure as zero spend.
- **The final verifier checks the supplied `email`.** It does not consume the
  separate email-finder response.
- **The X/Twitter call requires a username, not a full name.** Supply `xHandle`
  without `@`; the skill does not infer it.
- **The Apollo job-postings call requires a supplied organization ID.** It does
  not consume the earlier Apollo organization response.
- **Clado contact enrichment explicitly requests email and phone.** Both flags
  raise the quote from $0.045 to about $0.150; the free probe is the price source
  of truth.
- **Result counts are fixed literals.** Apollo org-search `per_page: 5`,
  people-search `per_page: 5`, job-postings `per_page: 10`, and Brave
  `count: 10` are numeric literals; do not turn them into params.
- **Diffbot sends arrays for `name` and `url`.** The manifest pins both shapes,
  `size: 1`, and disables paid refresh.
- **Dead routes are gone.** Clado `/clado/linkedin-profile`, `/clado/scrape`, and
  `/clado/search` serve no 402 (re-checked 2026-10-04); LinkedIn reads use Scrape
  Creators and person search uses Apollo people-search.
- **Live quote is authoritative.** Never reuse a price from this document as
  approval; run the free probe immediately before every paid session.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Validate the target skill and then the repository:

```bash
selat skill validate ./skills/enrich-waterfall
npm run validate
```

Free end-to-end quote validation uses all eight coherent inputs and
`--live-probe` as shown in Workflow Step 3. A passing receipt must show all 17
endpoints reachable and each quote within its per-step cap. Do not add `--pay`
without separate approval and an armed session budget.

Useful single-endpoint probes while debugging are free and never settle (run
with `SELAT_ROUTER_URL=https://router.selat.ai`). These optional commands
require a shell-callable `selat-pay`; the bundled copy is sufficient for the
full `selat skill verify` command even when it is not on `PATH`:

- `selat-pay GET "https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com" --chain base --max-amount 0.02 --probe-only --live-probe`
- `selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/linkedin/profile?url=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fpatrickcollison" --chain base --max-amount 0.03 --probe-only --live-probe`
- `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-search" --body '{"q_keywords":"Patrick Collison","q_organization_domains_list":["stripe.com"],"per_page":5,"page":1}' --chain base --max-amount 0.0075 --probe-only --live-probe`
- `selat-pay POST "https://clado.mpp.paywithlocus.com/clado/contacts" --body '{"linkedin_url":"https://www.linkedin.com/in/patrickcollison","email_enrichment":true,"phone_enrichment":true}' --chain base --max-amount 0.20 --probe-only --live-probe`
- `selat-pay POST "https://diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance" --body '{"type":"Organization","name":["Stripe"],"url":["https://stripe.com"],"refresh":false,"size":1}' --chain base --max-amount 0.05 --probe-only --live-probe`

## References

- `manifest.json` — the fixed, machine-readable 17-call recipe.
- [`references/endpoints.md`](references/endpoints.md) — request schemas, free
  probe quotes, per-step caps, and input mapping.
- [`agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- `evals/evals.json` — trigger, control-flow, safety, and output-quality evals.
- selat-pay — https://github.com/SELAT-AI/selat-pay

> Third-party API names are trademarks of their respective owners; this skill
> only routes explicitly approved payments to their endpoints and is not
> affiliated with or endorsed by them.
