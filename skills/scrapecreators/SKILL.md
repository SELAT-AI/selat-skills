---
name: scrapecreators
description: Use this skill for a comprehensive, read-only public social-media dossier on one coherent target across Twitter/X, LinkedIn, Instagram, and TikTok. It runs a fixed 11-call bundle covering account profiles, recent posts, one supplied Twitter post, one supplied LinkedIn post, a LinkedIn company page, a relevant TikTok hashtag, and a regional TikTok trending feed. Before payment, require all nine target identifiers, free-verify every call, disclose the live total and cumulative cap, and obtain explicit approval. Do not use for a one-platform lookup, private or protected content, contact enrichment, outreach, posting, following, or engagement manipulation.
license: Apache-2.0
compatibility: "Requires the selat CLI and selat-pay with a funded Circle Agent Wallet for paid runs. All 11 calls currently traverse the SELAT Router: three as routed x402 and eight as routed MPP. `selat skill verify --live-probe` is free and needs no funded wallet."
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: mixed
  kind: multi
---

# scrapecreators

## When To Use

Use this skill when the user needs one **comprehensive public social-media
dossier** that deliberately spans Twitter/X, LinkedIn, Instagram, and TikTok.
It retrieves public profile and content evidence for one coherent target and
adds a relevant TikTok hashtag plus a region-specific trending baseline.

This is a fixed, paid bundle—not an endpoint menu. Do not use it for one simple
profile or post lookup; choose the smallest matching endpoint or a narrower
skill instead. It does not retrieve protected/private content, reveal contact
details, send messages, post, follow, like, or otherwise mutate an account.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install scrapecreators
   ```

2. Collect all nine required inputs and verify that they describe one coherent
   research target:

   - `twitterHandle` and `tweetId`;
   - `linkedinProfileUrl`, `linkedinPostUrl`, and `linkedinCompanyUrl`;
   - `instagramHandle`;
   - `tiktokHandle`, `tiktokHashtag`, and `region`.

   Handles may differ across platforms. Remove leading `@` and `#` characters.
   Confirm that the tweet and LinkedIn post are public and relevant to the same
   subject; do not substitute unrelated examples or placeholders.

3. Probe every payment challenge for free:

   ```bash
   selat skill verify ~/.config/selat/skills/scrapecreators \
     --twitterHandle "satyanadella" \
     --tweetId "1632748758613241857" \
     --linkedinProfileUrl "https://www.linkedin.com/in/satyanadella/" \
     --linkedinPostUrl "https://www.linkedin.com/posts/satyanadella_its-been-a-busy-few-weeks-between-today-activity-7323480567562276865-F2mk" \
     --linkedinCompanyUrl "https://www.linkedin.com/company/microsoft/" \
     --instagramHandle "microsoft" \
     --tiktokHandle "microsoft" \
     --tiktokHashtag "microsoft" \
     --region "US" \
     --live-probe
   ```

4. Show the 11 current live quotes, their expected cumulative total, and the
   sum of all per-step caps. Wait for explicit approval of a cumulative session
   budget no higher than the cap sum. A free verification is not evidence that
   a particular public identity will return useful provider data.

5. After approval and a spendable Gateway balance, arm only the approved
   cumulative budget, run the fixed bundle once, and disarm the budget after
   success or failure:

   ```bash
   selat budget start --amount <approved-cumulative-cap>
   selat skill run scrapecreators \
     --twitterHandle "<twitter-handle>" \
     --tweetId "<numeric-tweet-id>" \
     --linkedinProfileUrl "<linkedin-person-url>" \
     --linkedinPostUrl "<linkedin-post-or-article-url>" \
     --linkedinCompanyUrl "<linkedin-company-url>" \
     --instagramHandle "<instagram-handle>" \
     --tiktokHandle "<tiktok-handle>" \
     --tiktokHashtag "<hashtag-without-#>" \
     --region "<two-letter-region>"
   selat budget stop
   ```

The CLI executes every manifest step independently and continues after an
individual failure. Inspect per-step results and payment history; a partial
failure does not mean earlier calls were uncharged. Never retry until history
is checked, prices are re-probed, and the retry is separately approved.

