---
name: web-search
description: Use this skill when the user wants to search the web for information — e.g. "search the web for X", "find recent articles about Y", "look up Z online", "web search". Runs an Exa web search (served by BlockRun) routed through the SELAT Router (erc-3009).
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, a funded Circle Agent Wallet on Base, and a reachable SELAT Router (SELAT_ROUTER_URL).
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: single
---

# web-search

## When To Use

Use when the user wants ranked web-search results for a query (research, current articles, factual lookup). This is a routed skill: the SELAT Router translates the agent's inbound Gateway-batched payment into the upstream's erc-3009 scheme.

## Workflow

1. Install: `selat skill install web-search`
2. Run: `selat skill run web-search --query "agentic payments"`
3. The CLI compiles the step to a `selat-pay` POST routed via the SELAT Router and prints the results.

Step: **Exa / BlockRun** `POST /api/v1/exa/search` — ROUTED (erc-3009).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `query` | yes | — | The search query |

Output: ranked web results from Exa.

## Gotchas

- Routed rail: needs `SELAT_ROUTER_URL` configured and the router reachable.
- `query` is required; it is JSON-encoded into the request body.
- Cap: $0.02 per run (router-quoted ≈ $0.0105).

## Validation

- Probe: `selat-pay POST "https://blockrun.ai/api/v1/exa/search" --body '{"query":"agentic payments"}' --chain base --probe-only` (expect `mode=routed-x402`).
- A successful run prints `status=200` and search results.

## References

- `manifest.json` — the machine-readable payment recipe.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md)
- selat-pay — https://github.com/SELAT-AI/selat-pay
