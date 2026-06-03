# web-search

**Single-rail** · ROUTED (erc-3009)

Web search via Exa (served by BlockRun), routed through the SELAT Router — the router translates the agent's inbound Gateway-batched payment into the upstream's erc-3009 scheme.

## Params

| Param | Required | Notes |
|---|---|---|
| `query` | yes | Search query |

## Run

```bash
selat skill install web-search
selat skill run web-search --query "agentic payments"
```

## Cost

≈ $0.0105 per run (router-quoted), capped at $0.02.