## Fixed Steps

1. Twitter/X public account profile.
2. Twitter/X recent public posts for the same handle.
3. Details for one supplied public tweet ID.
4. LinkedIn public person profile.
5. One supplied public LinkedIn post or article.
6. LinkedIn public company page.
7. Instagram public profile, including the provider's recent-profile context.
8. One page of public Instagram posts in trimmed form.
9. TikTok public profile metadata.
10. One page of public TikTok posts for a relevant hashtag and region.
11. A trimmed TikTok trending feed for the same region.

The calls do not pass data between steps. The agent must correlate identifiers,
normalize returned records, and synthesize the final report after the run.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `twitterHandle` | yes | none | Public Twitter/X handle without `@`. |
| `tweetId` | yes | none | Numeric public tweet ID, not a URL. |
| `linkedinProfileUrl` | yes | none | Full public LinkedIn person-profile URL. |
| `linkedinPostUrl` | yes | none | Full public LinkedIn post or article URL. |
| `linkedinCompanyUrl` | yes | none | Full public LinkedIn company-page URL. |
| `instagramHandle` | yes | none | Public Instagram handle without `@`. |
| `tiktokHandle` | yes | none | Public TikTok handle without `@`. |
| `tiktokHashtag` | yes | none | Relevant hashtag without `#`. |
| `region` | yes | none | Two-letter TikTok proxy/feed region such as `US`. |

Return:

1. target identity and retrieval time;
2. a platform-by-platform evidence table with source URL, profile/content facts,
   observed engagement fields, and limitations;
3. cross-platform consistencies and conflicts;
4. TikTok hashtag and regional-trend context clearly separated from facts about
   the target account; and
5. per-step status plus final settled dollar cost.

Do not imply that the TikTok region filter limits results to creators located
in that region: it selects the provider's proxy/feed context. Do not calculate
engagement rates when the required denominator is absent, infer sensitive
traits, or treat public availability as consent for outreach.

## Rails And Costs

- The three SELAT-native Twitter calls currently resolve as `routed-x402` via
  Circle Gateway at about `$0.001` each.
- The eight synchronous Scrape Creators calls currently resolve as
  `routed-mpp` over MPP on Tempo at about `$0.021` each.
- Every step requires a reachable `SELAT_ROUTER_URL`.

`maxAmount` is a per-call ceiling, not a price or cumulative run cap. The three
Twitter caps are `$0.002` each and the eight Scrape Creators caps are `$0.03`
each, for a cumulative cap sum of **$0.246**. The top-level `$0.03` is only a
fallback for a future step without its own override.

The free live probe on 2026-08-31 quoted an expected total of **$0.171**. Always
re-probe before payment because prices, rails, and endpoint health can change.

## Gotchas

- **Fixed pipeline.** `selat skill run` executes all 11 calls; there is no
  platform selector or conditional branch in the current manifest runner.
- **No inter-step dataflow.** Returned user IDs, cursors, and URLs are not
  automatically inserted into later calls.
- **Only the first page is included.** Additional Instagram/TikTok pages are
  separate calls. Re-probe and obtain approval before pagination.
- **Identifiers are platform-specific.** Do not assume one handle is shared
  across Twitter, Instagram, and TikTok.
- **LinkedIn URL types matter.** Person, post/article, and company endpoints
  require their matching URL type.
- **Public, read-only scope.** Protected/private records and account mutations
  are out of scope.
- **A paid application error may still charge.** Check history before retrying.

## Validation

- Static: `selat skill validate ./skills/scrapecreators`
- Live gate, free: run the full `selat skill verify` command shown above with
  coherent public inputs and `--live-probe`.
- Paid verification: only after fresh quotes, explicit approval, and an armed
  cumulative session budget, add `--pay`; every call may settle independently.
- Provider request schemas and single-step free probes are documented in
  `references/endpoints.md`.

## References

- `manifest.json` — machine-readable fixed payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — request schemas,
  current modes/prices, and QC corrections.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Provider and product names are used only for endpoint identification. This
skill is not affiliated with X, LinkedIn, Instagram, TikTok, or Scrape Creators.
