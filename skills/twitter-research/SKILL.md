---
name: twitter-research
description: Use this skill for read-only Twitter/X research on the SELAT-native Twitter API (catalog.selat.ai) — profiles, recent tweets, mentions, followers, tweet details/replies/retweeters, topic search, and trends. Triggers on "who is @X on Twitter", "recent tweets from X", "who's mentioning X", "how did this tweet do / who replied / who retweeted", "search X for <topic>", "is <topic> trending". It is a curated 9-endpoint MENU — pick only the endpoints a request needs, do not run all of them. For topic monitoring alone this skill's search+trends steps cover it; for cross-platform entity footprints use `account-intel`; for topic sentiment fused with Reddit + web use `social-intel`.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Every step settles x402 via Circle Gateway through the SELAT Router, so a reachable SELAT Router (SELAT_ROUTER_URL) is required. `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: x402 via Circle Gateway
  kind: multi
---

# twitter-research

A read-only research toolkit for Twitter/X, backed by SELAT's own first-party
Twitter API (`catalog.selat.ai`). The manifest lists **9 curated GET endpoints
as a priced menu** (~$0.001 each); the agent picks the ones a given request
actually needs. No API keys, keyless pay-per-call.

## When To Use

Use for read/lookup tasks on X: profiling an account, pulling someone's recent
posts, seeing who mentions or follows them, analyzing how a specific tweet
landed (replies + retweeters), searching for a topic/keyword, or checking
regional trends. Read-only — it does not post, like, or follow, and cannot see
protected/private accounts.

## Workflow

> **This is a menu, not a pipeline. Do NOT run all 9 steps.** Select only the
> endpoint(s) the request needs, tell the user the cost, then invoke just those.
> A blind `selat skill run` would pay for all 9 (~$0.009) and return mostly
> irrelevant data — always drive selection from the intent below.

**Route the request to the smallest set of endpoints, then report back in plain
language.** Confirm cost before spending — "this is N SELAT-native Twitter reads,
about $0.00N — go ahead?"

| The user wants… | Run | Params |
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

- Escalate only as needed: start with the one endpoint that answers the ask; add
  a second (e.g. `user/mentions` after `user/info`) only if the user wants more.
- `advanced_search` accepts the full X operator surface in `query` (`from:`,
  `to:`, `#tag`, `$CASHTAG`, `min_faves:`, `since:`/`until:`, `lang:en`).
- Then **synthesize for the user in plain language** — the answer, not the JSON.
  Keep endpoint URLs, wallet addresses, and tweet IDs out of what you relay; lead
  with the finding and the dollar cost.

## Inputs And Outputs

| Param | Required | Default | Used by |
|---|---|---|---|
| `handle` | no | `openai` | `user/info`, `user/last_tweets`, `user/mentions`, `user/followers` |
| `query` | no | `AI agents` | `tweet/advanced_search` |
| `tweetId` | no | `20` | `tweets`, `tweet/replies`, `tweet/retweeters` |
| `woeid` | no | `1` | `trends` |

Output: per-selected-step JSON, which the agent distills into a short answer for
the user (profile summary, tweet list with engagement, mention/follower read,
tweet-reception breakdown, topic chatter, or trend list — whichever was asked).

## Gotchas

- **Menu, not pipeline — select, don't run-all.** The 9 steps are independent
  reads; only `selat skill run <name>` executes every one. In agent use, invoke
  just the endpoints the intent maps to (see the routing table).
- **Params are per-endpoint.** `handle` drives the `user/*` reads, `tweetId` the
  `tweet/*` reads, `query` the search, `woeid` the trends. Passing an unused
  param is harmless; a step only uses the params in its URL.
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

- `selat skill validate ./skills/twitter-research` → passes.
- `selat skill verify ./skills/twitter-research` → all 9 steps reachable and
  ≤ `maxAmount` (writes the verify receipt). `--pay` runs all 9 as a settled
  smoke test (~$0.009); in normal use you'd pay only the selected subset.
- `npm run validate` → 0 errors (whole-repo + `index.json` consistency).

Free single-step probe (what `verify` runs per step — no wallet, no spend):

```bash
selat-pay GET "https://catalog.selat.ai/twitter/user/info?userName=openai" \
  --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=AI%20agents" \
  --chain base --probe-only
# success prints: detected x402=yes, mode=routed-x402, price=$0.001000 on eip155:8453
```

## References

- [`references/endpoints.md`](references/endpoints.md) — the 9 endpoints, params, rails, and live prices.
