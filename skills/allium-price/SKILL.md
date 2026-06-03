---
name: allium-price
description: Use this skill when the user wants the latest on-chain price of a token by contract address — e.g. "Allium price for this token", "latest price of token 0x...", "on-chain price by contract address". Fetches the latest token price from Allium routed through the SELAT Router (tempo-native MPP).
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, a funded Circle Agent Wallet on Base, and a reachable SELAT Router (SELAT_ROUTER_URL).
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: single
---

# allium-price

## When To Use

Use when the user wants the latest price of a token identified by chain + contract address, sourced from Allium. This is a routed **MPP** skill: the SELAT Router translates the agent's inbound Gateway-batched payment into an outbound tempo-native MPP payment.

## Workflow

1. Install: `selat skill install allium-price`
2. Run: `selat skill run allium-price [--tokenChain ethereum] [--tokenAddress 0x...]`
3. The CLI compiles the step to a `selat-pay` POST routed via the SELAT Router and prints the price.

Step: **Allium** `POST /api/v1/developer/prices` — ROUTED MPP (tempo-native).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `tokenChain` | no | `ethereum` | Chain for the lookup |
| `tokenAddress` | no | `0xa0b8…eb48` (USDC) | Token contract address |

Output: `{ items: [{ chain, address, decimals, price, open, high, low, close }] }`.

## Gotchas

- Routed rail: needs `SELAT_ROUTER_URL` configured and the router reachable.
- Allium expects the body as a JSON **list** of `{chain, token_address}` objects.
- Cap: $0.025 per run (router-quoted ≈ $0.021).

## Validation

- Probe: `selat-pay POST "https://agents.allium.so/api/v1/developer/prices" --body '[{"chain":"ethereum","token_address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}]' --chain base --probe-only` (expect `mode=routed-mpp`).
- A successful run prints `status=200` and the price item.

## References

- `manifest.json` — the machine-readable payment recipe.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md)
- selat-pay — https://github.com/SELAT-AI/selat-pay
