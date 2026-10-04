---
name: financial-intel
description: Use this skill when the user wants one fixed, read-only, multi-source market-research brief for a crypto asset and can provide a matching token symbol, CoinGecko coin ID, equity or ETF benchmark ticker, Nansen-supported data chain, and asset-specific news query. It retrieves spot price, token-market metrics, one benchmark quote, chain-level smart-money holdings, and current web context. Before payment, free-verify all five calls and obtain approval for the live total and a cumulative session cap. Do not use for equity-only research, a single price/news lookup, personalized investment advice, price predictions, or trade execution.
license: Apache-2.0
compatibility: "Requires the selat CLI and selat-pay >= 0.12.0 with a funded Circle Agent Wallet for paid runs. All five calls traversed the SELAT Router on the 2026-10-04 live probe: Alchemy and Exa as routed x402, CoinGecko, Alpha Vantage, and Nansen as routed MPP. `selat skill verify --live-probe` is free and needs no funded wallet."
metadata:
  author: SELAT-AI
  version: "1.4"
  rail: mixed
  kind: multi
---

# financial-intel

## When To Use

Use this skill for a **fixed five-call crypto market-research bundle** when the
user wants several independent signals in one brief:

- current token spot price;
- token market, volume, supply, and price-change metrics;
- one user-selected US equity or ETF benchmark quote;
- chain-wide aggregated smart-money holdings; and
- current news and market context with source URLs.

The user must identify one coherent crypto asset across `symbol`, `coin`,
`assetChain`, and `query`, and explicitly select the `ticker` benchmark. For
example, ETH / `ethereum` / `ethereum` / `QQQ` / an Ethereum-specific current
news query is coherent. Do not silently combine an asset with unrelated
manifest defaults.

