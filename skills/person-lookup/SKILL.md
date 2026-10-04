---
name: person-lookup
description: Use this skill when the user wants a read-only public professional-profile lookup for one named person at a known current company—for example, "look up Jane Smith at Acme", "find the professional background of Sam Lee at Example Corp", or "disambiguate this executive by employer". It buys one bounded five-result Apollo people-search through the SELAT Router over MPP on Tempo. Require a full name, company, legitimate business purpose, free live probe, fresh price disclosure, and explicit approval. It does not retrieve private contact data, infer sensitive traits, or send outreach.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.12.0, and a funded Circle Agent Wallet for a paid run (the runner pays on whichever chain holds your Gateway balance). The call traverses the SELAT Router as routed MPP on Tempo; `selat skill verify --live-probe` is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.2"
  rail: MPP on Tempo
  kind: single
---

# person-lookup

## When To Use

Use for a **specific named professional at a known current company** when the
requester needs up to five public professional-profile candidates for manual
disambiguation. The result may support current title, employer, location, and
public profile links when the provider returns them.

Require both the person's full name and company. Use free discovery or ordinary
web research for a generic "who is X?" question without employer context, broad
people categories, company research, private contact discovery, or bulk lists.

Use only for a legitimate business purpose. Do not use the result to infer
sensitive traits, identify a private individual outside a professional context,
or automate outreach.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install person-lookup
   ```

2. Collect both required inputs:

   - `name`: the person's full professional name;
   - `company`: the person's known current employer or organization.

   Confirm that the request is for one professional identity and that the name
   and company are not placeholders, broad categories, or unrelated entities.
   Stop before any probe if either input is missing or incoherent. Neither param
   has a default, so the CLI refuses to run without both.

3. Probe the payment challenge for free:

   ```bash
   SELAT_ROUTER_URL=https://router.selat.ai \
     selat skill verify ~/.config/selat/skills/person-lookup \
     --name "<full-name>" \
     --company "<current-company>" \
     --live-probe
   ```

4. Tell the user the live quote and the per-step cap, explain that this is one
   paid call returning at most five candidates, disclose that a paid application
   error may still charge, and wait for explicit approval.

5. Only after approval and a spendable Gateway balance, arm a session budget no
   higher than the approved cap, execute once, and disarm the budget after
   success or failure:

   ```bash
   selat budget start --amount <approved-cap>
   selat skill run person-lookup \
     --name "<full-name>" \
     --company "<current-company>"
   selat budget stop
   ```

Step:

- **five-result public professional search — Apollo** `POST /apollo/people-search`
  with `q_keywords="${name} ${company}"`, `per_page=5`, `page=1` — **MPP on
  Tempo** via the SELAT Router.

Inspect payment history before any retry. A refined query is a new paid call and
requires a fresh probe and separate approval.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `name` | yes | none | Full professional name of the target person. |
| `company` | yes | none | Known current employer, appended to the search keywords. |

The endpoint returns synchronously; there is no job ID or polling step. Distill
the raw response into:

1. The supplied name and company plus retrieval time.
2. Up to five candidate profiles in provider order.
3. For each candidate, the name, current title/employer, location, and public
   profile links only when actually returned.
4. An employer-match assessment and clear reasons for ranking one candidate
   above another.
5. Missing fields, conflicting identities, and uncertainty.
6. Call status, observed cost, rail, and any error.

Do not invent a unique match when several candidates remain plausible. Prefer
returned fields over inference, preserve provenance, and label unsupported
fields as unavailable. Keep raw JSON and endpoint URLs out of the user-facing
answer. Do not claim the search retrieves private email addresses or phone
numbers.

## Rails And Costs

- The single call routes as `routed-mpp` (MPP on Tempo) through the SELAT
  Router.
- Free verification on 2026-10-04 quoted `$0.00525` (Apollo people-search is a
  flat per-call price, not per-result). The per-step `maxAmount` is `$0.0075`;
  it is a ceiling, not a price estimate. The top-level `maxAmount` is only the
  fallback cap for a step that sets none; it is not a whole-run budget — use
  `selat budget start` for that.
- Re-probe before every paid run because prices, rails, and availability can
  change. The live quote is authoritative.

## Gotchas

- **No defaults:** both `name` and `company` are required. Missing input must
  fail before any network call.
- **Bounded search:** `per_page=5` and `page=1` are fixed numeric literals. Do
  not remove them or replace them with string params (`${param}` substitution
  produces strings).
- **Company is a keyword, not a hard filter:** this route filters companies only
  by domain or Apollo organization id, so the company name is added to
  `q_keywords`. Check each candidate's returned employer before treating it as a
  match.
- **Candidate search, not guaranteed identity resolution:** several plausible
  people may be returned. Report ambiguity rather than silently choosing.
- **Public professional scope:** this search does not request private contact
  information. Use a separately reviewed capability for an authorized contact
  lookup.
- **Synchronous:** one paid POST returns the candidates directly; do not poll.
- **Paid failures may charge:** never auto-retry; inspect history first.
- The previous Clado `POST /clado/search` route no longer serves a 402; do not
  reintroduce it.

## Validation

> `--chain base` in the probe command below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/person-lookup`
- Free live gate:

  ```bash
  SELAT_ROUTER_URL=https://router.selat.ai \
    selat skill verify ./skills/person-lookup \
    --name "Jensen Huang" \
    --company "NVIDIA" \
    --live-probe
  ```

- Single-endpoint probe:

  ```bash
  SELAT_ROUTER_URL=https://router.selat.ai \
    selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-search" \
    --body '{"q_keywords":"Jensen Huang NVIDIA","per_page":5,"page":1}' \
    --chain base --max-amount 0.0075 --probe-only --live-probe
  ```

- Missing-input gate: omit `name` and `company` separately and confirm each
  command fails before any endpoint call.
- Paid smoke test: use one requester-approved public professional only after a
  fresh quote, explicit approval, a spendable Gateway balance, and an armed
  session budget.

## References

- `manifest.json` — machine-readable bounded payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — request schema, live
  quote, scope, and free probe.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

_Third-party: "Apollo" is a trademark of its respective owner; this skill calls their public API and is not affiliated with or endorsed by them._
