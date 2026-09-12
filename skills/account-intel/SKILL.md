---
name: account-intel
description: Use this skill when the user wants an entity-centric footprint or reputation read on one specific person, brand, company, or handle and can supply an associated EVM wallet — e.g. "profile @OpenAI across platforms", "what's the cross-platform footprint of <brand>", "is <person> credible / how present are they online", "build me a reputation brief on <handle>", "who is this account and where do they show up", "footprint of <entity> on Twitter + YouTube + the web". Profiles ONE entity across X/Twitter (SELAT-native catalog.selat.ai), YouTube (Scrape Creators), web news + reputation (Brave), web citations (Exa), and holdings context from a user-supplied associated EVM wallet (Alchemy). Uses x402 via Circle Gateway and MPP on Tempo — all paid per call via selat-pay (USDC via Circle Gateway), no API keys. For TOPIC/keyword listening (sentiment on a subject, "what are people saying about <topic>") use `social-intel` instead.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet for paid runs. A reachable SELAT Router (SELAT_ROUTER_URL) is required for steps whose live probe reports a routed mode; all six steps reported routed modes on 2026-08-29. `selat skill verify --live-probe` (without --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: mixed
  kind: multi
---

# account-intel

Entity-centric footprint & reputation intelligence. Point the skill at **one
specific person, brand, company, or handle** and it gathers paid signal across
X/Twitter, YouTube, web news/reputation, web citations, and holdings from a
user-supplied associated EVM wallet — over **two payment protocols (x402 via Circle Gateway and
MPP on Tempo)** — which the
agent fuses into a single cross-platform footprint brief: who this account is,
how present they are per platform, and how credible the web makes them look.

## When To Use

Use when the value is **profiling a single entity** — the question is *who is
this account, how present and credible are they across platforms*. Examples:
"profile @OpenAI", "cross-platform footprint of <brand>", "reputation brief on
<person>", "where does <handle> show up and is it legit".

This is **distinct from `social-intel`**, which does *topic/keyword listening* —
sentiment and chatter on a subject across a crowd. If the user asks "what are
people saying about <topic>" or "social sentiment on <subject>", use
`social-intel`. If they name **one account/brand/person** and want *that
entity's* footprint, use **account-intel**.

## Rails

This skill declares **two payment protocols** and currently observes two routed
modes:

- **x402 via Circle Gateway / `routed-x402`** — the two SELAT-native X/Twitter
  reads and the Alchemy tokens-by-wallet read.
- **MPP on Tempo / `routed-mpp`** — Scrape Creators YouTube search, Brave news
  search, and Exa web search.

The manifest's catalog classification is `mixed`. Do not infer direct versus
routed settlement from a provider hostname: `selat skill verify --live-probe`
is the source of truth at execution time. All six steps probed as routed on
2026-08-29; older reliability snapshots recorded some x402 steps as direct.

## Workflow

1. Install: `selat skill install account-intel`
2. Verify all six live challenges for free:
   `selat skill verify ~/.config/selat/skills/account-intel --handle <handle> --name "<entity>" --address <0x..> --live-probe`
3. Show the user all six live prices and the expected total; get explicit
   approval and arm a cumulative session budget.
4. Run end-to-end:
   `selat skill run account-intel --handle <handle> --name "<entity>" --address <0x..>`
5. The CLI compiles each step into a `selat-pay` call and prints each result.

> **Execution is a six-step pipeline.** `selat skill run` always executes every
> manifest step and continues after an individual failure. It cannot stop early
> or omit Alchemy, so `--address` is required and must be a non-zero wallet the
> user explicitly associates with the entity. Supporting a truly optional
> on-chain step requires a separate skill or runner-level step selection.

Synthesize the six results in this order:

1. **X/Twitter profile** — SELAT-native `GET /twitter/user/info`
   (x402 on Base, ~$0.001) for follower counts, bio, verification.
2. **On-chain wallet holdings** — Alchemy `POST /data/v1/assets/tokens/by-address`
   (x402 via Circle Gateway, ~$0.001). Only meaningful when the user supplies
   a non-zero EVM wallet or treasury address that the user explicitly associates
   with the entity. Do not infer ownership from an untrusted search result.
3. **YouTube presence** — Scrape Creators `GET /v1/youtube/search`
   (MPP on Tempo, ~$0.021) for whether/where the entity shows up on YouTube.
4. **X/Twitter recent tweets** — SELAT-native `GET /twitter/user/last_tweets`
   (x402 on Base, ~$0.001); read cadence + engagement, surface the breakout post.
5. **Web citations** — Exa `POST /search` (MPP on Tempo, ~$0.00735). Grounds the
   entity in indexed web sources for corroboration.
6. **Web reputation / news** — Brave `POST /brave/news-search`
   (MPP on Tempo, ~$0.0368); recent press, controversy, sentiment signal.

Then synthesize: a per-platform presence map (X, YouTube, web, on-chain), a
credibility/reputation read, the entity's strongest channel, and where the web
context confirms or contradicts the self-presentation — with source URLs.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `handle` | no | `OpenAI` | X/Twitter handle (no `@`) to profile and pull tweets for. |
| `name` | yes | `OpenAI` | Display name of the entity to search YouTube + web news + citations for. |
| `address` | yes | none | Non-zero EVM wallet or treasury address explicitly supplied by the user and associated with the entity. |

Output: per-step JSON (X profile + recent tweets with engagement, YouTube search
hits, Brave news results, Exa web results with text snippets + URLs, and Alchemy
wallet holdings) that the agent fuses into a single entity footprint &
reputation brief.

## Gotchas

- **Entity-centric, not topic-centric.** This skill profiles *one account/brand*.
  For topic/keyword sentiment listening across a crowd, use `social-intel`.
- **Router dependency is live, not hostname-derived.** All six steps probed as
  routed on 2026-08-29. Require a reachable `SELAT_ROUTER_URL` for the current
  workflow and re-run verification if a mode changes.
- **The social rails.** The YouTube step pays Scrape Creators (`mpp.orthogonal.com`)
  via `MPP on Tempo` through the SELAT Router; the X/Twitter steps pay SELAT-native
  (`catalog.selat.ai`) through the SELAT Router.
- **The on-chain step is operationally mandatory.** `selat skill run` always
  executes Alchemy, so require a user-supplied non-zero address before quoting or
  paying. Never infer wallet ownership or substitute the zero address: the zero
  address can contain unsolicited balances and produce a large, misleading result.
- **GET params in the query, POST params in `body`.** SELAT-native and Scrape
  Creators are GET (`?userName=`/`?query=`). Brave, Exa, and Alchemy are POST;
  Alchemy requires an `addresses` array of `{ address, networks }` objects.
- **`maxAmount` is a per-step guardrail, not a cumulative run cap or price.**
  Current per-step caps sum to `$0.28`; the manifest's top-level `$0.50` is only
  a fallback for a step without its own cap, and every current step has an
  override. The cumulative limit comes from the armed session budget. Live
  quotes on 2026-08-29 were `$0.001`, `$0.001`, `$0.021`, `$0.03675`, `$0.00735`,
  and `$0.001`, for an expected total of `$0.06810`.
- **The live 402 is the source of truth.** If a step stops serving a challenge,
  `selat skill verify` flags it — omit it and re-add when the gateway serves it.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/account-intel`
- Live gate (free): `selat skill verify ./skills/account-intel --handle OpenAI --name "OpenAI" --address 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 --live-probe`
- Paid confirm (settles real 200s): only after an approved cumulative session
  budget, add `--pay` to that command and reconfirm the current total.
- Single-step probe (no pay):
  `selat-pay GET "https://catalog.selat.ai/twitter/user/info?userName=OpenAI" --chain base --probe-only --live-probe`
  `selat-pay POST "https://x402.alchemy.com/data/v1/assets/tokens/by-address" --body '{"addresses":[{"address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","networks":["eth-mainnet"]}],"withMetadata":true,"withPrices":true,"includeNativeTokens":true,"includeErc20Tokens":true}' --chain base --probe-only --live-probe`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoints, rails, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
