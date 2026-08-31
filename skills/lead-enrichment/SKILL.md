---
name: lead-enrichment
description: Use this skill when the user has one fully specified B2B lead and a legitimate business need for a fixed, read-only full-contact cross-check—for example, "cross-check this known lead's work email and professional profile", "verify this supplied business email and retrieve a business phone", or "build a sourced contact-and-company brief before manual review". It runs five independent paid reads across Hunter, Apollo, and Clado. Require a coherent name, company, domain, work email, and LinkedIn person URL; free-verify and disclose the full fixed cost before approval. It does not send outreach or reveal Apollo personal emails.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet for paid runs. All five calls currently traverse the SELAT Router as routed MPP on Tempo; `selat skill verify --live-probe` is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: MPP on Tempo
  kind: multi
---

# lead-enrichment

## When To Use

Use for a **fully identified B2B lead** when the requester needs one fixed,
read-only bundle covering:

- a work-email candidate derived independently from name and employer domain;
- deliverability signals for the exact supplied work email;
- professional identity and employer context;
- an explicitly requested business-phone lookup; and
- company firmographics.

The requester must supply a coherent first name, last name, company, bare
company domain, known work email, and LinkedIn person URL. Use a smaller skill or
free discovery for email-only, company-only, phone-only, partial, or bulk tasks.

Use only for a legitimate business purpose. Do not infer sensitive traits,
silently substitute a different person, or send outreach. Email deliverability
and phone availability do not establish consent to contact someone.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install lead-enrichment
   ```

2. Collect all six required inputs. Lowercase `email` and `domain` for
   comparison, confirm that the email suffix after `@` equals the bare domain,
   and confirm that the LinkedIn person URL, name, and employer refer to the
   same lead. Stop before any probe if the target is incomplete or inconsistent.

3. Probe all five payment challenges for free:

   ```bash
   SELAT_ROUTER_URL=https://router.selat.ai \
     selat skill verify ~/.config/selat/skills/lead-enrichment \
     --firstName "<first-name>" \
     --lastName "<last-name>" \
     --company "<company-name>" \
     --domain <matching-bare-domain> \
     --email "<known-work-email>" \
     --linkedinUrl "<linkedin-person-url>" \
     --live-probe
   ```

4. Tell the user that every manifest step executes. Show each fresh quote, the
   expected five-call total, the sum of the per-step caps, and a proposed
   cumulative session budget no higher than that cap sum. Explain that a paid
   application error may still be charged. Wait for explicit approval.

5. Only after approval and a spendable Gateway balance, arm the approved
   cumulative budget, run the bundle once, and disarm the budget after success
   or failure:

   ```bash
   selat budget start --amount <approved-cumulative-cap>
   selat skill run lead-enrichment \
     --firstName "<first-name>" \
     --lastName "<last-name>" \
     --company "<company-name>" \
     --domain <matching-bare-domain> \
     --email "<known-work-email>" \
     --linkedinUrl "<linkedin-person-url>"
   selat budget stop
   ```

The CLI runs every step in order and continues after an individual failure.
Inspect per-step results and payment history before any retry; obtain a fresh
quote and separate approval for a retry.

## Fixed Steps

1. **Work-email candidate** — Hunter derives a candidate from the supplied
   name and employer domain.
2. **Supplied-email verification** — Hunter evaluates deliverability for the
   exact `email` input. It does not consume step 1's response.
3. **Professional identity** — Apollo cross-checks the complete supplied
   identity while personal-email and phone revelation are explicitly disabled.
4. **Business-phone lookup** — Clado uses the supplied LinkedIn URL and work
   email with phone enrichment enabled and redundant email enrichment disabled.
5. **Company profile** — Hunter retrieves employer firmographics by domain.

This is a fixed bundle, not a conditional pipeline. The manifest runner has no
inter-step dataflow, branching, or step selector.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `firstName` | yes | none | Lead's first name. |
| `lastName` | yes | none | Lead's last name. |
| `company` | yes | none | Current employer name. |
| `domain` | yes | none | Bare employer domain matching the work email. |
| `email` | yes | none | Known work email that the verifier checks independently. |
| `linkedinUrl` | yes | none | LinkedIn person-profile URL for identity and phone matching. |

The runner returns five independent raw responses. The agent—not the manifest—
must normalize and merge them into:

1. `target`: supplied identifiers and retrieval time;
2. `person`: supported professional identity, title, location, public profile,
   employer match, and field-level provenance;
3. `email`: the finder candidate, the supplied address, deliverability result,
   whether the two addresses agree, and any caveat;
4. `phone`: returned business-phone evidence or an explicit not-found result,
   with source and confidence;
5. `company`: supported description, industry, location, employee count, and
   other returned firmographics;
6. `conflicts`: incompatible identities or values preserved rather than
   silently merged; and
7. `meta`: every call's status, observed cost, rail, and any error.

Prefer directly returned fields over inference. Never average conflicting
values or replace the supplied identity with a provider's nearest match. Keep
raw JSON and endpoint URLs out of the user-facing brief. Handle returned contact
data only for the requester-approved purpose.

## Rails And Costs

- All five calls currently route as `routed-mpp` over MPP on Tempo through the
  SELAT Router.
- The recorded free verification and exact schema notes live in
  `references/endpoints.md`; re-probe before every paid run because prices,
  rails, and availability can change.
- Per-step `maxAmount` values are ceilings, not estimates and not a cumulative
  budget. Use a separately approved session budget as the full-run tripwire.

## Gotchas

- **No step chaining:** the email finder does not feed the verifier. `email` is
  a required caller input, and the two results are an independent cross-check.
- **No optional paid placeholders:** all six inputs are required and have no
  defaults. Missing input must fail before any endpoint call.
- **Phone enrichment is explicit:** the Clado call sets phone enrichment on and
  redundant email enrichment off. A base contact lookup is cheaper but does not
  represent the advertised phone-lookup task.
- **Apollo data minimization:** personal-email and Apollo phone revelation stay
  disabled; the dedicated Clado step is the only requested phone source.
- **All five calls execute:** use another skill for narrower requests.
- **Paid failures may charge:** never auto-retry; inspect history first.
- **Contactability is not consent:** do not convert a positive email or phone
  result into automatic outreach.

## Validation

- Static: `selat skill validate ./skills/lead-enrichment`
- Free live gate: run the Workflow verification command with six coherent,
  non-sensitive test inputs and `--live-probe`.
- Missing-input gate: omit each required parameter in turn and confirm the
  command fails before any network probe.
- Paid smoke test: use one requester-approved target only after fresh quotes,
  explicit cost approval, a spendable Gateway balance, and an armed cumulative
  session budget.

## References

- `manifest.json` — machine-readable fixed payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — live schemas, quotes,
  privacy flags, dataflow limits, and free probes.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Provider names and trademarks belong to their respective owners and are used
only for endpoint identification.
