# Endpoints — account-intel

Use only these endpoint families for `account-intel`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — X/Twitter profile | GET | `https://catalog.selat.ai/twitter/user/info?userName=${handle}` | x402 via Circle Gateway | $0.001 | $0.0015 |
| 2 — X/Twitter recent tweets | GET | `https://catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | x402 via Circle Gateway | $0.001 | $0.0015 |
| 3 — On-chain wallet holdings | POST | `https://x402.alchemy.com/data/v1/assets/tokens/by-address` | x402 via Circle Gateway | $0.001 | $0.0015 |
| 4 — Web context / citations | POST | `https://api.exa.ai/search` | x402 via Circle Gateway | $0.007 | $0.01 |
| 5 — YouTube presence | GET | `https://mpp.orthogonal.com/scrapecreators/v1/youtube/search?query=${name}` | MPP on Tempo | $0.021 | $0.03 |
| 6 — Web reputation / news | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | MPP on Tempo | $0.03675 | $0.05 |

This is a fixed 6-call manifest, ordered cheapest first. The step table matches
`manifest.json` exactly. `selat skill run` always executes all six calls, so
`handle`, `name`, and a user-supplied non-zero `address` are all required (no
defaults). Live sum ≈ **$0.06775** (free probes, 2026-10-04); sum of per-step
caps $0.0945. The top-level `maxAmount` (`$0.05`) is only a per-step fallback,
not a run cap; the armed session budget is the cumulative guardrail.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402). `SELAT_ROUTER_URL` is required.
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`), Alchemy (`x402.alchemy.com`), and Exa (`api.exa.ai`). Verify prints `routed-x402` for all four. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** Scrape Creators YouTube via Orthogonal (`mpp.orthogonal.com`). Brave news-search via Locus (`brave.mpp.paywithlocus.com`). Verify prints `routed-mpp`.

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`, 2026-10-04). All endpoints
are **GET with query-string params**. Per-step cap `$0.0015`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| X/Twitter profile | `/twitter/user/info` | `userName` (string, required — handle, no `@`) |
| X/Twitter recent tweets | `/twitter/user/last_tweets` | `userName` (string, required) |

Query pattern:

```text
https://catalog.selat.ai/twitter/user/info?userName=VitalikButerin
```

## Alchemy — `x402 via Circle Gateway`

serviceUrl: `https://x402.alchemy.com`

Live-probed price: `$0.001` per call (`routed-x402`, 2026-10-04). The manifest
step is **POST with a JSON body** — the old GET `?address=` form is retired.
Per-step cap `$0.0015`. The address must be a non-zero EVM wallet the user
explicitly associates with the entity; never infer it, and never substitute a
token contract or the zero address. Polygon's Portfolio API network id is
`matic-mainnet` (not `polygon-mainnet`).

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| On-chain wallet holdings | `/data/v1/assets/tokens/by-address` | `addresses` (array of `{ address, networks }`, required), `withMetadata`, `withPrices`, `includeNativeTokens`, `includeErc20Tokens` (booleans) |

```json
{
  "addresses": [
    {
      "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "networks": ["eth-mainnet", "base-mainnet", "matic-mainnet", "arb-mainnet", "opt-mainnet"]
    }
  ],
  "withMetadata": true,
  "withPrices": true,
  "includeNativeTokens": true,
  "includeErc20Tokens": true
}
```

(Example address: `vitalik.eth`, publicly self-identified by its owner.)

## Exa — `x402 via Circle Gateway`

serviceUrl: `https://api.exa.ai`

Live-probed price: `$0.007` per call (`routed-x402`, 2026-10-04 — earlier
receipts recorded `routed-mpp` at `$0.00735`). All endpoints are **POST with a
JSON body**. Per-step cap `$0.01`.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Web context / citations | `/search` | `query` (string, required), `numResults` (integer), `contents.text.maxCharacters` (integer) |

```json
{ "query": "Vitalik Buterin", "numResults": 8, "contents": { "text": { "maxCharacters": 3000 } } }
```

## Scrape Creators — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com`

Live-probed price: `$0.021` for YouTube search (`routed-mpp`, 2026-10-04). The
manifest step is **GET with query-string params**. Per-step cap `$0.03`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| YouTube presence | `/scrapecreators/v1/youtube/search` | `query` (string, required — entity display name) |

## Brave Search MPP — `MPP on Tempo`

serviceUrl: `https://brave.mpp.paywithlocus.com`

Live-probed price: `$0.03675` per call (`routed-mpp`, 2026-10-04). All endpoints
are **POST with a JSON body**. Per-step cap `$0.05`.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Web reputation / news | `/brave/news-search` | `q` (string, required) |

```json
{ "q": "Vitalik Buterin" }
```
