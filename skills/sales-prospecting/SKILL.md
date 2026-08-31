---
name: sales-prospecting
description: "Use this skill when the user needs a bounded, read-only B2B prospecting brief that combines an ICP company search with research on one known target company and one known professional—for example, 'find ten SaaS companies and check the VP Sales at example.com', 'research decision-makers at this company', or 'cross-check this prospect's work email'. It runs five independent, keyless reads through the SELAT Router: company search, people search, privacy-limited professional enrichment, user-supplied work-email verification, and company enrichment. It does not retrieve personal emails or phone numbers, send outreach, or create a CRM list automatically."
license: Apache-2.0
compatibility: Requires the selat CLI and a reachable SELAT Router. Free live verification needs no wallet; a paid run requires a funded Circle Agent Wallet, an armed session budget, and explicit approval.
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: MPP on Tempo
  kind: multi
---

# sales-prospecting

## When To Use

Use for a **small, bounded B2B prospecting research bundle** when the requester
has a legitimate business purpose and can supply both an ICP and one coherent
known target company/person. The skill returns up to ten ICP company candidates,
up to ten public professional candidates at the supplied company domain, one
named professional cross-check, an independent deliverability verdict for a
user-supplied work email, and company context.

This is a fixed five-read bundle, not an output-chained pipeline. Every step
runs independently from the supplied parameters. In particular, the email
verifier does not automatically consume an address returned by the professional
enrichment step.

Do not use this skill for private individuals, personal-email or phone
discovery, bulk harvesting, automated outreach, or CRM mutation.

## Workflow

1. Collect all nine required inputs:

   - `companyKeywords`: concise ICP keywords, such as `B2B SaaS`;
   - `location`: one target geography used by both searches;
   - `employeeRange`: one provider-format range such as `51,200`;
   - `jobTitle`: one target role, such as `VP Sales`;
   - `seniority`: one supported value: `founder`, `c_suite`, `partner`, `vp`,
     `head`, `director`, `manager`, `senior`, `entry`, or `intern`;
   - `companyDomain`: one bare company domain, with no scheme or path;
   - `firstName` and `lastName`: one known professional at that company;
   - `workEmail`: one work email the requester is authorized to validate.

   Confirm that the domain, named professional, work email, role, and ICP form
   one coherent business-research target. The work-email domain should match the
   company domain unless the requester explains a legitimate corporate-domain
   relationship. Stop before any probe if an input is missing, malformed, or
   incoherent.

2. Install the vetted recipe:

   ```bash
   selat skill install sales-prospecting
   ```

3. Run the free live verification before wallet setup or payment:

   ```bash
   SELAT_ROUTER_URL=https://router.selat.ai \
     selat skill verify ~/.config/selat/skills/sales-prospecting \
     --companyKeywords "B2B SaaS" \
     --location "San Francisco" \
     --employeeRange "51,200" \
     --jobTitle "VP Sales" \
     --seniority "vp" \
     --companyDomain "example.com" \
     --firstName "Research" \
     --lastName "Lead" \
     --workEmail "research@example.com" \
     --live-probe
   ```

4. Show the user each live quote, the expected total, every underlying per-call
   cap, and the proposed session cap. Explain that all five independent steps
   execute and that a paid application error may still charge. Wait for explicit
   approval.

5. Only after approval and a spendable Gateway balance, arm the approved session
   budget, run once, and stop the budget after success or failure:

   ```bash
   selat budget start --amount <approved-session-cap>
   selat skill run sales-prospecting \
     --companyKeywords "<ICP-keywords>" \
     --location "<target-location>" \
     --employeeRange "<lower,upper>" \
     --jobTitle "<one-job-title>" \
     --seniority "<supported-seniority>" \
     --companyDomain "<company-domain>" \
     --firstName "<first-name>" \
     --lastName "<last-name>" \
     --workEmail "<authorized-work-email>"
   selat budget stop
   ```

Inspect payment history before any retry. A changed target, email, or search
scope is a new paid run and requires a fresh probe and separate approval.

