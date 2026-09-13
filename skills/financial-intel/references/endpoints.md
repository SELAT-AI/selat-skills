# Endpoints — financial-intel

Use only these endpoint families for `financial-intel`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Spot price | GET | `https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=${symbol}` | x402 via Circle Gateway | $0.001 |
| 2 — Token market data | POST | `https://coingecko.mpp.paywithlocus.com/coingecko/coins-markets` | MPP on Tempo | $0.063 |
| 3 — Equities / macro quote | POST | `https://alphavantage.mpp.paywithlocus.com/alphavantage/global-quote` | MPP on Tempo | $0.0084 |
| 4 — On-chain smart-money holdings | POST | `https://api.nansen.ai/api/v1/smart-money/holdings` | MPP on Tempo | $0.0525 |
| 5 — Market news / context | POST | `https://api.exa.ai/search` | MPP on Tempo | $0.00735 |

This is a fixed 5-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** Alchemy (`x402.alchemy.com`). Verify prints `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** CoinGecko and Alpha Vantage via Locus (`*.mpp.paywithlocus.com`). Nansen (`api.nansen.ai`) and Exa (`api.exa.ai`) are MPP on Tempo but not Locus. Nansen is dual-protocol: a bare probe 402s with x402 only; the MPP challenge surfaces under an `Authorization: Payment` probe. A routed-MPP charge settles live (`routed-mpp`, $0.0525).

## Alchemy — `x402 via Circle Gateway`

serviceUrl: `https://x402.alchemy.com`

Live-probed price: `$0.001` per call (`routed-x402`). The manifest step is
**GET with query-string params**.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Spot price | `/prices/v1/tokens/by-symbol` | `symbols` (string, required — token symbol, no `$`) |

Query pattern:

```text
https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH
```

## CoinGecko MPP — `MPP on Tempo`

serviceUrl: `https://coingecko.mpp.paywithlocus.com`

Live-probed price: `$0.063` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Token market data | `/coingecko/coins-markets` | `vs_currency` (string, required), `ids` (string, CoinGecko coin id) |

```json
{ "vs_currency": "usd", "ids": "ethereum" }
```

## Alpha Vantage MPP — `MPP on Tempo`

serviceUrl: `https://alphavantage.mpp.paywithlocus.com`

Live-probed price: `$0.0084` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Equities / macro quote | `/alphavantage/global-quote` | `symbol` (string, required) |

```json
{ "symbol": "AAPL" }
```

## Nansen — `MPP on Tempo`

serviceUrl: `https://api.nansen.ai`

Live-probed price: `$0.0525` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. `chains` is an **array**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| On-chain smart-money holdings | `/api/v1/smart-money/holdings` | `chains` (string array, required) |

```json
{ "chains": ["ethereum"] }
```

## Exa — `MPP on Tempo`

serviceUrl: `https://api.exa.ai`

Live-probed price: `$0.00735` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Market news / context | `/search` | `query` (string, required), `numResults` (integer), `contents.text.maxCharacters` (integer) |

```json
{ "query": "ethereum ETF flows", "numResults": 8, "contents": { "text": { "maxCharacters": 3000 } } }
```
