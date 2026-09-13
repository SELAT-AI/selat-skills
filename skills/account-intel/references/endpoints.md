# Endpoints — account-intel

Use only these endpoint families for `account-intel`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — X/Twitter profile | GET | `https://catalog.selat.ai/twitter/user/info?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 2 — X/Twitter recent tweets | GET | `https://catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 3 — YouTube presence | GET | `https://mpp.orthogonal.com/scrapecreators/v1/youtube/search?query=${name}` | MPP on Tempo | $0.021 |
| 4 — Web reputation / news | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | MPP on Tempo | $0.03675 |
| 5 — Web context / citations | POST | `https://api.exa.ai/search` | MPP on Tempo | $0.00735 |
| 6 — On-chain token footprint | GET | `https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=${address}` | x402 via Circle Gateway | $0.001 |

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402). `SELAT_ROUTER_URL` is required.
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`) and Alchemy (`x402.alchemy.com`). Verify prints `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** Scrape Creators YouTube via Orthogonal (`mpp.orthogonal.com`). Brave news-search via Locus (`brave.mpp.paywithlocus.com`). Exa search (`api.exa.ai`) is MPP on Tempo but not Locus.

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`). All endpoints are **GET
with query-string params**.

Endpoints used by the manifest:

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| X/Twitter profile | `/twitter/user/info` | `userName` (string, required — handle, no `@`) |
| X/Twitter recent tweets | `/twitter/user/last_tweets` | `userName` (string, required) |

Query pattern:

```text
https://catalog.selat.ai/twitter/user/info?userName=OpenAI
```

## Scrape Creators — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com`

Live-probed price: `$0.021` for YouTube search (`routed-mpp`). The manifest
step is **GET with query-string params**.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| YouTube presence | `/scrapecreators/v1/youtube/search` | `query` (string, required — entity display name) |

## Brave Search MPP — `MPP on Tempo`

serviceUrl: `https://brave.mpp.paywithlocus.com`

Live-probed price: `$0.03675` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Web reputation / news | `/brave/news-search` | `q` (string, required) |

```json
{ "q": "OpenAI" }
```

## Exa — `MPP on Tempo`

serviceUrl: `https://api.exa.ai`

Live-probed price: `$0.00735` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Web context / citations | `/search` | `query` (string, required), `numResults` (integer), `contents.text.maxCharacters` (integer) |

```json
{ "query": "OpenAI", "numResults": 8, "contents": { "text": { "maxCharacters": 3000 } } }
```

## Alchemy — `x402 via Circle Gateway`

serviceUrl: `https://x402.alchemy.com`

Live-probed price: `$0.001` per call (`routed-x402`). The manifest step is
**GET with a query-string `address`**. Only meaningful when the entity has an
associated token; skip if the entity is purely off-chain.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| On-chain token footprint | `/data/v1/assets/tokens/by-address` | `address` (EVM `0x…`, required) |
