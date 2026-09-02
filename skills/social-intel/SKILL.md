---
name: social-intel
description: "Use this skill when the user wants a grounded web brief on one explicit topic, brand, or product and wants two search engines cross-checked rather than a single-source lookup. It runs a fixed two-call, read-only bundle: Exa semantic search plus Tavily advanced search. Require a free live quote and explicit cost approval before paying. It does not query Reddit, X/Twitter, or other social-platform APIs, measure platform sentiment, or prove that a topic is trending."
license: Apache-2.0
compatibility: "Requires the selat CLI and selat-pay. Paid runs need a funded Circle Agent Wallet. Both calls currently traverse a reachable SELAT Router: Exa as routed MPP and Tavily as routed x402. `selat skill verify --live-probe` without `--pay` is free and needs no funded wallet."
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: mixed
  kind: multi
---

# social-intel

A fixed two-call, read-only web-search bundle. It sends the same explicit query to
Exa semantic search and Tavily advanced search, then returns two independent raw
responses for the calling agent to compare and synthesize. The manifest does not
merge, deduplicate, score, or summarize the results itself.

## When To Use

Use it for requests such as:

- "Give me a sourced web brief on agent payments and cross-check two engines."
- "Compare what independent web searches surface about this product launch."
- "Research this brand and separate repeated reporting from single-engine finds."

Do not use it as a substitute for direct Reddit, X/Twitter, LinkedIn, Instagram,
or TikTok data. It has no engagement metrics, account graph, social listening, or
sentiment-measurement endpoint. It also cannot establish that something is
"trending" without an explicit time window and appropriate platform evidence.

## Rails

The two provider-facing payment challenges use different rails:

- **Exa** (`api.exa.ai/search`): currently selected by SELAT as routed MPP on
  Tempo. The provider challenge may advertise additional payment options, but
  the free live quote is authoritative for the route SELAT will use.
- **Tavily** (`x402.tavily.com/search`): currently selected as routed x402 via
  Circle Gateway.

Protocol, route, and price can change. Always run a fresh free live probe before
approval; do not infer the active route from the hostname.

## Workflow

1. Require one explicit `topic`. Add a date range or recency phrase to the query
   when freshness matters.
2. Validate locally:
   `selat skill validate ./skills/social-intel`
3. Obtain a fresh free quote:
   `selat skill verify ./skills/social-intel --topic "<topic>" --live-probe`
4. Show the user every step, route, expected total, and maximum total. Obtain
   explicit approval before adding `--pay` or running the installed skill.
5. Execute exactly once. The CLI runs both independently capped calls in order
   and may continue after one step fails.
6. Inspect every per-step success or failure and payment history before any
   retry. A paid application error may still have been charged.
7. Synthesize the raw results with claim-level source URLs, publication dates
   when present, and explicit uncertainty.

The fixed pipeline is:

1. **Exa semantic web context** — `POST /search`, ten results, with up to 4,000
   characters of page text per result.
2. **Tavily advanced web corroboration** — `POST /search`, advanced depth, up to
   ten results.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `topic` | yes | none | Explicit natural-language web-search topic/query passed unchanged to both engines. |

Output: two independent raw JSON responses. Exa supplies ranked result metadata,
URLs, and requested page text; Tavily supplies ranked result metadata, URLs, and
snippets. The calling agent performs deduplication and synthesis.

A defensible brief should:

- cite the underlying page URL for each material claim, not the search engine;
- treat the same page found by both engines as one source, not two independent
  confirmations;
- label agreement between retrieval engines separately from independent factual
  corroboration by different primary or authoritative sources;
- preserve conflicts and credible single-engine evidence instead of discarding
  it merely because the other engine did not retrieve it;
- distinguish publication date from retrieval date and avoid freshness claims
  when dates are absent.

## Gotchas

- **This is a fixed two-call bundle.** Both paid steps run; it is not a menu or
  cheapest-success waterfall.
- **Both steps are POST.** The query belongs in the JSON body.
- **Required means required.** There is no fallback topic; missing input must fail
  before any network call.
- **Caps are not prices.** Live verification on 2026-08-31 quoted `$0.00735` for
  Exa and `$0.0105` for Tavily. Step caps are `$0.010` and `$0.015`, for a maximum
  fixed-run exposure of `$0.025`. Re-quote before every paid run.
- **Free verification is limited.** A successful 402 probe verifies the payment
  challenge, route, quote, and cap compatibility; it does not prove that the
  post-payment business response will succeed or contain useful evidence.
- **Paid failures may charge.** Never auto-retry. Inspect per-step output and
  payment history, obtain a fresh quote, and request new approval first.
- **Search-engine agreement is not ground truth.** Both engines can index the same
  page or repeat the same reporting.
- **No direct social-platform coverage.** Route platform-specific requests to an
  appropriate dedicated skill rather than describing web results as social data.

## Validation

- Static: `selat skill validate ./skills/social-intel`
- Missing-input gate: `selat skill verify ./skills/social-intel --live-probe`
  must fail before probing either endpoint.
- Live gate (free):
  `selat skill verify ./skills/social-intel --topic "agent payments August 2026" --live-probe`
- Single-step probes (free): see `references/endpoints.md`.
- Paid confirmation: only after showing a fresh quote and receiving explicit
  approval, add `--pay` to the verified command. Never reuse approval after a
  route, price, input, or cap change.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoints, rails, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Exa and Tavily are third-party services. Their names and trademarks belong to
their respective owners and are used only to identify the endpoints called.
