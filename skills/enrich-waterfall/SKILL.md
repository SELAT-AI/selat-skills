---
name: enrich-waterfall
description: Use this skill when the user wants to enrich a person or company from a partial identifier — e.g. "enrich this email", "find the work email and phone for X at Y", "who is this person", "build a lead profile for stripe.com", "company enrichment for this domain", "find their LinkedIn / Twitter", "get me funding and hiring signals", "waterfall enrichment", "verify this email". Runs a cheapest-first B2B enrichment waterfall — resolve the person sub-cent, anchor the company, fan out to signals / social, escalate to premium contact reveals (Clado contacts, Clado people search) only on gaps, then verify the email. Nearly every step is paid routed (MPP) through the SELAT Router; the AIsa X/Twitter step is a direct Circle x402 call. The selat CLI compiles each manifest step into a payment.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). All steps except the AIsa X/Twitter call are routed, so a reachable SELAT Router (SELAT_ROUTER_URL) is required; the AIsa step settles direct x402 via Circle Gateway.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
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
for the premium reveals (Clado contacts, Clado natural-language people search)
when the cheap tiers leave a gap; verify the email last.

Do **not** use this for crypto/market price lookups (see `market-snapshot`,
`allium-price`) or for a single one-off enrichment call (call that merchant directly).

## Workflow

1. Install: `selat skill install enrich-waterfall`
2. Run: `selat skill run enrich-waterfall [--email ...] [--name ...] [--firstName ...] [--lastName ...] [--domain ...] [--company ...] [--linkedinUrl ...] [--organizationId ...]`
3. The CLI compiles each manifest step into a `selat-pay` call, runs the steps in
   order, and prints a per-step `status` + cost summary. Every step is **routed**
   through the SELAT Router (MPP) except the AIsa X/Twitter profile step, which is
   a **direct** Circle x402 call (Circle Gateway-batched).

### The waterfall (cheapest-first, with stop/escalation conditions)

Steps in `manifest.json` are ordered cheapest-first by tier (and cheapest-first
within each tier, using live prices probe-verified 2026-07-10). Walk them in order
and **stop climbing a branch the moment you have what you need**:

1. **resolve** ($0.0084–$0.024) — Apollo `people-enrichment` (one call takes email,
   name+company, domain and LinkedIn URL together), Hunter `email-enrichment` /
   `combined-enrichment` by email, Clado `linkedin-profile` by LinkedIn URL. Goal:
   turn the input into a person record + company handle (domain, LinkedIn). **Stop
   condition:** once a resolve call returns a confident match with a domain and a
   LinkedIn URL, you do not need the remaining resolve calls.

2. **anchor** ($0.0053–$0.014) — pin the company: Apollo `org-search` by name (the
   no-domain fallback), Abstract Company Enrichment `lookup` and Apollo
   `org-enrichment` by domain, Hunter `company-enrichment`, plus Hunter
   `email-finder` to derive the canonical address from domain + name. Tech stack
   (`technology_names`), headcount and industry/SIC now ride along with these
   anchor calls — there is no separate tech tier. **Capture the Apollo
   `organization_id`** from `org-enrichment`/`org-search`: the job-postings signals
   step needs it. **Stop condition:** one good firmographic record + one candidate
   email is enough to move on.

3. **social / signals** ($0.0004–$0.063) — enrichment fan-out, run **only the
   slices the caller asked for**:
   - *social* — AIsa X/Twitter profile (direct x402, $0.00044), Clado `scrape` for
     LinkedIn person/company posts, StableSocial Instagram/TikTok profiles by handle.
   - *signals* — Apollo `job-postings` (needs `organizationId` from the anchor
     tier), Brave news search for company news and funding rounds, Diffbot KG
     `enhance` for the organization record (funding rounds, investors and business
     connections all come back in that one call).

4. **escalate** ($0.045–$0.32) — premium reveals, run **only on gaps**: if the
   cheap tiers did not surface a usable email or a phone, climb to Clado
   `contacts` (contact enrichment incl. phone, from a LinkedIn URL) or Clado
   `search` (synchronous natural-language people search — e.g. resolving a person
   from an X/Twitter handle). **Escalation condition:** a missing-or-low-confidence
   email/phone after tiers 1–3. If you already have a verified work email and no
   phone was requested, **skip this tier entirely.**

