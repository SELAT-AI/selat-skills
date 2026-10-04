# Endpoints — financial-intel

Use only these endpoint families for `financial-intel`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Spot price | GET | `https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=${symbol}` | x402 via Circle Gateway | $0.001 | $0.0015 |
| 2 — Token market data | POST | `https://coingecko.mpp.paywithlocus.com/coingecko/coins-markets` | MPP on Tempo | $0.063 | $0.09 |
| 3 — Equity / ETF benchmark quote | POST | `https://alphavantage.mpp.paywithlocus.com/alphavantage/global-quote` | MPP on Tempo | $0.0084 | $0.012 |
| 4 — Chain-level smart-money holdings | POST | `https://api.nansen.ai/api/v1/smart-money/holdings` | MPP on Tempo | $0.0525 | $0.07 |
| 5 — News and market context | POST | `https://api.exa.ai/search` | x402 via Circle Gateway | $0.007 | $0.01 |

This is a fixed 5-call manifest. The step table matches `manifest.json` exactly.
`selat skill run` always executes all five calls; every param (`symbol`, `coin`,
`ticker`, `assetChain`, `query`) is required with no default. Live sum ≈
**$0.1319** (free probes, 2026-10-04); sum of per-step caps $0.1835. The
top-level `maxAmount` (`$0.09`) is only a per-step fallback, not a run cap.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** Alchemy (`x402.alchemy.com`) and Exa (`api.exa.ai`). Verify prints `routed-x402` for both (2026-10-04). Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** CoinGecko and Alpha Vantage via Locus (`*.mpp.paywithlocus.com`), and Nansen (`api.nansen.ai`, not Locus). Verify prints `routed-mpp`. Nansen is dual-protocol: a bare probe 402s with x402 only; the MPP challenge surfaces under the probe's `Authorization: Payment` retry, and the router has been observed settling Nansen over x402. The label follows the probe `mode`; the settled rail is in payment history.

## Alchemy — `x402 via Circle Gateway`

serviceUrl: `https://x402.alchemy.com`

Live-probed price: `$0.001` per call (`routed-x402`, 2026-10-04). The manifest
step is **GET with query-string params** — the only GET in this skill. Do not
describe it as a direct/no-router payment based on the hostname. Per-step cap
`$0.0015`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Spot price | `/prices/v1/tokens/by-symbol` | `symbols` (string, required — token symbol, no `$`) |

Query pattern:

```text
https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH
```

## CoinGecko MPP — `MPP on Tempo`

serviceUrl: `https://coingecko.mpp.paywithlocus.com`

Live-probed price: `$0.063` per call (`routed-mpp`, 2026-10-04). All endpoints
are **POST with a JSON body**. Per-step cap `$0.09`. A token symbol and a
CoinGecko ID are separate identifier systems; validate the pair before payment.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Token market data | `/coingecko/coins-markets` | `vs_currency` (string, required), `ids` (string, CoinGecko coin id), `per_page`, `page` (integers), `sparkline` (boolean), `price_change_percentage` (string) |

```json
{ "vs_currency": "usd", "ids": "ethereum", "per_page": 1, "page": 1, "sparkline": true, "price_change_percentage": "1h,24h,7d" }
```

## Alpha Vantage MPP — `MPP on Tempo`

serviceUrl: `https://alphavantage.mpp.paywithlocus.com`

Live-probed price: `$0.0084` per call (`routed-mpp`, 2026-10-04). All endpoints
are **POST with a JSON body**. Per-step cap `$0.012`. The output is one
benchmark quote, not a macroeconomic dataset, and does not establish causation
between the benchmark and the crypto asset.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Equity / ETF benchmark quote | `/alphavantage/global-quote` | `symbol` (string, required — user-selected ticker) |

```json
{ "symbol": "QQQ" }
```

## Nansen — `MPP on Tempo`

serviceUrl: `https://api.nansen.ai`

Live-probed price: `$0.0525` per call (`routed-mpp`, 2026-10-04). All endpoints
are **POST with a JSON body**. `chains` is an **array**. Per-step cap `$0.07`.
The request has no token filter: the response aggregates smart-money holdings
across the selected chain. Do not claim `chains:["ethereum"]` measures
ETH-specific positioning.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Chain-level smart-money holdings | `/api/v1/smart-money/holdings` | `chains` (string array, required — from the `assetChain` param, not the settlement `--chain` flag) |

```json
{ "chains": ["ethereum"] }
```

## Exa — `x402 via Circle Gateway`

serviceUrl: `https://api.exa.ai`

Live-probed price: `$0.007` per call (`routed-x402`, 2026-10-04 — earlier
receipts recorded `routed-mpp` at `$0.00735`). All endpoints are **POST with a
JSON body**. Per-step cap `$0.01`. Exa prices dynamically; re-probe if
`numResults` or content options change.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| News and market context | `/search` | `query` (string, required), `numResults` (integer, 1–100; this skill uses 8), `contents.text.maxCharacters` (integer) |

```json
{ "query": "Ethereum ETH ETF flows regulation latest news", "numResults": 8, "contents": { "text": { "maxCharacters": 3000 } } }
```
