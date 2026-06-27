---
name: enrich-waterfall
description: Use this skill when the user wants to enrich a person or company from a partial identifier — e.g. "enrich this email", "find the work email and phone for X at Y", "who is this person", "build a lead profile for stripe.com", "company enrichment for this domain", "find their LinkedIn / Twitter", "get me funding and hiring signals", "waterfall enrichment", "verify this email". Runs a cheapest-first B2B enrichment waterfall — resolve the person sub-cent, anchor the company, fan out to tech / signals / social, escalate to premium contact reveals (ContactOut, People Data Labs identify, Sixtyfour phone) only on gaps, then verify the email. Every step is paid routed (MPP) through the SELAT Router; the selat CLI compiles each manifest step into a payment.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Every step is routed, so a reachable SELAT Router (SELAT_ROUTER_URL) is required for all calls.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# enrich-waterfall

## When To Use

Use when the caller has a **partial identifier** — an email, a name + company, a
domain, or a LinkedIn URL — and wants a fuller person and/or company profile, with
contact details (email + phone), tech stack, company signals (funding / news /
hiring), and social presence.

The defining behavior is **cheapest-first with escalation**: spend sub-cent calls to
resolve identity, anchor the company, and fan out to enrichment slices; only reach
for the premium dollar-class reveals (ContactOut, PDL identify, Sixtyfour phone,
Coresignal multi-source) when the cheap tiers leave a gap; verify the email last.

Do **not** use this for crypto/market price lookups (see `market-snapshot`,
`allium-price`) or for a single one-off enrichment call (call that merchant directly).

## Workflow

1. Install: `selat skill install enrich-waterfall`
2. Run: `selat skill run enrich-waterfall [--email ...] [--name ...] [--firstName ...] [--lastName ...] [--domain ...] [--company ...] [--linkedinUrl ...]`
3. The CLI compiles each manifest step into a `selat-pay` call, runs the steps in
   order, and prints a per-step `status` + cost summary. Every step is **routed**
   through the SELAT Router (MPP).

### The waterfall (cheapest-first, with stop/escalation conditions)

Steps in `manifest.json` are ordered cheapest-first by tier. Walk them in order and
**stop climbing a branch the moment you have what you need**:

1. **resolve** (≈ $0.01 each) — Tomba enrich / people-find / combined-find by email,
   Apollo `people/match`, Ocean.io `enrich/person`, Fiber `email-to-person`. Goal:
   turn the input into a person record + company handle (domain, LinkedIn). **Stop
   condition:** once a resolve call returns a confident match with a domain and a
   LinkedIn URL, you do not need the remaining resolve calls.

2. **anchor** (≈ $0.01–$0.08) — pin the company from the domain: Apollo / Coresignal /
   Company Enrich / Ocean.io / PredictLeads / Aviato company enrich, plus the
   email-finder calls (Tomba, Hunter, Sixtyfour) that derive the canonical address
   from domain + name. **Stop condition:** one good firmographic record + one
   candidate email is enough to move on.

3. **social / signals / tech** (≈ $0.01–$0.12) — enrichment fan-out, run **only the
   slices the caller asked for**:
   - *social* — Fiber Twitter/Instagram/TikTok/YouTube/LinkedIn-posts, Aviato posts.
   - *signals* — PredictLeads financing/news/jobs/connections, Aviato funding/
     investments/employees/founders/acquisitions, Company Enrich workforce.
   - *tech* — Tomba / BuiltWith / Brand.dev / PredictLeads technology detections.

4. **escalate** (≈ $0.04–$0.70) — premium reveals, run **only on gaps**: if the cheap
   tiers did not surface a usable work/personal email or a phone, climb to ContactOut
   `people/enrich` / `email/enrich` / `people/linkedin`, People Data Labs `identify`,
   Sixtyfour `find-phone`, or Coresignal multi-source. **Escalation condition:** a
   missing-or-low-confidence email/phone after tiers 1–3. If you already have a
   verified work email and no phone was requested, **skip this tier entirely.**

