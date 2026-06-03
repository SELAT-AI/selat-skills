---
name: wallet-holdings
description: Use this skill when the user wants the token balances / holdings of a wallet address across chains — e.g. "what tokens does 0x... hold", "wallet holdings for this address", "list balances for my wallet", "portfolio of an address". Fetches multi-chain token holdings from Alchemy paid directly over a Circle nanopayment (Gateway-batched).
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet on Base.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: direct
  kind: single
---

# wallet-holdings

## When To Use

Use when the user wants the token holdings of a specific wallet address (their own or any address) across supported chains.

## Workflow

1. Install: `selat skill install wallet-holdings`
2. Run: `selat skill run wallet-holdings --address 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
3. The CLI compiles the step to a `selat-pay` POST (DIRECT / Gateway-batched) and prints the holdings.

Step: **Alchemy** `POST /data/v1/assets/tokens/by-address` — DIRECT (Circle nanopayment).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `address` | yes | — | Wallet address, `0x...` |

Output: Alchemy token-holdings payload (per-chain token balances for the address).

## Gotchas

- `address` is required and must be a valid `0x` address; the value is JSON-encoded into the request body.
- Direct rail — no router dependency.
- Cap: $0.005 per run.

## Validation

- Probe: `selat-pay POST "https://x402.alchemy.com/data/v1/assets/tokens/by-address" --body '{"addresses":["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"]}' --chain base --probe-only`
- A successful run prints `status=200` and the holdings payload.

## References

- `manifest.json` — the machine-readable payment recipe.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md)
- selat-pay — https://github.com/SELAT-AI/selat-pay
