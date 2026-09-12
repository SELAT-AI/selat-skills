---
name: gtm-enrichment-smart
description: Use this skill when the user wants a cost-conscious, read-only qualification brief for one known B2B lead from a work email and matching company domain—for example, "enrich this lead", "who is jane@acme.com", or "qualify this prospect before outreach". It runs a fixed three-call core for combined professional/company context, work-email deliverability, and an independent domain-based company profile. Require a legitimate business purpose, coherent inputs, a free live probe, fresh cost disclosure, and explicit approval. It does not reveal personal emails or phone numbers, supply live buying signals, or send outreach.
license: Apache-2.0
compatibility: "Requires the selat CLI and selat-pay with a funded Circle Agent Wallet for paid runs. All three calls currently traverse the SELAT Router as routed MPP on Tempo. `selat skill verify --live-probe` is free and needs no funded wallet."
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: MPP on Tempo
  kind: multi
---

# gtm-enrichment-smart

## When To Use

Use this skill for a **known B2B lead** when the user supplies both a work email
and the matching bare employer domain and wants a compact qualification brief:

- professional identity, role, public social/profile links, and employer context;
- work-email deliverability and confidence;
- company description, industry, location, headcount, revenue, funding,
  technology, and public social links; and
- explicit source agreement, conflicts, missing fields, and limitations.

This is the cost-conscious core. Use `gtm-enrichment-deep` when the user needs an
additional independent person source and a separate organization-level funding
and revenue cross-check. This skill does not retrieve current hiring, product,
pricing, or Twitter activity.

Use only for a legitimate business purpose. Do not use a personal/free-mail
address, infer sensitive traits, reveal personal emails or phone numbers, or
send outreach. Email deliverability is not consent to contact someone.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install gtm-enrichment-smart
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
     selat skill verify ~/.config/selat/skills/gtm-enrichment-smart \
     --email "<work-email>" \
     --domain <matching-bare-domain> \
     --live-probe
   ```

4. Show every live quote, the expected three-call total, and the sum of the
   per-step caps. Propose a cumulative session budget no higher than that cap
   sum, explain that all three calls execute, and wait for explicit approval.

5. Only after approval and a spendable Gateway balance, arm the approved
   cumulative budget, execute the fixed bundle once, and stop the budget after
   success or failure:

   ```bash
   selat budget start --amount <approved-cumulative-cap>
   selat skill run gtm-enrichment-smart \
     --email "<work-email>" \
     --domain <matching-bare-domain>
   selat budget stop
   ```

The CLI runs every manifest step in order and continues after an individual
failure. Check per-step results and payment history before any retry; obtain a
fresh quote and separate approval for the retry.

## Fixed Steps

1. **Combined person and company enrichment** — retrieves professional identity,
   role, location, public profile links, and embedded company context from the
   supplied work email.
2. **Work-email verification** — checks mail infrastructure and deliverability
   signals for the exact supplied address. It does not establish consent.
3. **Independent company-domain profile** — retrieves firmographics, revenue,
   funding, technology, and public social context for the matching domain.

This is a fixed qualification core, not a conditional waterfall. The current
SELAT manifest format has no result-dependent branching, so `selat skill run`
always executes all three calls.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | yes | none | Known work email for the target B2B lead. |
| `domain` | yes | none | Matching bare employer domain. |

The runner returns three independent raw responses. The agent—not the manifest—
must normalize and merge them into:

1. `target`: supplied email and domain, plus retrieval time;
2. `person`: supported professional name, title, location, public profile links,
   employer match, and field-level source/confidence;
3. `email_status`: deliverability category, confidence, and technical caveats;
4. `company`: supported name, description, industry, location, employee count,
   revenue, funding, technology, and public social links;
5. `qualification`: evidence-based fit observations and unresolved gaps, not an
   automated contact or rejection decision; and
6. `meta`: every call's status, observed cost, rail, and any error.

Prefer directly returned fields over inference. Mark high confidence only when
independent sources agree, medium when one source returns a field, and low when
the value is inferred. Never silently average conflicting headcount, revenue,
or funding values. No endpoint returns a reliable AI/B2B-SaaS classification;
if requested, infer it from descriptions or technologies and label it low
confidence.

## Rails And Costs

- All three calls currently route as `routed-mpp` over MPP on Tempo through the
  SELAT Router.
- Free live verification on 2026-08-30 quoted `$0.024150` for combined
  enrichment, `$0.008400` for email verification, and `$0.012862` for the
  independent company profile, for an expected fixed-run total of `$0.045412`.
- The three per-step caps are `$0.03`, `$0.015`, and `$0.02`; their sum is
  `$0.065`. Caps are ceilings, not price estimates, and are not pooled.
- Re-probe before every paid run because prices, rails, and availability can
  change. The live quote is authoritative.

## Gotchas

- **Fixed pipeline:** all three calls run. There are no conditional fallbacks or
  skipped steps in the manifest runner.
- **No automatic domain derivation:** the caller passes both `email` and
  `domain`; validate their relationship before probing or paying.
- **No inter-step dataflow:** a provider result cannot automatically supply a
  Twitter handle or organization ID to another manifest step.
- **No live buying signals:** hiring, product, pricing, and social-activity reads
  were removed rather than represented with unrelated defaults.
- **Deliverability is not consent:** never turn a positive verifier result into
  automatic outreach.
- **No automatic merge:** synthesize the three raw responses with provenance and
  keep conflicting values visible.
- **Paid failures may charge:** the runner continues after a failed step. Check
  history and never auto-retry.

## Validation

- Static:
  `selat skill validate ./skills/gtm-enrichment-smart`
- Live gate, free:
  `selat skill verify ./skills/gtm-enrichment-smart --email "research@example.com" --domain example.com --live-probe`
- Missing-input gate: omit either required parameter and confirm verification
  fails before any endpoint call.
- Paid smoke test: only after coherent user-approved inputs, fresh quotes,
  explicit approval, and an armed cumulative session budget; add `--pay` to the
  verification command or run the skill once.

## References

- `manifest.json` — machine-readable fixed payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — live schema, price,
  privacy, removed-call, and interpretation notes.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Provider names and trademarks belong to their respective owners and are used
only for endpoint identification.
