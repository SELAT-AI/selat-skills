---
name: social-intel
description: Use this skill when the user wants a cross-platform read on what people are saying about a topic, brand, product, or account — e.g. "what's the social sentiment on X", "scan Reddit and Twitter for <topic>", "social listening on <brand>", "is <topic> trending", "pull chatter + web context on <handle>", "brand/topic intelligence brief". Fuses Reddit + X/Twitter signal (Scrape Creators, MPP) with grounded web context (Exa + Tavily, x402) — all routed via the SELAT Router. Pays per call via selat-pay (USDC on Base), no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet on Base. The routed steps need a reachable SELAT Router (SELAT_ROUTER_URL); `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# social-intel

Cross-platform social intelligence on any topic, brand, or account. The skill
gathers paid signal over **two x402 protocols (x402 + MPP), both routed via the
SELAT Router**, and the agent fuses it into
a brief — what the web says, what Reddit says, and what an X/Twitter account is
posting — with citations.

## When To Use

Use when the user wants social listening or a topic/brand/account intelligence
brief that spans more than one source: Reddit community chatter, an X/Twitter
account's profile and recent posts, and grounded web context to corroborate. Pick
this over a single-source skill (e.g. `reddit-pulse`, `find-twitter-influencers`)
when the value is in *fusing* signals across platforms and rails. Every API call
is a paid x402 service; the agent does the ranking, sentiment read, and synthesis
around the paid data.

## Rails

This skill spans **two x402 protocols**, both **routed** through the SELAT Router
(`rail: routed`):

- **x402** (sourced from the Agentic/MPP catalogue): Exa, Tavily web search —
  resolve as `routed-x402` on Base.
- **MPP**: Scrape Creators (Reddit + X/Twitter) — resolves as `routed-mpp`.

All steps settle **routed** via the SELAT Router. The `direct` rail is a different
payment mechanism — **Circle Gateway nanopayments**, supported only by endpoints
sourced from the Circle marketplace — and is *not* the same as x402-on-Base. None
of these endpoints offer Gateway nanopayments, so every step is routed (`routed-x402`
for the web steps, `routed-mpp` for Scrape Creators). The `selat` CLI auto-detects
each step's protocol at call time.

## Workflow

1. Install: `selat skill install social-intel`
2. Run end-to-end:
   `selat skill run social-intel --topic "<topic>" --handle <handle> --subreddit <subreddit>`
3. The CLI compiles each step into a `selat-pay` call and prints each result.

Recommended agent procedure (cheapest-first; stop early when a side is conclusive):

1. **Ground the topic on the web** — Exa `POST /search` (routed x402, ~$0.007).
2. **Corroborate the web read** — Tavily `POST /search` (routed x402, ~$0.011).
   Cross-reference against Exa; flag claims only one source makes.
3. **Read the Reddit conversation** — Scrape Creators `GET /v1/reddit/search`
   (routed MPP, ~$0.021); rank hits by engagement.
4. **Add community context** — Scrape Creators `GET /v1/reddit/subreddit`
   (routed MPP, ~$0.021) for the named subreddit's current top posts.
5. **Profile the account** — Scrape Creators `GET /v1/twitter/profile`
   (routed MPP, ~$0.021) for follower counts + bio.
6. **Read its recent posts** — Scrape Creators `GET /v1/twitter/user-tweets`
   (routed MPP, ~$0.021); surface the breakout post and engagement trend.

Then synthesize: a sentiment read, the dominant themes, the breakout
post/thread per platform, and where the web context confirms or contradicts the
social chatter — with source URLs.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `topic` | yes | `agent payments` | Keyword/topic to listen for (web + Reddit search). |
| `handle` | no | `OpenAI` | X/Twitter handle (no `@`) to profile and pull tweets for. |
| `subreddit` | no | `ethereum` | Subreddit (no `r/`) to scan top posts of. |

Output: per-step JSON (web results with text snippets + URLs, Reddit posts with
scores/comments, an X profile, and recent tweets with engagement) that the agent
fuses into a cross-platform intelligence brief.

## Gotchas

- **Two protocols, both routed.** The web steps (Exa, Tavily) settle `routed-x402`
  and the Scrape Creators steps settle `routed-mpp` — all through the SELAT Router,
  so a reachable `SELAT_ROUTER_URL` is required for every step. The `direct` rail is
  separate — Circle Gateway nanopayments, offered only by Circle-marketplace
  endpoints, distinct from x402-on-Base — and none of these endpoints use it.
- **GET params in the query, POST params in `body`.** Exa/Tavily are POST — their
  query goes in the body; the Scrape Creators steps are GET — `?query=`/`?handle=`/
  `?subreddit=` in the URL.
- **`maxAmount` is a guardrail, not the price.** Per-step cap is `$0.05` (live
  quotes: Exa ~$0.007, Tavily ~$0.011, each Scrape Creators call ~$0.021); the
  full-run cap is `$0.50`.
- **Pass `--handle` / `--subreddit`** to retarget the X and Reddit-community steps;
  the topic-search steps (Exa, Tavily, Reddit search) key off `--topic`.
- **The live 402 is the source of truth.** If a step stops serving a challenge,
  `selat skill verify` flags it — omit it and re-add when the gateway serves it.

## Validation

- Static: `selat skill validate ./skills-scaffold/social-intel`
- Live gate (free): `selat skill verify ./skills-scaffold/social-intel --topic "agent payments" --handle OpenAI --subreddit ethereum`
- Paid confirm (settles real 200s): add `--pay` to the verify command.
- Single-step probe (no pay):
  `selat-pay POST "https://api.exa.ai/search" --body '{"query":"agent payments","numResults":5}' --chain base --probe-only`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoints, rails, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
