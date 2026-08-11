---
name: nansen-smart-money
description: Use this skill when you want to track on-chain institutional and smart money positioning, including swap trades, portfolio distributions, and net flows on a target blockchain. Pays over MPP. (Keep under 1024 chars.)
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.2, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: single
---

# nansen-smart-money

Exposes on-chain intelligence metrics from Nansen to identify what high-conviction entities (funds, whales, smart traders) are trading, holding, and moving on-chain.

## When To Use

Use this skill when analyzing market trends, token accumulations, or network-level activity by institutional or high-performance address cohorts. 

## Workflow

1. Install the skill:
   ```bash
   selat skill install nansen-smart-money
   ```
2. Run the skill targeting a specific chain (e.g., `ethereum` or `solana`):
   ```bash
   selat skill run nansen-smart-money --chain ethereum
   ```
3. Tell the user: "Querying Nansen Smart Money DEX trades, portfolio holdings, and capital netflows for Ethereum..."
4. Relate the returned results by summarizing:
   * Most active DEX swaps by volume and direction.
   * Top accumulated smart money tokens.
   * Networks showing positive/negative capital netflows.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `chain` | no | `ethereum` | The blockchain network to query (e.g., `ethereum`, `solana`, `base`). |

Output: A multi-step JSON containing smart money DEX transaction history, wallet balances, and netflow metrics.

## Gotchas

- **Supported Chains**: Querying unsupported chains will result in a 400 or empty response. Ensure the chain matches Nansen's support list.
- **Cost**: The skill runs three endpoints, costing approximately $0.16 USDC in total under the router's markup.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe (no pay): `selat-pay POST "https://api.nansen.ai/api/v1/smart-money/dex-trades" --body '{"chains":["ethereum"]}' --chain base --probe-only`
- A successful run prints `status=200`.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
