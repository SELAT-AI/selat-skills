---
name: crypto-market-snapshot
description: Use this skill when the user wants a quick current price snapshot for one or more crypto tokens — e.g. "what's the price of bitcoin and ethereum", "check solana price", "how much is usd-coin worth". One paid call returns live USD spot prices for up to ~50 CoinGecko ids with confidence scores, over routed x402 via the SELAT Router. No API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.2, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: meloloakun12
  version: "1.0"
  rail: routed
  kind: single
---

# crypto-market-snapshot

## When To Use

Use when the user asks for the current price, spot value, or a snapshot of one or more crypto tokens ("what's BTC at?", "price of eth and sol", "check a few token prices"). It is a single cheap paid call that returns live prices from DefiLlama-sourced data. Not for historical charts, on-chain balances, or order books — those are different skills.

## Workflow

1. Install: `selat skill install crypto-market-snapshot`
2. Run: `selat skill run crypto-market-snapshot --ids bitcoin,ethereum,solana`
3. The CLI compiles the step into a `selat-pay` call and prints the result.

Step: **agentexchange** `GET /crypto/prices?ids=${ids}` — routed x402 via the SELAT Router.

Tell the user the price(s) in plain language, e.g. "BTC ≈ $67,900 — confidence 0.98".

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `ids` | yes | `bitcoin,ethereum,solana` | Comma-separated CoinGecko token ids (bitcoin, ethereum, solana, usd-coin, ...) |

Output: JSON with one entry per requested id: `symbol`, `price` (USD), `confidence`. Example shape:

```json
{ "bitcoin": { "symbol": "BTC", "price": 67900.12, "confidence": 0.98 } }
```

## Gotchas

- `ids` must be CoinGecko ids, not tickers — `eth` fails, `ethereum` works. Unknown ids are skipped by the provider (no error, just absent from the response).
- One call covers many tokens; don't loop per token.
- Typical cost ~$0.01/call (probed at $0.0105 incl. router fee); `maxAmount` cap is $0.02 for headroom.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe (no pay): `selat-pay GET "https://store.agentexchange.work/crypto/prices?ids=bitcoin,ethereum,solana" --chain base --probe-only`
- A successful run prints `status=200`.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
