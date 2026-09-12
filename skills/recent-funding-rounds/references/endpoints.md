# Endpoints — recent-funding-rounds

Use only these endpoint families for `recent-funding-rounds`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Recent funding-round news | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | MPP on Tempo | $0.03675 |

This is a fixed 1-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Brave Search via Locus (`brave.mpp.paywithlocus.com`).

## Brave Search MPP — `MPP on Tempo`

serviceUrl: `https://brave.mpp.paywithlocus.com`

Live-probed price: `$0.03675` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. Returns recent news articles (title, snippet, source,
publish date, URL) — not a structured funding database. Deal details (company,
round type, size) must be extracted from the article text.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Recent funding-round news | `/brave/news-search` | `q` (string, required — `${sector} startup funding round announced`) |

```json
{ "q": "artificial intelligence startup funding round announced" }
```