5. **verify** (≈ $0.008–$0.02) — last: Hunter `email-verifier` / Fiber
   `validate-email` confirm the chosen email is deliverable before shipping it.

Per-step caps come from each step's `maxAmount`; the full-run cap is `maxAmount`
`$6.00` at the manifest top level (summed per-step caps ≈ $5.16). Running every
branch is rarely necessary — a typical resolve + anchor + one escalate + verify is
well under a dollar.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | no | `""` | Person work email — primary resolve key (Tomba / Apollo / PDL / Ocean.io / Fiber reverse). |
| `name` | no | `""` | Full name — ContactOut/Ocean.io/PDL people enrich, Fiber social search. |
| `firstName` | no | `""` | First name — Tomba/Hunter/Sixtyfour email-finder, Apollo/Ocean.io/PDL match. |
| `lastName` | no | `""` | Last name — paired with firstName + domain for email-finder/match. |
| `domain` | no | `""` | Company domain — primary key for every company-anchor, tech, and signals call. |
| `company` | no | `""` | Company name — fallback anchor when no domain; input to people-match / lead-enrich. |
| `linkedinUrl` | no | `""` | Person/company LinkedIn or profile URL — Coresignal (URL-encoded into path), ContactOut, Fiber, Aviato. |

All params are optional, but **at least one identifier must be supplied** — supply
the strongest you have (email > LinkedIn URL > domain + name > company). Each step
only fires usefully when its required `${...}` placeholders are filled; pass empty
strings for the rest.

Outputs: per-step JSON from each merchant (person record, firmographics, contact
points, tech list, signal arrays, social profiles) plus the CLI's per-step
`status`/cost summary. Treat the highest-confidence email + phone across the tiers as
the canonical result, and ship only an email that passed the verify tier.

## Gotchas

- **Every step is routed** — `SELAT_ROUTER_URL` must be set and the router reachable;
  there is no direct-rail fallback in this skill.
- **Don't run all 68 steps.** The manifest is a menu ordered cheapest-first; the
  agent walks it and stops per the stop/escalation conditions above. Blindly running
  every branch wastes money and can approach the $6.00 cap.
- **Coresignal path encoding** — the employee collect endpoints put the profile URL in
  the **path** (`/v2/employee_clean/collect/${linkedinUrl}`); URL-encode it.
- **Duplicate merchants are intentional** — ContactOut, Company Enrich and PredictLeads
  appear in more than one group because different input keys (email vs. LinkedIn vs.
  domain) reach them by different paths.
- **Escalate is expensive** — ContactOut `people/enrich` ($0.55), PDL `identify` ($0.70)
  and Sixtyfour `find-phone` ($0.30) dominate the cost; gate them behind a real gap.
- **Verify last, not first** — verifying an email you're about to discard wastes the call.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe any step for free with `selat-pay`'s `--probe-only` (sends the 402 preflight,
  pays nothing):
  - `selat-pay GET "https://api.tomba.io/v1/enrich?email=test@stripe.com" --chain base --probe-only`
  - `selat-pay GET "https://api.apollo.io/api/v1/organizations/enrich?domain=stripe.com" --chain base --probe-only`
  - `selat-pay POST "https://api.contactout.com/v1/people/enrich" --body '{"full_name":"Patrick Collison","company":["Stripe"],"include":["work_email","phone"]}' --chain base --probe-only`
- Validate the recipe locally: `python3 -c "import json; json.load(open('manifest.json'))"`.
- A clean run prints `status=200` for the steps that fired and a per-step cost
  summary; the routed steps each show a SELAT Router hop.

## References

- `manifest.json` — the machine-readable, cheapest-first payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — every endpoint, price, tier, and source.
- `evals/evals.json` — trigger + output-quality evals.
- selat-pay — https://github.com/SELAT-AI/selat-pay