This is a research workflow, not personalized financial advice. It does not
place trades, predict returns, or decide whether the user should buy, hold, or
sell. For an equity-only study or a single price/news lookup, choose a smaller
skill or free endpoint discovery instead of paying for all five calls.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install financial-intel
   ```

2. Collect and validate all five required inputs:

   - `symbol`: token symbol, such as `ETH`;
   - `coin`: matching CoinGecko ID, such as `ethereum`;
   - `ticker`: the explicit US equity or ETF benchmark, such as `QQQ`;
   - `assetChain`: Nansen data chain, such as `ethereum`; and
   - `query`: current, asset-specific search wording.

   Confirm the symbol and CoinGecko ID refer to the same asset. Explain that the
   Nansen step describes the whole selected chain, not that asset alone.

3. Probe all five payment challenges for free:

   ```bash
   selat skill verify ~/.config/selat/skills/financial-intel \
     --symbol ETH \
     --coin ethereum \
     --ticker QQQ \
     --assetChain ethereum \
     --query "Ethereum ETH ETF flows regulation latest news" \
     --live-probe
   ```

4. Show every live quote, the expected cumulative total, and the sum of all
   per-step caps. Obtain explicit approval for the exact workload and a proposed
   cumulative session budget. Verification without `--pay` is free.

5. Only after approval and a spendable Gateway balance, arm the approved budget,
   run the fixed bundle once, and disarm the budget after success or failure:

   ```bash
   selat budget start --amount <approved-cumulative-cap>
   selat skill run financial-intel \
     --symbol ETH \
     --coin ethereum \
     --ticker QQQ \
     --assetChain ethereum \
     --query "Ethereum ETH ETF flows regulation latest news"
   selat budget stop
   ```

The CLI runs every manifest step in order and continues after an individual
failure. Inspect each result and payment history; a final partial failure does
not mean earlier calls were uncharged. Never retry a paid failure until its
transaction state is checked, prices are re-probed, and the retry is separately
approved.

## Fixed Steps

1. **Alchemy spot price** — `GET /prices/v1/tokens/by-symbol` for `symbol`.
2. **CoinGecko token market data** — `POST /coingecko/coins-markets` for `coin`,
   bounded to one result with 1h/24h/7d changes and sparkline data.
3. **Alpha Vantage benchmark quote** — `POST /alphavantage/global-quote` for the
   user-selected `ticker`. Treat correlation or causal interpretations as
   hypotheses, not facts established by one quote.
4. **Nansen chain-level smart-money holdings** —
   `POST /api/v1/smart-money/holdings` for `assetChain`. The response aggregates
   token holdings by sophisticated traders and funds across that chain; it is
   not filtered to `symbol` or `coin`.
5. **Exa current context** — `POST /search` for the explicit `query`, returning
   eight results with bounded text and URLs.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `symbol` | yes | none | Crypto symbol without `$`, for example `ETH`. |
| `coin` | yes | none | Matching CoinGecko ID, for example `ethereum`. |
| `ticker` | yes | none | Explicit US equity or ETF benchmark, for example `QQQ` or `SPY`. |
| `assetChain` | yes | none | Nansen-supported data chain, for example `ethereum` or `solana`. |
| `query` | yes | none | Current, asset-specific news/context query. |

Each step returns provider JSON plus the CLI's per-step status. Produce the final
brief in this order:

1. retrieval time and exact identifiers used;
2. spot and token-market snapshot;
3. benchmark quote, clearly labelled as context;
4. chain-level smart-money observations, without asset-level overclaiming;
5. dated news claims with source URLs;
6. confirmations, contradictions, missing data, and limitations; and
7. neutral scenarios and risks, not a personal buy/sell recommendation.

Keep conflicting values and their timestamps visible rather than averaging them
or silently selecting one provider.

## Rails And Costs

The manifest declares two payment-protocol categories and the 2026-10-04 live
verification observes two routed modes:

- Alchemy and Exa: `x402 via Circle Gateway`, currently `routed-x402`. (Exa
  previously quoted `routed-mpp`; it now resolves x402.)
- CoinGecko, Alpha Vantage, and Nansen: `MPP on Tempo`, currently
  `routed-mpp`. Nansen is dual-protocol: its MPP challenge appears only behind
  the probe's `Authorization: Payment` retry, and the router has been observed
  settling Nansen over x402. The rail label follows the probe `mode`; check
  `selat history` for the settled rail.

All five calls currently require a reachable `SELAT_ROUTER_URL`. Do not infer
direct versus routed execution from the provider hostname; the free live probe
is authoritative.

`maxAmount` values are per-call ceilings, not price estimates and not a pooled
run cap. Current per-step caps are `$0.0015`, `$0.09`, `$0.012`, `$0.07`, and
`$0.01` (~1.3–1.5x each live quote), totaling **$0.1835**. The manifest's
top-level `$0.09` is only a fallback for a step without an override — it is
**not** a full-run cap, and every current step has an override. A separately
armed session budget supplies the cumulative limit.

The free live probe on 2026-10-04 quoted `$0.001`, `$0.063`, `$0.0084`, `$0.0525`,
and `$0.007`, for an expected total of **$0.1319**. Re-probe before every paid
run because live prices and modes can change.

## Gotchas

- **Fixed pipeline, not cheapest-first.** `selat skill run` executes all five
  entries and cannot stop early or select a subset.
- **`assetChain` is a data input.** Do not rename it to `chain`: `--chain` is a
  reserved SELAT/selat-pay settlement flag and will not reliably populate the
  Nansen body.
- **Nansen is chain-wide.** Its holdings schema accepts `chains` but no asset ID
  in this operation. Do not call its response “ETH smart-money positioning”
  merely because `assetChain=ethereum`.
- **No inter-step dataflow.** One provider's output does not correct or populate
  later inputs. Validate all identifiers before quoting or paying.
- **GET versus POST.** Alchemy inputs are in the query string; all other inputs
  are JSON request-body fields.
- **A paid error may still charge.** The runner continues after failures. Check
  transaction history before considering a retry.
- **Research-only safety.** Do not turn sparse, stale, or conflicting data into
  personalized investment advice or a deterministic price forecast.

## Validation

- Static:
  `selat skill validate ./skills/financial-intel`
- Live gate, free:
  `selat skill verify ./skills/financial-intel --symbol ETH --coin ethereum --ticker QQQ --assetChain ethereum --query "Ethereum ETH ETF flows regulation latest news" --live-probe`
- Paid verification: only after fresh quotes, explicit approval, and an armed
  cumulative session budget, add `--pay`; each paid call can settle independently.
- Single-step probe, free:

  > `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

  `selat-pay GET "https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH" --chain base --max-amount 0.0015 --probe-only --live-probe`
  `selat-pay POST "https://api.nansen.ai/api/v1/smart-money/holdings" --body '{"chains":["ethereum"]}' --chain base --max-amount 0.07 --probe-only --live-probe`

## References

- `manifest.json` — machine-readable fixed payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — endpoint schemas,
  routing observations, prices, and interpretation limits.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Provider and product names are used only to identify third-party services. This
skill is not investment advice and does not imply provider endorsement.
