# Endpoints — web-search

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| web search | POST | `https://blockrun.ai/api/v1/exa/search` | routed (erc-3009) | $0.0105 |

- **Provider:** Exa (served by BlockRun)
- **Payment:** routed via the SELAT Router — the router translates the agent's inbound Gateway-batched payment into the upstream's erc-3009 scheme.
- **Body:** `{ "query": "${query}" }`
