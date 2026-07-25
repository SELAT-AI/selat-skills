---
name: twitter-topic-monitor
description: Use this skill when the user wants to monitor Twitter/X for a topic, keyword, cashtag, hashtag, or account activity — e.g. "what are people saying about AI agents on X?", "monitor $SOL chatter", "track mentions of our launch", "is #ethdenver trending?", "recent tweets about agentic payments with engagement", "watch what openai is posting about". Runs an X advanced search for the query (recent matching tweets with engagement) and pulls regional trending topics for context, via the SELAT-native Twitter API (catalog.selat.ai), paid per call as x402 via Circle Gateway. For a single account's profile + recent tweets use `twitter-profile-lookup` instead; for a cross-platform entity footprint use `account-intel`.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Both steps settle x402 via Circle Gateway through the SELAT Router, so a reachable SELAT Router (SELAT_ROUTER_URL) is required. `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: x402 via Circle Gateway
  kind: multi
---

# twitter-topic-monitor

Monitor Twitter/X for a **topic** — a keyword, cashtag, hashtag, phrase, or
search-operator query — by pulling recent matching tweets with engagement, then
grounding them against what's trending. Two paid reads on SELAT's own Twitter
API (`catalog.selat.ai`), ~$0.001 each, no API keys.

## When To Use

Use when the user wants social listening on a **subject** rather than one
account: brand/product monitoring, competitor or launch tracking, cashtag/ticker
chatter, hashtag or event coverage, or "what's the conversation about X right
now." For a single handle's profile and posts, use `twitter-profile-lookup`; for
a cross-platform (X + YouTube + web) entity brief, use `account-intel`; for
topic sentiment fused with Reddit + web, use `social-intel`.

## Workflow

Both steps are **x402 via Circle Gateway** reads on `catalog.selat.ai`. The
`selat` CLI compiles each manifest step into a `selat-pay` call, settles it
through the SELAT Router, runs the steps in order, and prints a per-step ✓/✗
summary. The full run is ~$0.002.

**Tell the user the cost before spending** — "monitoring X for '<query>' runs
two SELAT-native Twitter reads, about $0.002 total — go ahead?" — then run:

1. **Recent tweets on the topic** — `advanced_search` with the caller's
   `${query}`. Returns recent matching tweets with author, text, and
   like/retweet/reply/quote/view counts. Order the read as the primary signal.
   - Use the full X operator surface in `query` when the user's ask implies it:
     `from:`, `to:`, `#tag`, `$CASHTAG`, `min_faves:`, `since:`/`until:`,
     `-filter:replies`, `lang:en`. Escalate to a tighter query if the first
     read is noisy.
2. **Trending context** — `trends` for `${woeid}` (default worldwide). Returns
   the current trending topics for that region so you can say whether the
   query's terms are actually trending and surface adjacent trends.

Then **synthesize for the user in plain language**: the volume and tone of the
recent chatter, the 2–3 highest-engagement tweets (paraphrased, with rough
numbers), any notable accounts driving it, and whether the topic (or a related
term) is currently trending. Keep raw JSON, endpoint URLs, and tweet IDs out of
what you relay — lead with the read, not the plumbing.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `query` | yes | `AI agents` | Topic/keyword to monitor. Supports X search operators (`from:`, `$TICKER`, `#tag`, `min_faves:`, `since:`, `lang:`). |
| `woeid` | no | `1` | Region for trending context. `1` = worldwide, `23424977` = United States, `2459115` = New York City. |

Output: per-step JSON (a page of matching tweets with engagement; the region's
trend list), which the agent distills into a short topic-monitor brief — chatter
summary, top posts, notable voices, and trending-or-not — for the user.

## Gotchas

- **Quote the query.** Multi-word queries and operators (`from:openai AI`) must
  be URL-safe; the CLI substitutes `${query}` into the query string, so pass the
  whole search string as one `query` value.
- **`advanced_search` returns one page.** It's a snapshot of recent matches, not
  an exhaustive archive; tighten `query` (add `min_faves:`, `lang:en`, a date
  window) rather than expecting everything.
- **`woeid` is a Yahoo Where-On-Earth ID, not a country code.** Use `1`
  (worldwide) unless the user names a region; a bad WOEID returns an empty or
  error trend list.
- **Trends are global-to-regional context, not query-filtered.** The trends step
  shows what's hot in the region; cross-reference it against the query yourself —
  it does not search for the query.
- **Both steps need the SELAT Router.** `catalog.selat.ai` settles x402 via
  Circle Gateway *through* the SELAT Router, so `SELAT_ROUTER_URL` must be set
  and reachable.
- **Read-only.** This skill monitors public tweets; it does not post, like, or
  follow, and cannot see protected/private accounts.

## Validation

Before relying on the skill:

- `selat skill validate ./skills/twitter-topic-monitor` → passes.
- `selat skill verify ./skills/twitter-topic-monitor` → both steps reachable and
  ≤ `maxAmount` (writes the verify receipt). `--pay` confirms a real settled 200.
- `npm run validate` → 0 errors (whole-repo + `index.json` consistency).

Free single-step probe (what `verify` runs per step — no wallet, no spend):

```bash
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=AI%20agents" \
  --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/trends?woeid=1" \
  --chain base --probe-only
# success prints: detected x402=yes, mode=routed-x402, price=$0.001000 on eip155:8453
```

## References

- [`references/endpoints.md`](references/endpoints.md) — the two endpoints, params, rails, and live prices.
