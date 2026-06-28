---
name: social-intel
description: Use this skill when the user wants a cross-platform read on what people are saying about a topic, brand, product, or account — e.g. "what's the social sentiment on X", "scan Reddit and Twitter for <topic>", "social listening on <brand>", "is <topic> trending", "pull chatter + web context on <handle>", "brand/topic intelligence brief". Fuses Reddit signal (Scrape Creators, routed MPP) + X/Twitter signal (AIsa, direct x402, Gateway-batched) with grounded web context (Exa + Parallel). Pays per call via selat-pay (USDC), no API keys.
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

This skill spans both x402 protocols and two settlement paths:

- **routed x402**: Exa web search — resolves as `routed-x402`.
- **routed MPP**: Parallel web search + Scrape Creators (Reddit) — resolve as `routed-mpp`.
- **direct x402 (Gateway-batched)**: AIsa (X/Twitter) — called directly, settles `GatewayWalletBatched` (`mode=direct`).

The `selat` CLI auto-detects each step's protocol at call time.

## Workflow

1. Install: `selat skill install social-intel`
2. Run end-to-end:
   `selat skill run social-intel --topic "<topic>" --handle <handle> --subreddit <subreddit>`
3. The CLI compiles each step into a `selat-pay` call and prints each result.

Recommended agent procedure (cheapest-first; stop early when a side is conclusive):

1. **Ground the topic on the web** — Exa `POST /search` (routed x402, ~$0.007).
2. **Corroborate the web read** — Parallel `POST /api/search` (routed MPP, ~$0.011).
   Cross-reference against Exa; flag claims only one source makes.
3. **Read the Reddit conversation** — Scrape Creators `GET /v1/reddit/search`
   (routed MPP, ~$0.021); rank hits by engagement.
4. **Add community context** — Scrape Creators `GET /v1/reddit/subreddit`
   (routed MPP, ~$0.021) for the named subreddit's current top posts.
5. **Profile the account** — AIsa `GET /v2/twitter/user/info?userName=`
   (direct x402, Gateway-batched, ~$0.0004) for follower counts + bio.
6. **Read its recent posts** — AIsa `GET /v2/twitter/user/last_tweets?userName=`
   (direct x402, Gateway-batched, ~$0.004); surface the breakout post and engagement trend.

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

- **Two protocols, both routed.** Exa settles `routed-x402`; Parallel and the
  Scrape Creators steps settle `routed-mpp` — all through the SELAT Router, so a
  reachable `SELAT_ROUTER_URL` is required for every step.
- **GET params in the query, POST params in `body`.** Exa/Parallel are POST — their
  query goes in the body; the Scrape Creators steps are GET — `?query=`/`?handle=`/
  `?subreddit=` in the URL.
- **`maxAmount` is a guardrail, not the price.** Per-step cap is `$0.05` (live
  quotes: Exa ~$0.007, Parallel ~$0.011, each Scrape Creators call ~$0.021); the
  full-run cap is `$0.50`.
- **Pass `--handle` / `--subreddit`** to retarget the X and Reddit-community steps;
  the topic-search steps (Exa, Parallel, Reddit search) key off `--topic`.
- **The live 402 is the source of truth.** If a step stops serving a challenge,
  `selat skill verify` flags it — omit it and re-add when the gateway serves it.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

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
