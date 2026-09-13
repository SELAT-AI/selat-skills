# Endpoints — social-intel

Use only these endpoint families for `social-intel`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Web context | POST | `https://api.exa.ai/search` | MPP on Tempo | $0.00735 |
| 2 — Web corroboration | POST | `https://x402.tavily.com/search` | x402 on Base | $0.0105 |

This is a fixed 2-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 on Base / Polygon:** Tavily (`x402.tavily.com`) settles via Circle Gateway batched nanopayments (`routed-x402`, `GatewayWalletBatched`). Buyer is the funded Gateway chain. This is not a pay-chain claim. This is Tavily's own host — not the AIsa or Locus re-hosts.
- **MPP on Tempo:** Exa (`api.exa.ai`) is MPP on Tempo but not Locus.

## Exa — `MPP on Tempo`

serviceUrl: `https://api.exa.ai`

Live-probed price: `$0.00735` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. Neural/semantic search; returns page text.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Web context | `/search` | `query` (string, required), `numResults` (integer), `contents.text.maxCharacters` (integer) |

```json
{ "query": "agent payments", "numResults": 10, "contents": { "text": { "maxCharacters": 4000 } } }
```

## Tavily — `x402 on Base`

serviceUrl: `https://x402.tavily.com`

Live-probed price: `$0.0105` per call (`routed-x402`). All endpoints are **POST
with a JSON body**. Aggregation search with `search_depth: advanced`.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Web corroboration | `/search` | `query` (string, required), `search_depth` (string — `advanced`), `max_results` (integer) |

```json
{ "query": "agent payments", "search_depth": "advanced", "max_results": 10 }
```
