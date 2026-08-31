---
name: find-twitter-influencers
description: Use this skill when the user wants a ranked discovery list of public Twitter/X creators for one company, brand, product, or niche—for example, "find fintech creators on X", "who should this brand partner with", or "build an evidence-based influencer shortlist". It runs a fixed five-call, read-only bundle covering brand context, independent web roundups, Twitter account search, and current topical authors. Before payment, require coherent company/domain/search inputs, free-verify all five calls, disclose the live total and cumulative cap, and obtain explicit approval. Do not use for one known profile, contact-data lookup, bulk outreach, messaging, posting, or follower manipulation.
license: Apache-2.0
compatibility: "Requires the selat CLI and selat-pay with a funded Circle Agent Wallet for paid runs. All five calls currently traverse the SELAT Router: three as routed MPP and two as routed x402. `selat skill verify --live-probe` is free and needs no funded wallet."
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: mixed
  kind: multi
---

# find-twitter-influencers

## When To Use

Use this skill to discover and rank **public Twitter/X influencer candidates**
for one known company and one defined niche. It combines:

- company context from a name and matching domain;
- independent web roundups that mention relevant creators;
- Twitter account search for profile-level candidates; and
- current Twitter topic search for active authors and observed engagement.

The result is a research shortlist, not an outreach list. It does not purchase
email addresses or phone numbers, message anyone, follow accounts, or post on X.
If the user later selects a candidate and has a legitimate need for business
contact enrichment, treat that as a separate workflow with a fresh quote,
privacy review, and explicit approval.

