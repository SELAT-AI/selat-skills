---
name: twitter-research
description: Use this skill when the user wants read-only Twitter/X research on the SELAT-native Twitter API (catalog.selat.ai) — profiles, recent tweets, mentions, followers, tweet details/replies/retweeters, topic search, and trends. Triggers on "who is @X on Twitter", "recent tweets from X", "who's mentioning X", "how did this tweet do / who replied / who retweeted", "search X for <topic>", "is <topic> trending". `selat skill run twitter-research` pays all 9 reads (~$0.009); for a narrower ask, pay only the reads you need with individual `selat-pay` calls. For cross-platform entity footprints use `account-intel`; for topic sentiment grounded in web search use `social-intel`.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay >= 0.12.0 (for `--live-probe`) with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Every step settles x402 via Circle Gateway through the SELAT Router, so a reachable SELAT Router (SELAT_ROUTER_URL) is required. `selat skill verify --live-probe` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: x402 via Circle Gateway
  kind: multi
---

# twitter-research

A read-only research toolkit for Twitter/X, backed by SELAT's own first-party
Twitter API (`catalog.selat.ai`). The manifest wires **9 GET reads** at $0.001
each. `selat skill run` always runs all 9 (about $0.009). When a request needs
only one or two reads, the agent pays just those with individual `selat-pay`
calls. No API keys, keyless pay-per-call.

## When To Use

Use for read/lookup tasks on X: profiling an account, pulling someone's recent
posts, seeing who mentions or follows them, analyzing how a specific tweet
landed (replies + retweeters), searching for a topic/keyword, or checking
regional trends. Read-only — it does not post, like, or follow, and cannot see
protected/private accounts.

## Workflow

> **`selat skill run twitter-research` runs all 9 steps, every time.** The
> runner has no step-selection flag. Any param you don't pass falls back to its
> default (`openai`, `AI agents`, tweet `20`, worldwide trends), so a full run
> also pays for reads you didn't ask about. Pick the path that fits the request.

1. Install: `selat skill install twitter-research`
2. **Map the request to the reads it needs** (table below), then tell the user
   the cost and wait for a yes — "this is N SELAT-native Twitter reads, about
   $0.00N — go ahead?"
3. **Run it one of two ways:**
   - **All 9 reads (~$0.009):** use this for a broad sweep, or when the request
     touches most of the table. Pass every param so no default leaks in:
     `selat skill run twitter-research --handle <handle> --query "<query>" --tweetId <id> --woeid <woeid>`
   - **Only the reads you need ($0.001 each):** pay each selected URL from the
     table in `references/endpoints.md` with its own `selat-pay` call. For example:
     `selat-pay GET "https://catalog.selat.ai/twitter/user/info?userName=<handle>" --chain <chain holding your Gateway balance> --max-amount 0.01`
     A paid `selat-pay` call needs an armed session budget (`selat budget start`).
     Its `--chain` names the chain holding your Gateway balance; don't hardcode
     one.
4. **Synthesize for the user in plain language**: give the answer, not the JSON.
   Lead with the finding and the dollar cost. Keep endpoint URLs, wallet
   addresses, and tweet IDs out of what you relay.

| The user wants… | Reads | Params |
|---|---|---|
| Who is @X / their profile & authority | `user/info` | `handle` |
| What X has posted lately | `user/last_tweets` | `handle` |
| Who's talking to/about X (reach) | `user/mentions` | `handle` |
| X's audience / follower sample | `user/followers` | `handle` |
| A profile deep-dive | `user/info` + `user/last_tweets` (+ `user/mentions`) | `handle` |
| What people are saying about a topic | `tweet/advanced_search` | `query` |
| Is a topic trending / regional trends | `trends` | `woeid` |
| Topic monitor (chatter + trending) | `tweet/advanced_search` + `trends` | `query`, `woeid` |
| A specific tweet's content & counts | `tweets` | `tweetId` |
| How a tweet was received | `tweets` + `tweet/replies` + `tweet/retweeters` | `tweetId` |

