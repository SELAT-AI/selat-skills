---
name: market-snapshot
description: Use this skill when the user wants a cross-rail market price snapshot — e.g. "market snapshot", "price of ETH and a token", "show me prices across both payment rails", "snapshot of the market". Fetches a crypto spot price via Alchemy (Circle nanopayment, direct) and a token price via Allium (MPP, routed via the SELAT Router) in a single run, exercising both SELAT payment rails.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet on Base. Routed step also requires a reachable SELAT Router (SELAT_ROUTER_URL).
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
  kind: multi
---

# market-snapshot

## When To Use

Use when the user wants a quick market snapshot that spans **both** SELAT payment rails: a crypto spot price (direct Circle nanopayment) plus a token price (routed MPP). Also the canonical demonstration that the SELAT Router translates an inbound Gateway-batched payment into an outbound MPP payment.

## Workflow

1. Install: `selat skill install market-snapshot`
2. Run: `selat skill run market-snapshot [--symbols ETH,BTC] [--tokenChain ethereum] [--tokenAddress 0x...]`
3. The CLI compiles each step into a `selat-pay` call, runs them in order, and prints a per-rail ✓/✗ summary.

Steps:

- **Step 1 — Alchemy** `GET /prices/v1/tokens/by-symbol` — **DIRECT** (Gateway-batched), paid straight to the upstream (no router hop, no markup).
- **Step 2 — Allium** `POST /api/v1/developer/prices` — **ROUTED MPP** via the SELAT Router.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `symbols` | no | `ETH,BTC` | Comma-separated symbols for the Alchemy step |
| `tokenChain` | no | `ethereum` | Chain for the Allium lookup |
| `tokenAddress` | no | `0xa0b8…eb48` (USDC) | Token contract for the Allium price |

Outputs: Alchemy returns `{ data: [{ symbol, prices: [{ currency, value }] }] }`; Allium returns `{ items: [{ chain, address, price, … }] }`.

## Gotchas

- The routed step needs `SELAT_ROUTER_URL` configured and the router reachable; the direct step does not.
- Per-step caps: $0.005 (direct) + $0.025 (routed); a full run costs ≈ $0.026.
- Allium expects the request body as a JSON **list** of `{chain, token_address}` objects — not `{symbols:[…]}`.
- Steps run independently (continue-across-steps): one rail can succeed while the other fails; check the summary.

## Validation

- Probe without paying:
  - `selat-pay GET "https://x402.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH" --chain base --probe-only`
  - `selat-pay POST "https://agents.allium.so/api/v1/developer/prices" --body '[{"chain":"ethereum","token_address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}]' --chain base --probe-only`
- A successful run prints `status=200` for both steps and a ✓ summary for both rails.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
