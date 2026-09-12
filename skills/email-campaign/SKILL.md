---
name: email-campaign
description: Use this skill for one fixed, read-only email-campaign preparation bundle when the user has a complete target with a supported industry, company domain and name, target person's first and last name, and a matching known work email. Triggers on "prepare an outreach research bundle", "build a verified campaign seed list around this lead", or "cross-check this work email and company before outreach". It discovers 10 similar-size industry companies, retrieves domain email patterns, finds and verifies the target email, enriches the person, and adds company context. It does not draft or send email. The CLI runs all six paid MPP steps; verification-only, discovery-only, and subset requests should use a smaller workflow.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet for paid runs. All six steps settle through the SELAT Router over MPP on Tempo. `selat skill verify --live-probe` is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: MPP on Tempo
  kind: multi
---

# email-campaign

## When To Use

Use this skill to prepare a **research and verification bundle** for one known
business lead and a small prospect-company seed list. It combines:

- ten companies matching an industry and 50–500 employee filter;
- domain-level email patterns and addresses;
- one target person's inferred work email;
- technical deliverability verification of a supplied work email;
- person enrichment for personalization; and
- company firmographic context.

This skill does **not** compose, schedule, or send messages. It does not prove
that the recipient consented to contact. Use the results only for lawful,
targeted business outreach; honor suppression lists and opt-outs, and do not use
it for phishing, harassment, sensitive targeting, or bulk unsolicited spam.

The manifest is a fixed six-call pipeline. If the user wants only email
verification, only company discovery, or a cheaper subset, use a smaller direct
workflow instead of running this skill.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install email-campaign
   ```

2. Collect all six inputs and check that `email`, `firstName`, `lastName`,
   `company`, and `domain` describe the same target. Use a supported Fiber
   industry value such as `Software`.

3. Probe all six payment challenges for free before wallet setup or spending:

   ```bash
   selat skill verify ~/.config/selat/skills/email-campaign \
     --industry Software \
     --domain <bare-domain> \
     --firstName <first-name> \
     --lastName <last-name> \
     --company "<company-name>" \
     --email <known-work-email> \
     --live-probe
   ```

4. Show every live quote, the expected cumulative total, and a proposed absolute
   session cap. Obtain explicit approval for that exact workload.

5. Only after approval and a spendable Gateway balance, arm the approved
   cumulative cap, run the bundle once, and disarm the budget after success or
   failure:

   ```bash
   selat budget start --amount <approved-cumulative-cap>
   selat skill run email-campaign \
     --industry Software \
     --domain <bare-domain> \
     --firstName <first-name> \
     --lastName <last-name> \
     --company "<company-name>" \
     --email <known-work-email>
   selat budget stop
   ```

The CLI compiles each manifest entry into an independently capped `selat-pay`
call and continues across steps by default. Check the per-step result and
payment history before reporting success or considering a retry.

### Fixed steps

1. **Fiber company search** — return up to ten companies using the supplied
   industry and a fixed 50–500 employee range.
2. **Hunter domain search** — retrieve domain-level email patterns and results.
3. **Hunter email finder** — infer the named target's work email from domain and
   name.
4. **Hunter email verifier** — evaluate technical deliverability for the
   separately supplied `email` once.
5. **Apollo people enrichment** — add person and employer context.
6. **Company Enrich lookup** — add company firmographics by domain.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `industry` | yes | none | Supported Fiber industry value, such as `Software`. |
| `domain` | yes | none | Bare target company domain matching company and email. |
| `firstName` | yes | none | Target person's first name. |
| `lastName` | yes | none | Target person's last name. |
| `company` | yes | none | Target company name corresponding to the domain. |
| `email` | yes | none | Known work email to verify; must match the target identity. |

Return a source-labelled preparation report, not a raw-data dump:

1. target identity and company consistency check;
2. supplied email verdict versus the separately inferred email;
3. person/company fields useful for careful personalization;
4. ten-company discovery results as a seed list, not automatically approved
   recipients;
5. provider disagreements, missing data, and confidence limits; and
6. per-step success/failure and final spend.

## Gotchas

- **Campaign preparation only.** No manifest step drafts or sends email.
- **Fixed pipeline, not a menu.** The current CLI has no step selector and runs
  all six calls. Do not promise that Fiber, domain search, or enrichment can be
  skipped within `selat skill run`.
- **No inter-step dataflow.** Fiber results are not fed into Hunter; Hunter's
  inferred email is not automatically passed to the verifier. The verifier
  checks the user-supplied `email`, which is why all inputs are required.
- **One verifier call only.** Hunter's verifier already reports deliverability,
  bounce risk, and catch-all status. Paying for the identical request twice does
  not create independent confirmation.
- **Fiber request shape matters.** Use `industriesV2.anyOf` and
  `employeeCountV2` bounds. The older `industries` and
  `employee_count_min/max` fields are not the current schema. This manifest pins
  `pageSize` to ten.
- **Pagination is not in this skill.** A continuation needs the first response's
  `billing.requestId` as `parentRequestId` with unchanged filters. Handle that as
  a separately reviewed operation.
- **Per-step caps are not cumulative.** The manifest limits individual calls;
  the separately armed session budget is the run-wide ceiling.
- **Live quote is authoritative.** Preliminary free probes on 2026-08-29 quoted
  approximately $0.392962 for all six corrected calls. Re-probe before every
  approval because prices can change.
- **Paid failure can still cost money.** The runner continues to later steps by
  default. Never retry a charged failure without a fresh quote and approval.
- **Deliverability is not permission.** A technically valid address does not
  establish consent or make outreach lawful.

## Validation

Validate structure locally:

```bash
selat skill validate ./skills/email-campaign
npm run validate
```

Free end-to-end quote validation uses all six coherent inputs and `--live-probe`
as shown in Workflow Step 3. A passing receipt must report six reachable
`routed-mpp` calls, each within its per-step cap. Do not add `--pay` without
separate approval and an armed session budget.

Useful single-endpoint probes while debugging (free; never settle):

- `selat-pay POST "https://mpp.orthogonal.com/fiber/v1/company-search" --body '{"searchParams":{"industriesV2":{"anyOf":["Software"]},"employeeCountV2":{"lowerBoundExclusive":50,"upperBoundInclusive":500}},"pageSize":10}' --chain base --max-amount 0.25 --probe-only --live-probe`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-verifier" --body '{"email":"john@stripe.com"}' --chain base --max-amount 0.015 --probe-only --live-probe`
- `selat-pay GET "https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com" --chain base --max-amount 0.02 --probe-only --live-probe`

## References

- `manifest.json` — the fixed, machine-readable six-call payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — pinned endpoints, request
  shapes, current quotes, and caps.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- `evals/evals.json` — routing, safety, and approval-behavior evals.
- Fiber company-search schema — https://docs.fiber.ai/build/sdks
- selat-pay — https://github.com/SELAT-AI/selat-pay

> Third-party API names are trademarks of their respective owners; this skill
> only routes approved payments to their MPP endpoints.
