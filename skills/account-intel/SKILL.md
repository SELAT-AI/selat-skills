---
name: account-intel
description: Use this skill when the user wants an entity-centric footprint or reputation read on one specific person, brand, company, or handle — e.g. "profile @OpenAI across platforms", "what's the cross-platform footprint of <brand>", "is <person> credible / how present are they online", "build me a reputation brief on <handle>", "who is this account and where do they show up", "footprint of <entity> on Twitter + YouTube + the web". Profiles ONE entity across X/Twitter (AIsa), YouTube (AIsa), web news + reputation (Brave), web citations (Exa), and any associated on-chain token (Alchemy). Spans three rails — direct Circle nanopayment + MPP + x402 on Base — all paid per call via selat-pay (USDC via Circle Gateway), no API keys. For TOPIC/keyword listening (sentiment on a subject, "what are people saying about <topic>") use `social-intel` instead.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet. The routed steps (Brave, Exa) need a reachable SELAT Router (SELAT_ROUTER_URL); the direct steps (AIsa X/Twitter + YouTube, Alchemy) settle upstream Gateway-batched on Base and bypass the router. `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
  kind: multi
---

# account-intel

Entity-centric footprint & reputation intelligence. Point the skill at **one
specific person, brand, company, or handle** and it gathers paid signal across
X/Twitter, YouTube, web news/reputation, web citations, and any associated
on-chain token — over **three rails (direct + MPP + x402 on Base)** — which the
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

This skill spans **three rails**:

- **direct** (`rail: direct`): AIsa (X/Twitter profile + tweets, YouTube search;
  Circle x402 catalog) and Alchemy token-by-address serve native x402 challenges
  that resolve as `mode=direct` — Circle Gateway-batched nanopayments paid
  straight to the upstream on Base, **bypassing the router**.
- **MPP** (`rail: routed`): Brave news-search (via Locus) resolves as
  `routed-mpp` through the SELAT Router.
- **x402** (`rail: routed`): Exa web search resolves as `routed-x402` on Base
  through the SELAT Router.

The manifest's top-level `rail` is `mixed`. The `selat` CLI auto-detects each
step's protocol at call time.

## Workflow

1. Install: `selat skill install account-intel`
2. Run end-to-end:
   `selat skill run account-intel --handle <handle> --name "<entity>" [--address <0x..>]`
3. The CLI compiles each step into a `selat-pay` call and prints each result.

Recommended agent procedure (cheapest-first; stop early when the footprint is
already conclusive):

1. **X/Twitter profile** — AIsa `GET /apis/v2/twitter/user/info`
   (direct, ~$0.00044) for follower counts, bio, verification.
2. **On-chain token footprint** — Alchemy `GET /data/v1/assets/tokens/by-address`
   (direct, ~$0.001). Only meaningful if the entity has an associated token;
   pass `--address`. Skip/ignore if the entity is purely off-chain.
3. **YouTube presence** — AIsa `GET /apis/v2/youtube/search`
   (direct, ~$0.0024) for whether/where the entity shows up on YouTube.
4. **X/Twitter recent tweets** — AIsa `GET /apis/v2/twitter/user/last_tweets`
   (direct, ~$0.0036); read cadence + engagement, surface the breakout post.
5. **Web citations** — Exa `POST /search` (routed x402, ~$0.007). Grounds the
   entity in indexed web sources for corroboration.
6. **Web reputation / news** — Brave `POST /brave/news-search`
   (routed MPP, ~$0.0368); recent press, controversy, sentiment signal.

Then synthesize: a per-platform presence map (X, YouTube, web, on-chain), a
credibility/reputation read, the entity's strongest channel, and where the web
context confirms or contradicts the self-presentation — with source URLs.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `handle` | no | `OpenAI` | X/Twitter handle (no `@`) to profile and pull tweets for. |
| `name` | yes | `OpenAI` | Display name of the entity to search YouTube + web news + citations for. |
| `query` | no | `OpenAI` | Free-text query reserved for additional entity searches. |
| `address` | no | `0x0000000000000000000000000000000000000000` | EVM token/contract address for the entity's on-chain footprint (zero-address default is a safe live-exercisable placeholder). |

Output: per-step JSON (X profile + recent tweets with engagement, YouTube search
hits, Brave news results, Exa web results with text snippets + URLs, and Alchemy
token metadata) that the agent fuses into a single entity footprint &
reputation brief.

## Gotchas

- **Entity-centric, not topic-centric.** This skill profiles *one account/brand*.
  For topic/keyword sentiment listening across a crowd, use `social-intel`.
- **Three rails.** AIsa (X/Twitter profile + tweets, YouTube) and Alchemy settle
  `mode=direct` (Gateway-batched, paid upstream, router bypassed); Brave settles
  `routed-mpp`; Exa settles `routed-x402` — so a reachable `SELAT_ROUTER_URL` is
  required for the two routed steps, but not for the four direct steps.
- **The direct social rail is AIsa (Circle x402 catalog).** The X/Twitter and
  YouTube steps pay AIsa (`api.aisa.one`) directly via Circle Gateway-batched
  nanopayments — no router involved.
- **The on-chain step is optional context.** It's only useful when the entity has
  an associated token; pass a real `--address`. The zero-address default just lets
  `verify` exercise the step.
- **GET params in the query, POST params in `body`.** AIsa + Alchemy are GET
  (`?userName=`/`?query=`/`?address=`); Brave + Exa are POST (`q`/`query` in
  the body).
- **`maxAmount` is a guardrail, not the price.** Per-step caps are `$0.05` (Brave
  `$0.06`, Alchemy `$0.02`) against live quotes (probe-verified 2026-07-10): AIsa
  X profile ~$0.00044, Alchemy ~$0.001, AIsa YouTube ~$0.0024, AIsa recent tweets
  ~$0.0036, Exa ~$0.007, Brave ~$0.0368; the full-run cap is `$0.50`.
- **The live 402 is the source of truth.** If a step stops serving a challenge,
  `selat skill verify` flags it — omit it and re-add when the gateway serves it.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/account-intel`
- Live gate (free): `selat skill verify ./skills/account-intel --handle OpenAI --name "OpenAI"`
- Paid confirm (settles real 200s): add `--pay` to the verify command.
- Single-step probe (no pay):
  `selat-pay GET "https://api.aisa.one/apis/v2/twitter/user/info?userName=OpenAI" --chain base --probe-only`
  `selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0x0000000000000000000000000000000000000000" --chain base --probe-only`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoints, rails, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
