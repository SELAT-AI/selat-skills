---
name: web-intelligence
description: Multi-source web search & real-time crypto price intelligence across federated x402 endpoints.
license: Apache-2.0
compatibility: Requires Node.js 18+, the selat CLI, and selat-pay >= 0.7.0 on PATH.
metadata:
  author: SELAT-AI
  version: "1.0"
  kind: guidance
---

# web-intelligence

Multi-source web search & real-time crypto price intelligence across federated x402 endpoints.

## When To Use

Use this skill when you need cross-source web search and market price snapshots without API keys, settled per call via Circle Gateway & x402.

## Workflow

1. Query broad web search results via `api.agentstools.dev`.
2. Cross-reference search results using `search.reversesandbox.com`.
3. Fetch real-time market price snapshots from `store.agentexchange.work`.

```bash
selat skill run web-intelligence --query "AI agents"
```

## Inputs And Outputs

| Input | Type | Required | Description |
|---|---|---|---|
| query | string | Yes | The search topic or keyword query |

## Gotchas

- Ensure query string is URL-encoded if passing special characters.
- Verify Gateway balance before initiating execution.

## Validation

- Static validation: `selat skill validate ./skills/web-intelligence`
- Live verification: `selat skill verify ./skills/web-intelligence`

## References

- See `references/endpoints.md` for endpoint schemas and live pricing breakdown.
