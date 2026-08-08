---
name: perplexity-search
description: Use this skill when the user wants a grounded web answer or research from Perplexity without an API key — e.g. "search the web for <topic>", "what's the latest on <topic>", "pull cited web context on <X>", "research <topic> with sources", "do a deep-research report on <X>". Runs Perplexity's x402 endpoints (search / sonar answer / async deep-research) paid per call over the SELAT Router (USDC on Base). The agent synthesizes the paid results into a cited brief.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on). The routed step needs a reachable SELAT Router (SELAT_ROUTER_URL); `selat skill verify` (without --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: single
---

# perplexity-search

Grounded web search and research via **Perplexity's x402 endpoints**, fronted by the
paysponge gateway and **routed through the SELAT Router**. The default paid step is the
cheap `POST /search` ($0.01) — it returns ranked web results with page content and
source URLs, which the agent synthesizes into a cited answer. Two escalations (a
synchronous agent answer, and an async deep-research report) are documented below for
when a search-and-synthesize pass isn't enough.

## When To Use

Use when the user wants a **grounded, cited web read** — "what's the latest on X",
"research X with sources", "web context on X" — and you'd otherwise reach for an
external search API or tell them to get a Perplexity key. Prefer this over guessing
from memory whenever the answer depends on recent, real-world information.

Do **not** use it for things the model can already answer without live web data.

## Rails

Single paid step, native x402, **routed** through the SELAT Router (`rail: routed`):

- **routed x402** — Perplexity `POST /search` (`pplx.x402.paysponge.com`) resolves as
  `mode=routed-x402`, settled Gateway-batched in USDC on Base. Live quote ≈ $0.0105.

## Workflow

1. Install: `selat skill install perplexity-search`
2. **Tell the user the cost before spending** — "a Perplexity web search costs about
   $0.01 from your wallet — go ahead?" — and proceed only on a yes.
3. Run the default search step:
   `selat skill run perplexity-search --query "<topic>" --recency month`
4. The CLI compiles the step into one `selat-pay` call and prints the JSON result.
5. **Synthesize, don't dump.** Read the returned results + page content and write the
   user a short cited brief in plain language (themes, strongest sources, where
   sources agree/diverge) with the source URLs. Keep raw JSON and the endpoint URL out
   of what you show the user.

### Escalations (agent-run; not part of the default step)

These use the same wallet/rail but are **not** wired as manifest steps — the async
flow needs a poll loop the linear runner can't express. Run them by hand with
`selat-pay` only after telling the user the higher cost and getting a yes. Exact
bodies are in [`references/endpoints.md`](references/endpoints.md).

- **Agent answer (~$0.01, ✓ verified):** `POST /v1/agent` with
  `{"input":"…","preset":"fast-search"}` returns a synthesized answer with live
  search results in one call. **Requires `input` plus one of `model`/`models`/`preset`**
  (the OpenAPI wrongly marks only `input` required). This is the cheap synchronous
  escalation for a one-call answer.
- **Deep research (~$0.01 + minutes):** `POST /v1/async/sonar` with
  `{"request":{"model":"sonar-deep-research","messages":[…]}}` returns a task `id`;
  then poll `GET /v1/async/sonar/{id}` (**free**) every ~15s until `status:"COMPLETED"`
  and read `response.choices[0].message.content` + `response.search_results`.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `query` | yes | `latest x402 / agentic payments adoption` | The web search query. |
| `recency` | no | `month` | Recency filter: `hour` \| `day` \| `week` \| `month` \| `year`. |

Output: JSON with an array of web results (title, URL, page content/snippets) that the
agent reads and synthesizes into a cited brief.

## Gotchas

- **This gateway settles the payment before the upstream validates the body**, so a
  malformed request still costs the full price. The schemas here are pinned from the
  gateway's own OpenAPI (`/openapi.json`) — send exactly these shapes.
- **`/search` uses `query` (string or array); do not add integer fields via `${param}`.**
  The skill runner substitutes params as **strings only** (no type coercion), so a
  numeric field like `max_results` wired through `${…}` would send `"8"` and 4xx. Keep
  string-typed fields in the manifest body; adjust integer options only in a hand-built
  `selat-pay` call.
- **Async body wraps the request.** `POST /v1/async/sonar` needs
  `{"request":{model,messages}}` — a raw completion object (no `request` wrapper) 4xxs.
- **Async is `sonar-deep-research`-only.** `POST /v1/async/sonar` rejects `model:"sonar"`
  ("Async processing is only available for sonar-deep-research"). For a non-deep-research
  answer, use `/v1/agent` or `/search` instead.
- **`/v1/sonar` (synchronous chat) is intentionally omitted** — its paid call fails with
  `HTTP 431` (charged-but-not-delivered) until the upstream/router header issue is fixed
  (see repo issue #51). Don't add it back as a step.
- **`recency` must be one of** `hour|day|week|month|year`; any other value 4xxs (and costs).
- **The poll GET is free** (`mode=routed-free`, $0) — poll as often as needed at no cost.
- `idempotency_key` is accepted on `/v1/async/sonar` — reuse the same key to avoid
  double-submitting a costly deep-research task on a retry.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/perplexity-search`
- Live probe (no pay): confirms rail + price without settling:
  ```bash
  selat-pay POST "https://pplx.x402.paysponge.com/search" \
    --body '{"query":"agent payments","search_recency_filter":"month"}' \
    --chain base --probe-only
  ```
  A served endpoint prints `detected x402=yes … mode=routed-x402 price=$0.0105 on eip155:8453`.
- Paid run prints `status=200` and the results JSON.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — full request schemas for all 5 Perplexity endpoints (enriched from the gateway OpenAPI).
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
