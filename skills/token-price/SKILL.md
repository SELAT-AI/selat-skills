---
name: token-price
description: Use this skill when the user wants the current spot price of one or more crypto tokens by symbol — e.g. "price of ETH", "what's BTC worth", "spot prices for ETH, USDC, BTC", "current token price". Fetches spot prices from Alchemy paid directly over a Circle nanopayment (Gateway-batched, no router hop).
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet on Base.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: direct
  kind: single
---

# token-price

## When To Use

Use when the user wants a quick spot price for one or more tokens by symbol. This is the simplest, cheapest, most reliable skill (single direct call), and the best first skill to demonstrate the named-skill flow.

## Workflow

1. Install: `selat skill install token-price`
2. Run: `selat skill run token-price --symbols ETH,USDC,BTC`
3. The CLI compiles the step to a `selat-pay` call (DIRECT / Gateway-batched) and prints the result.

Step: **Alchemy** `GET /prices/v1/tokens/by-symbol` — DIRECT (Circle nanopayment).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `symbols` | yes | — | Comma-separated token symbols, e.g. `ETH,USDC,BTC` |

Output: `{ data: [{ symbol, prices: [{ currency, value, lastUpdatedAt }] }] }`.

## Gotchas

- `symbols` is required; without it the CLI errors with `missing required --symbols`.
- Direct rail — no router dependency.
- Cap: $0.005 per run.

## Validation

- Probe: `selat-pay GET "https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH" --chain base --probe-only`
- A successful run prints `status=200` and a price for each symbol.

## References

- `manifest.json` — the machine-readable payment recipe.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md)
- selat-pay — https://github.com/SELAT-AI/selat-pay
