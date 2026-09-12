---
name: gtm-enrichment-deep
description: Use this skill when the user wants a deep, read-only GTM brief for one known business lead from a work email and matching company domain—for example, "enrich this B2B lead", "who is jane@acme.com", or "cross-check this prospect and company". It runs a fixed three-call Apollo and Hunter bundle for professional identity, LinkedIn, firmographics, technology, funding, revenue, and headcount. Require a legitimate business purpose, coherent work-email/domain inputs, a free live probe, fresh cost disclosure, and explicit approval. It never requests personal emails or phone numbers and does not send outreach.
license: Apache-2.0
compatibility: "Requires the selat CLI and selat-pay with a funded Circle Agent Wallet for paid runs. All three calls currently traverse the SELAT Router as routed MPP on Tempo. `selat skill verify --live-probe` is free and needs no funded wallet."
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: MPP on Tempo
  kind: multi
---

# gtm-enrichment-deep

## When To Use

Use this skill for a **known B2B lead** when the user supplies both a work email
and the matching bare company domain and wants a cross-source GTM brief:

- public professional identity, title, and LinkedIn URL when available;
- company description, industry, location, social profiles, and technologies;
- employee count, revenue, funding, and other organization context; and
- explicit source agreement, conflicts, missing fields, and confidence.

This is a research workflow, not an outreach or contact-harvesting workflow. Do
not use a personal/free-mail address, infer sensitive traits, reveal personal
emails or phone numbers, or message the lead. Use the data only for a legitimate
business purpose disclosed by the user.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install gtm-enrichment-deep
   ```

2. Collect both required inputs:

   - `email`: the lead's known work email;
   - `domain`: the bare domain belonging to the same employer.

   Lowercase both for comparison and confirm that the text after `@` equals the
   supplied domain. Stop if they differ or if the address uses a consumer
   free-mail domain. The manifest does not derive one parameter from another.

3. Probe all three payment challenges for free:

   ```bash
   SELAT_ROUTER_URL=https://router.selat.ai \
     selat skill verify ~/.config/selat/skills/gtm-enrichment-deep \
     --email "<work-email>" \
     --domain <matching-bare-domain> \
     --live-probe
   ```

4. Show every live quote, the expected three-call total, the sum of the three
   per-step caps, and a proposed cumulative session cap no higher than that sum.
   Explain that all three calls execute and that a paid application error may
   still be charged. Wait for explicit approval.

5. Only after approval and a spendable Gateway balance, arm the approved
   cumulative budget, execute the bundle once, and stop the budget after success
   or failure:

   ```bash
   selat budget start --amount <approved-cumulative-cap>
   selat skill run gtm-enrichment-deep \
     --email "<work-email>" \
     --domain <matching-bare-domain>
   selat budget stop
   ```

The CLI runs every manifest step in order and continues after an individual
failure. Check per-step results and payment history before any retry; obtain a
fresh quote and separate approval for the retry.

## Fixed Steps

1. **Apollo person enrichment** — searches by the supplied work email and
   matching domain for professional identity, title, LinkedIn, location, and
   embedded organization context. Personal-email and phone revelation are
   explicitly disabled.
2. **Hunter company enrichment** — retrieves domain-based company description,
   industry, employee count, location, technology, and social-profile context.
   Do not claim that this endpoint returns funding.
3. **Apollo organization enrichment** — independently retrieves organization
   industry, employee count, funding, revenue, and technology context.

This is a fixed cross-check, not a conditional fallback. The current SELAT
manifest format has no result-dependent branching, so `selat skill run` always
executes all three calls.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | yes | none | Known work email for the target lead. |
| `domain` | yes | none | Matching bare employer domain. |

The runner returns three independent raw responses. The agent—not the manifest—
must normalize and merge them into:

1. `target`: the supplied email and domain, plus retrieval time;
2. `person`: supported professional name, title, LinkedIn URL, location, and
   field-level source/confidence;
3. `company`: supported name, domain, description, industry, location,
   employee count, revenue, funding, technology, and social profiles;
4. `conflicts_and_gaps`: disagreements, stale values, and missing fields; and
5. `meta`: every call's status, observed cost, rail, and any error.

Prefer a directly returned field over inference. Mark a field high confidence
only when two independent sources agree, medium when one source returns it, and
low when it is inferred. Never silently average conflicting headcount, revenue,
or funding values. No endpoint returns a reliable AI/B2B-SaaS classification;
if the user asks for one, infer it from descriptions or technologies and label
it low confidence.

## Rails And Costs

- All three calls currently route as `routed-mpp` over MPP on Tempo through the
  SELAT Router.
- Free live verification on 2026-08-30 quoted the two Apollo calls at `$0.039900`
  each and the Hunter call at `$0.013650`, for an expected fixed-run total of
  `$0.093450`.
- The three per-step caps are `$0.05`, `$0.02`, and `$0.05`; their sum is
  `$0.12`. Caps are ceilings, not price estimates, and are not pooled.
- Re-probe before every paid run because prices, rails, and availability can
  change. The live quote is authoritative.

## Gotchas

- **Fixed pipeline:** all three calls run. There is no conditional funding
  fallback in the manifest runner.
- **No automatic domain derivation:** the caller must pass both `email` and
  `domain`; the agent validates that they match before probing or paying.
- **Data minimization:** personal-email and phone revelation are disabled.
  Do not add them without a separately reviewed purpose, quote, and approval.
- **Hunter is not the funding source:** use its result for firmographics and
  social/technology context. Apollo organization enrichment supplies funding.
- **No automatic merge:** the runner returns per-step responses; the agent
  performs provenance-aware synthesis.
- **Paid failures may charge:** the runner continues after a failed step. Check
  history and never auto-retry.

## Validation

- Static:
  `selat skill validate ./skills/gtm-enrichment-deep`
- Live gate, free:
  `selat skill verify ./skills/gtm-enrichment-deep --email "research@example.com" --domain example.com --live-probe`
- Missing-input gate: omit either required parameter and confirm verification
  fails before any endpoint call.
- Paid smoke test: only after coherent user-approved inputs, fresh quotes,
  explicit approval, and an armed cumulative session budget; add `--pay` to the
  verification command or run the skill once.

## References

- `manifest.json` — machine-readable fixed payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — live schema, price,
  privacy, and interpretation notes.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Apollo and Hunter are third-party services; their trademarks belong to their
respective owners. This skill calls their public MPP-listed endpoints through
the SELAT Router.