- Start with the one read that answers the ask. Add a second (e.g.
  `user/mentions` after `user/info`) only if the user wants more.
- `advanced_search` accepts the full X operator surface in `query` (`from:`,
  `to:`, `#tag`, `$CASHTAG`, `min_faves:`, `since:`/`until:`, `lang:en`).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `handle` | no | `openai` | Handle without `@`; used by `user/info`, `user/last_tweets`, `user/mentions`, `user/followers`. |
| `query` | no | `AI agents` | X search query; used by `tweet/advanced_search`. |
| `tweetId` | no | `20` | Numeric tweet ID; used by `tweets`, `tweet/replies`, `tweet/retweeters`. |
| `woeid` | no | `1` | Yahoo WOEID (`1` = worldwide); used by `trends`. |

Output: per-step JSON (all 9 on a full run, or just the reads you paid for),
which the agent distills into a short answer for
the user (profile summary, tweet list with engagement, mention/follower read,
tweet-reception breakdown, topic chatter, or trend list — whichever was asked).

## Gotchas

- **`selat skill run` pays all 9 reads.** The 9 steps are independent reads,
  but the runner executes every step and has no way to skip one. To pay for a
  subset, make the individual `selat-pay` calls (Workflow step 3).
- **Params are per-endpoint.** `handle` drives the `user/*` reads, `tweetId` the
  `tweet/*` reads, `query` the search, `woeid` the trends. On a full run, any
  param you omit uses its default, and that step still pays for the default
  target.
- **Tweet-id param names differ per endpoint (live API, not the OpenAPI):**
  `tweets` takes `tweet_ids` (snake_case, comma-separated batch); `tweet/replies`
  and `tweet/retweeters` take `tweetId` (camelCase). The OpenAPI's `tweet_id` for
  the latter two 400s (`"tweetId is required"`) — the manifest uses `tweetId`.
- **`woeid` is a Yahoo Where-On-Earth ID, not a country code** (`1` = worldwide).
- **Handles have no leading `@`.** Strip it before passing `handle` (the API param
  is `userName`; the manifest maps `${handle}` → `userName=`).
- **`tweets` batches — `tweet_ids` is comma-separated** (`20,21,22`). The manifest
  passes one id; hand-build the call for a batch.
- **Paginate via `cursor`.** `last_tweets`, `mentions`, `followers`, and the
  reply/retweeter reads return a `cursor`; to fetch the next page, issue a
  hand-built `selat-pay GET …&cursor=<token>` — each page is another ~$0.001.
  `cursor` is not a manifest param. Full per-param schema (pinned from
  `catalog.selat.ai/twitter/openapi.json`) is in `references/endpoints.md`.
- **All steps need the SELAT Router.** `catalog.selat.ai` settles x402 via Circle
  Gateway *through* the SELAT Router, so `SELAT_ROUTER_URL` must be reachable.
- **Read-only + public-only.** No posting/engagement; protected accounts error.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay`
> requires today — a probe reads a free, chain-independent quote and never
> settles. A real paid run resolves the settlement chain from your funded Circle
> Gateway balance, not the manifest.

- `selat skill validate ./skills/twitter-research` → passes.
- `selat skill verify ./skills/twitter-research --live-probe` → all 9 steps
  reachable and ≤ `maxAmount` (writes the verify receipt). Adding `--pay` runs
  all 9 as a settled smoke test (~$0.009).
- `npm run validate` → 0 errors (whole-repo + `index.json` consistency).

Free single-step probe (what `verify` runs per step — no wallet, no spend):

```bash
selat-pay GET "https://catalog.selat.ai/twitter/user/info?userName=openai" \
  --chain base --probe-only --live-probe
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=AI%20agents" \
  --chain base --probe-only --live-probe
# success prints: detected: x402=yes … mode=routed-x402, then price=$0.001000
```

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the 9 endpoints, params, rails, and live prices. Read it before building an individual `selat-pay` call.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