5. **verify** ($0.0084) — last: Hunter `email-verifier` confirms the chosen email
   is deliverable before shipping it.

Per-step caps come from each step's `maxAmount` (~10x each live price,
$0.10–$1.00); the manifest top-level fallback `maxAmount` is `$1.00`. Live prices for all
20 steps sum to ≈ $0.74, and running every branch is rarely necessary — a typical
resolve + anchor + one escalate + verify is well under ten cents.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `email` | no | `""` | Person work email — primary resolve key (Hunter email/combined enrichment, Apollo people enrichment). |
| `name` | no | `""` | Full name — also used as the social handle for the AIsa X/Twitter, StableSocial Instagram/TikTok and Clado handle-search steps. |
| `firstName` | no | `""` | First name — Hunter email-finder, Apollo people enrichment. |
| `lastName` | no | `""` | Last name — paired with firstName + domain for email-finder/enrichment. |
| `domain` | no | `""` | Company domain — primary key for the Abstract lookup, Apollo org-enrichment and Hunter company calls. |
| `company` | no | `""` | Company name — Apollo org-search fallback when no domain; query seed for Brave news and Diffbot KG. |
| `linkedinUrl` | no | `""` | Person/company LinkedIn URL — Clado linkedin-profile, contacts and scrape (sent in the JSON body; no path encoding). |
| `organizationId` | no | `""` | Apollo organization id — returned by the org-enrichment/org-search anchor steps; required by the job-postings signals step. |

All params are optional, but **at least one identifier must be supplied** — supply
the strongest you have (email > LinkedIn URL > domain + name > company). Each step
only fires usefully when its required `${...}` placeholders are filled; pass empty
strings for the rest.

Outputs: per-step JSON from each merchant (person record, firmographics, contact
points, tech list, signal arrays, social profiles) plus the CLI's per-step
`status`/cost summary. Treat the highest-confidence email + phone across the tiers as
the canonical result, and ship only an email that passed the verify tier.

## Gotchas

- **All routed except one** — `SELAT_ROUTER_URL` must be set and the router
  reachable for the 19 routed steps; the AIsa X/Twitter step is the only direct
  x402 call and settles via Circle Gateway.
- **Don't run all 20 steps.** The manifest is a menu ordered cheapest-first; the
  agent walks it and stops per the stop/escalation conditions above. Blindly running
  every branch wastes money (≈ $0.74 for everything) even within the per-step caps.
- **`organizationId` is a chained input** — Apollo `job-postings` takes an
  organization id, not a domain; pull it from the Apollo org-enrichment/org-search
  response before firing the hiring-signals step.
- **Deliberate near-duplicates** — the two Brave `news-search` steps hit the same
  endpoint with different queries (`"${company} news"` vs `"${company} funding
  round"`); they are separate on purpose. The Diffbot KG `enhance` call covers
  funding rounds, investors and connections in one response — do not call it once
  per slice.
- **Escalate is expensive** — Clado `search` ($0.32) and Clado `contacts` ($0.045)
  dominate the cost; gate them behind a real gap.
- **Verify last, not first** — verifying an email you're about to discard wastes the call.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe any step for free with `selat-pay`'s `--probe-only` (sends the 402 preflight,
  pays nothing):
  - `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-enrichment" --body '{"email":"test@stripe.com"}' --chain base --probe-only`
  - `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/org-enrichment" --body '{"domain":"stripe.com"}' --chain base --probe-only`
  - `selat-pay POST "https://clado.mpp.paywithlocus.com/clado/contacts" --body '{"linkedin_url":"https://linkedin.com/in/williamhgates"}' --chain base --probe-only`
  - `selat-pay GET "https://api.aisa.one/apis/v2/twitter/user/info?userName=patrickc" --chain base --probe-only`
- Validate the recipe locally: `python3 -c "import json; json.load(open('manifest.json'))"`.
- A clean run prints `status=200` for the steps that fired and a per-step cost
  summary; the routed steps each show a SELAT Router hop.

## References

- `manifest.json` — the machine-readable, cheapest-first payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — every endpoint, price, tier, and source.
- `evals/evals.json` — trigger + output-quality evals.
- selat-pay — https://github.com/SELAT-AI/selat-pay
