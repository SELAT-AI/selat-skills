# Endpoints — person-lookup

Use only these endpoint families for `person-lookup`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Person search | POST | `https://clado.mpp.paywithlocus.com/clado/search` | MPP on Tempo | $0.31815 |

This is a fixed 1-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Clado via Locus (`clado.mpp.paywithlocus.com`).

## Clado MPP — `MPP on Tempo`

serviceUrl: `https://clado.mpp.paywithlocus.com`

Last documented price: `$0.31815` per call (`routed-mpp`). Today's live probe
did not surface a 402 — re-probe. All endpoints are **POST with a JSON body**.
Search is synchronous — natural-language people search returns in one call,
no job polling.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person search | `/clado/search` | `query` (string, required — name plus company, role, or geography) |

```json
{ "query": "Dario Amodei Anthropic CEO" }
```
