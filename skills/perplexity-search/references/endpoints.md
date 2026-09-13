# Endpoints — perplexity-search

Use only these endpoint families for `perplexity-search`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Web search | POST | `https://pplx.x402.paysponge.com/search` | routed x402 | $0.0105 |

This is a fixed 1-call manifest. The step table matches `manifest.json` exactly.
The manifest `rail` field is `routed`; live verify prints `routed-x402`.
Catalogue list price is `$0.01`; the live routed quote is ≈ `$0.0105`.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **routed x402:** Paysponge (`pplx.x402.paysponge.com`) serves a native x402 challenge. The router settles it (`routed-x402`, `GatewayWalletBatched`, USDC on Base `eip155:8453`). This is not a pay-chain claim. There is no MPP/Tempo route for this host.
- **MPP on Tempo:** Not used.

## Perplexity / paysponge — `routed x402`

serviceUrl: `https://pplx.x402.paysponge.com`

Live-probed price: `$0.0105` per call (`routed-x402`). The manifest step is
**POST with a JSON body**. The skill runner substitutes `${param}` as a
**string**, so the manifest wires only string-typed fields (`query`,
`search_recency_filter`). Numeric fields like `max_results` must be sent as
real integers via a hand-built `selat-pay` call.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Web search (manifest step) | `/search` | `query` (string, required), `search_recency_filter` (enum: `hour`/`day`/`week`/`month`/`year`) |

```json
{ "query": "latest x402 / agentic payments adoption", "search_recency_filter": "month" }
```

Optional escalation endpoints (same host — **not in the default manifest**;
call via `selat-pay` when the request needs them):

| Capability | Endpoint | Use |
| --- | --- | --- |
| Create agent response | `POST /v1/agent` | Body needs `input` plus one of `model` / `models` / `preset`. Catalogue `$0.01`; live ≈ `$0.0105` (`routed-x402`). |
| Async deep research | `POST /v1/async/sonar` | Body wraps `{ "request": { "model": "sonar-deep-research", "messages": [...] } }`. Returns a task id. Catalogue `$0.01`. |
| Poll async task | `GET /v1/async/sonar/{api_request}` | Free passthrough (`routed-free`). Poll until `COMPLETED`. |
| List models | `GET /v1/models` | Price: re-probe. |

Agent body pattern (not a manifest step):

```json
{ "input": "Summarize this week x402 news with sources.", "preset": "fast-search" }
```