Do not use this five-call bundle for one known account or one simple Twitter
search. Use `twitter-research` or a smaller discovered endpoint instead.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install find-twitter-influencers
   ```

2. Collect all five inputs and confirm they describe one coherent campaign:

   - `company`: company or brand name;
   - `domain`: bare domain for the same company;
   - `webQuery`: independent roundup/listicle search for the niche;
   - `userQuery`: concise Twitter account-search keywords; and
   - `tweetQuery`: current topic query, optionally using X search operators.

   The queries should target the same audience and niche as the company. Do not
   silently reuse placeholder fintech, AI, or company data for another request.

3. Probe all five payment challenges for free:

   ```bash
   selat skill verify ~/.config/selat/skills/find-twitter-influencers \
     --company "Acme Pay" \
     --domain acme.com \
     --webQuery "best fintech payments Twitter X creators to follow" \
     --userQuery "fintech payments" \
     --tweetQuery "(fintech OR payments) min_faves:50 lang:en" \
     --live-probe
   ```

4. Show every live quote, the expected cumulative total, and the sum of the
   per-step caps. Propose a cumulative session budget no higher than that cap
   sum and wait for explicit approval. Verification without `--pay` is free.

5. Only after approval and a spendable Gateway balance, arm the approved
   cumulative budget, run the fixed bundle once, and disarm it after success or
   failure:

   ```bash
   selat budget start --amount <approved-cumulative-cap>
   selat skill run find-twitter-influencers \
     --company "Acme Pay" \
     --domain acme.com \
     --webQuery "best fintech payments Twitter X creators to follow" \
     --userQuery "fintech payments" \
     --tweetQuery "(fintech OR payments) min_faves:50 lang:en"
   selat budget stop
   ```

The CLI runs all five manifest steps and continues after an individual failure.
Inspect per-step results and payment history; a final partial failure does not
mean earlier calls were uncharged. Never retry until transaction state is
checked, prices are re-probed, and the retry is separately approved.

## Fixed Steps

1. **Brand context by name** — bounded company search for the supplied name.
2. **Brand context by domain** — firmographics for the matching domain.
3. **Independent roundup discovery** — ten web results with bounded page text.
   Search for third-party lists and roundups; Twitter profile pages are not
   reliably indexed by this provider.
4. **Twitter user search** — public accounts matching the concise `userQuery`.
5. **Twitter topic search** — latest public posts matching `tweetQuery`, used to
   identify active authors and observed post engagement.

These calls are independent. Candidate handles returned by one step are not
automatically sent into another endpoint. The agent must normalize, correlate,
deduplicate, and score the returned evidence after the run.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `company` | yes | none | Company or brand whose audience and positioning guide fit. |
| `domain` | yes | none | Matching bare company domain. |
| `webQuery` | yes | none | Search for independent creator roundups in the target niche. |
| `userQuery` | yes | none | Concise keywords for Twitter account search. |
| `tweetQuery` | yes | none | Current Twitter topic query; may include supported X operators. |

Normalize handles by removing a leading `@` and comparing case-insensitively.
Keep an evidence record for each candidate and rank only what the paid results
actually support. Recommended score:

- niche and audience relevance: 35%;
- observed content quality and topical consistency: 20%;
- observed engagement on returned posts: 20%;
- independent roundup recurrence: 15%; and
- explicit brand fit: 10%.

Do not invent an engagement rate when impressions or audience denominators are
missing. Do not let follower count alone dominate ranking. Mark a handle found
only in a web article as an **unverified lead** until a Twitter result
corroborates it.

Return:

1. campaign scope and retrieval time;
2. a ranked candidate table with handle, public profile evidence, topical fit,
   observed engagement examples, independent-source evidence, score, and
   limitations;
3. unverified leads in a separate section;
4. duplicates, conflicts, and excluded candidates with reasons; and
5. per-step status and final dollar cost.

The skill retrieves one result page per discovery source and cannot guarantee a
requested count such as 20 qualified creators. Pagination or candidate-specific
profile deep-dives are additional paid calls and require a new quote and
approval.

## Rails And Costs

- Company-name search, company-domain enrichment, and web roundup search are
  currently `routed-mpp` over MPP on Tempo.
- Twitter user and topic searches are currently `routed-x402` via Circle
  Gateway.
- Every current step requires a reachable `SELAT_ROUTER_URL`.

`maxAmount` is a per-call ceiling, not a price or cumulative run cap. The
manifest's five per-step caps total **$0.044**; the top-level `$0.02` is only a
fallback for a step without its own override. A separately armed session budget
provides the cumulative limit.

The free live probe on 2026-08-30 quoted `$0.00525`, `$0.012862`, `$0.00525`,
`$0.001`, and `$0.001`, for an expected total of **$0.025362**. Re-probe before
every paid run because prices and modes can change.

## Gotchas

- **Fixed pipeline, not a menu.** `selat skill run` always executes all five
  calls. Use a smaller workflow if the user needs only one source.
- **No inter-step dataflow.** The agent correlates results; the runner does not
  fetch a profile for every handle found in web or tweet search.
- **No automatic contact enrichment.** Email/phone lookup was intentionally
  removed from the mandatory discovery run. Obtain separate approval only for
  selected candidates and a legitimate use.
- **Web search is not Twitter search.** Use web results for independent roundup
  evidence, not as proof that an account is current or authentic.
- **Query inputs differ.** `userQuery` is a concise account keyword;
  `tweetQuery` supports X operators and is sorted by `Latest` in this manifest.
- **Public, read-only evidence only.** Do not infer sensitive traits, scrape
  protected accounts, send outreach, or treat technical contactability as
  consent.
- **A paid application error may still charge.** Check history before retrying.

## Validation

- Static:
  `selat skill validate ./skills/find-twitter-influencers`
- Live gate, free:
  `selat skill verify ./skills/find-twitter-influencers --company "Acme Pay" --domain acme.com --webQuery "best fintech payments Twitter X creators to follow" --userQuery "fintech payments" --tweetQuery "(fintech OR payments) min_faves:50 lang:en" --live-probe`
- Paid verification: only after fresh quotes, explicit approval, and an armed
  cumulative session budget, add `--pay`; each call may settle independently.
- Single-step probes remain documented in `references/endpoints.md`.

## References

- `manifest.json` — machine-readable fixed payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — request schemas,
  current modes/prices, and interpretation limits.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Provider and product names are used only for endpoint identification. This
skill is not affiliated with X or the other providers it calls.
