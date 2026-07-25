---
name: social-intel
description: Use this skill when the user wants a grounded, corroborated web read on a topic, brand, or product — e.g. "what's being said about <topic>", "give me a web brief on <brand>", "is <topic> trending", "pull grounded web context on <topic>", "topic/brand intelligence brief with citations". Runs two independent web searches (Exa neural + Tavily advanced) and fuses them into one cited brief. Pays per call via selat-pay (USDC on Base), no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet on Base. The SELAT Router steps need a reachable SELAT Router (SELAT_ROUTER_URL); `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
  kind: multi
---

# social-intel

Grounded web-context intelligence on any topic, brand, or account. The skill runs
**two independent web searches — Exa (neural, MPP on Tempo) and Tavily (advanced, x402 on Base)
via the SELAT Router (x402)** — and the agent fuses them into a single cited brief,
cross-checking the two sources and flagging claims only one of them makes.

## When To Use

Use when the user wants a grounded, corroborated web read on a topic, brand, or
product — not a single-source lookup. The value is in *cross-checking two distinct
retrieval methods* (Exa's neural/semantic search vs Tavily's aggregation) so the
brief is corroborated rather than dependent on one engine. Every API call is a paid
x402 service; the agent does the ranking, sentiment read, and synthesis around the
paid data.

## Rails

Both steps are native x402, **via the SELAT Router** through the SELAT Router (`rail: via the SELAT Router`):

- **x402 on Base**: Exa web search (`api.exa.ai`) — resolves as `x402 on Base`.
- **x402 on Base**: Tavily web search (`x402.tavily.com`) — resolves as `x402 on Base`.

The `selat` CLI auto-detects each step's protocol at call time.

## Workflow

1. Install: `selat skill install social-intel`
2. Run end-to-end:
   `selat skill run social-intel --topic "<topic>"`
3. The CLI compiles each step into a `selat-pay` call and prints each result.

Recommended agent procedure:

1. **Ground the topic on the web** — Exa `POST /search` (x402 on Base, ~$0.007);
   returns ranked results with page text.
2. **Corroborate the web read** — Tavily `POST /search` (x402 on Base, ~$0.011),
   `search_depth: advanced`. Cross-reference against Exa; flag claims only one
   source makes, and prefer sources both engines surface.

Then synthesize: the dominant themes, the strongest sources, and where the two
engines agree or diverge — with source URLs.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `topic` | yes | `agent payments` | Keyword/topic to search the web for (both engines). |

Output: per-step JSON (Exa results with page-text snippets + URLs; Tavily results
with snippets + URLs) that the agent fuses into a single corroborated web brief
with citations.

## Gotchas

- **Two engines, both x402 on Base.** Exa and Tavily both settle `x402 on Base`
  through the SELAT Router, so a reachable `SELAT_ROUTER_URL` is required for both.
- **Both steps are POST** — the query goes in the request `body`, not the URL.
- **`maxAmount` is a guardrail, not the price.** Per-step cap is `$0.05` (live
  quotes: Exa ~$0.007, Tavily ~$0.011); the full-run cap is `$0.10`.
- **Corroboration, not coverage.** Two engines exist to cross-check each other, not
  to maximize raw recall — prefer sources both surface; treat single-source claims
  as weaker.
- **The live 402 is the source of truth.** If a step stops serving a challenge,
  `selat skill verify` flags it — omit it and re-add when the gateway serves it.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills-scaffold/social-intel`
- Live gate (free): `selat skill verify ./skills-scaffold/social-intel --topic "agent payments"`
- Paid confirm (settles real 200s): add `--pay` to the verify command.
- Single-step probe (no pay):
  `selat-pay POST "https://api.exa.ai/search" --body '{"query":"agent payments","numResults":5}' --chain base --probe-only`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoints, rails, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