## Inputs And Outputs

| Param | Required | Default | Steps | Description |
|---|---|---|---|---|
| `companyKeywords` | yes | none | 1 | ICP keywords for bounded company discovery. |
| `location` | yes | none | 1, 2 | One geography for company and professional searches. |
| `employeeRange` | yes | none | 1 | One employee-count range in `lower,upper` form. |
| `jobTitle` | yes | none | 2 | One target professional title. |
| `seniority` | yes | none | 2 | One supported seniority enum. |
| `companyDomain` | yes | none | 2, 3, 5 | Known target domain for professional and company research. |
| `firstName` | yes | none | 3 | Known target professional's first name. |
| `lastName` | yes | none | 3 | Known target professional's last name. |
| `workEmail` | yes | none | 4 | Authorized work email independently checked for deliverability. |

Steps always run in this order:

1. Bounded ICP company search with a fixed ten-result first page.
2. Bounded professional search at the supplied company domain with a fixed
   ten-result first page.
3. Named-professional enrichment with personal-email and phone revelation fixed
   to `false`.
4. Independent deliverability verification of the supplied `workEmail`.
5. Company enrichment for the supplied domain.

Distill the raw responses into:

1. The supplied ICP, known target, retrieval time, and five-step status.
2. Up to ten ICP company candidates and why each matches the returned evidence.
3. Up to ten professional candidates at the target domain, preserving title,
   seniority, location, and public professional links only when returned.
4. A separate named-professional cross-check, without personal emails or phone.
5. The supplied work email's deliverability verdict and confidence only as
   returned—never claim it was generated by step 3.
6. Company industry, size, location, description, technology, and public social
   profiles only when actually returned.
7. Conflicts, missing fields, ambiguous identities, final observed cost per
   step, and total cost.

Do not invent a unique person match, claim exhaustive coverage, or initiate
outreach. Keep raw JSON and endpoint URLs out of the user-facing answer.

## Gotchas

- **Five fixed independent calls:** `selat skill run` executes all steps. This
  is not a conditional menu and no step consumes another step's output.
- **No defaults:** all nine inputs are required. Missing input must fail before
  any endpoint call.
- **Validate enum and format before paying:** invalid `seniority` or
  `employeeRange` may produce a paid application error because a free payment
  probe checks price and reachability before upstream input validation.
- **Work email only:** personal-email and phone-revelation flags are fixed to
  `false`. Reject consumer mailbox domains or unrelated addresses unless the
  requester establishes an authorized business use.
- **Bounded scope:** both searches request only the first ten results. A larger
  list or another page is a separate workflow and needs a fresh scope review.
- **Candidate search is not identity proof:** preserve ambiguity and provenance.
- **Paid failures may charge:** never auto-retry. Inspect history, re-probe, and
  obtain fresh approval first.

## Validation

- Static:

  ```bash
  selat skill validate ./skills/sales-prospecting
  ```

- Free live gate:

  ```bash
  SELAT_ROUTER_URL=https://router.selat.ai \
    selat skill verify ./skills/sales-prospecting \
    --companyKeywords "B2B SaaS" \
    --location "San Francisco" \
    --employeeRange "51,200" \
    --jobTitle "VP Sales" \
    --seniority "vp" \
    --companyDomain "example.com" \
    --firstName "Research" \
    --lastName "Lead" \
    --workEmail "research@example.com" \
    --live-probe
  ```

- Missing-input gate: omit each required parameter in turn and confirm the
  command fails before a network call.
- Privacy gate: confirm the manifest fixes both personal-email and phone
  revelation to `false`.
- Paid smoke test: use one requester-approved, legitimate B2B target only after
  a fresh quote, explicit approval, a spendable Gateway balance, and an armed
  session budget.

## References

- `manifest.json` — machine-readable five-read payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — request schemas,
  prices, caps, live reliability signals, and free probe.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

"Apollo" and "Hunter" are trademarks of their respective owners and are used
only for endpoint identification. This skill is not affiliated with or endorsed
by either provider.
