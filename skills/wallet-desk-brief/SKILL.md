---
name: wallet-desk-brief
description: Use this skill when the user wants a who-is-this-wallet brief on one EVM address — e.g. "who is 0x...", "label this wallet", "wallet desk brief on 0x...", "what tokens does this address hold and who owns it", "Arkham + holdings read of 0x...". Pins Alchemy tokens-by-address (x402 via Circle Gateway; verify prints routed-x402) and Arkham intelligence/address (x402 via Circle Gateway; verify prints routed-x402). Read only. Not financial-intel (asset/ticker brief), not a trade, not a protocol desk. Pays per call via selat-pay (USDC via Circle Gateway), no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet for paid runs. The runner pays on whichever chain holds Gateway USDC. Every paid step hops the SELAT Router (`SELAT_ROUTER_URL`) — including Alchemy. `selat skill verify --live-probe` (no --pay) is free and needs no funded wallet; it prints `routed-x402` for both steps.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: x402 via Circle Gateway
  kind: multi
---

# wallet-desk-brief

One **EVM wallet** in. A **who-is-this-wallet** brief out. Read only.
Alchemy holdings plus Arkham attribution (`x402 via Circle Gateway`;
verify prints `routed-x402` for both). The agent synthesizes; the agent
does **not** place a trade.

This is **not** `financial-intel` (asset/ticker market brief), **not** a
protocol desk, and **not** trade execution.

## When To Use

Use when the user names **one EVM wallet** (`0x…`) and wants a short
attribution + holdings read: who the address is labeled as, what tokens
it holds, and a hedged desk note.

Do not use for "is \<asset\> a buy", ticker/macro fusion, protocol desks,
Solana-inbound addresses, or any request that should place an order. If
the user asks to trade on the result, decline that part and say so.

## Rails

Both shipped steps settle `x402 via Circle Gateway` (skill `rail` is that
taxonomy label — not mixed):

- **Alchemy** (`x402.alchemy.com`) — `GET /data/v1/assets/tokens/by-address`.
  Manifest rail stays `x402 via Circle Gateway`.
  `selat skill verify --live-probe` prints **`routed-x402`** (~$0.001).
  The call hops the SELAT Router. This is **not** a no-router-hop claim.
- **Arkham** (`api.arkm.com/x402`) — `POST /intelligence/address`.
  Same taxonomy. Verify prints **`routed-x402`** (~$0.21 live quote).
  Already in the SELAT federated catalog / discovery snapshot as
  `api.arkm.com/x402`.

CoinGecko `simple-price` is **not** a pin. It live-402s (`MPP on Tempo`,
~$0.063) but takes CoinGecko **coin ids**, not Alchemy contract holdings.
Skip it. Do not add a third rail for it.

The `selat` CLI auto-detects protocol at call time. Rail names are **not**
a pay-chain claim — the buyer is the funded Gateway chain. A reachable
`SELAT_ROUTER_URL` is required for every shipped step, including Alchemy.

## Workflow

1. Install: `selat skill install wallet-desk-brief`
2. Normalize the ask into **one** EVM `--address`. Lowercase is fine.
   Refuse Solana addresses, Arc, and CCTP paths.
3. Tell the user the live quote and **wait for a yes** before spending.
   Do not pass `--yes`. Do not auto-pay. Do not run `selat init` (or any
   wallet-creation command) for the user — if setup is missing, **ask
   and wait**. Live quotes (2026-08-22, probe-only): Alchemy **$0.001**
   (`routed-x402`), Arkham **$0.21** (`routed-x402`). Full-run cap $0.50.
4. Paid run (requires an **armed session budget**; the runner will refuse
   if none is armed):
   `selat skill run wallet-desk-brief --address <0x>`
5. The CLI compiles each step into a `selat-pay` call and prints each
   result. Afterwards, report what was actually spent.

Recommended agent procedure (cheapest-first; always retarget `--address`):

1. **Holdings** — Alchemy `GET /data/v1/assets/tokens/by-address`
   (~$0.001, `routed-x402`). Token footprint for this wallet.
2. **Attribution** — Arkham `POST /intelligence/address`
   (~$0.21, `routed-x402`). Entity, label, contract flag.
3. **Synthesize** a compact who-is-this-wallet brief: address, Arkham
   label/entity (or "unlabeled"), holdings snapshot, what would change
   the read, source notes. Hedged and non-advisory. Do not invent a
   CoinGecko, Allium, Dune, or Twitter step.

Relay the brief in plain language with the dollar cost. Keep endpoint
URLs and raw JSON out of what the user sees. When the user only wants
holdings or only attribution, call that step with `selat-pay` instead
of the full manifest.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `address` | yes | Vitalik `0xd8dA…6045` | EVM wallet for Alchemy + Arkham. Always pass the user's `0x` explicitly. |

Output: per-step JSON (Alchemy token footprint, Arkham entity/label)
that the agent fuses into one non-advisory who-is-this-wallet brief.

## Gotchas

- **Pinned providers only.** Use Alchemy tokens-by-address and Arkham
  intelligence/address as wired. Do not substitute Allium, Dune, Exa,
  Nansen, NeoTrade, Otto perps, token-screen, vault-yield-scout, or
  in-skill catalog discover. Do not revive a protocol desk.
- **Alchemy is `routed-x402`.** Verify prints `routed-x402`. Do not claim
  a Gateway-batched nanopayment with **no router hop**. Do not claim
  Alchemy skips `SELAT_ROUTER_URL`.
- **Arkham is POST — `address` goes in `body`.** Alchemy is GET —
  `address` is a query param. Do not flip them.
- **CoinGecko simple-price is skipped.** Probe-only 2026-08-22:
  `POST https://coingecko.mpp.paywithlocus.com/coingecko/simple-price`
  prints `mode=routed-mpp` ~$0.063. Body requires `ids` (coin slugs),
  not Alchemy contract addresses, so it does not price those holdings.
  Not a third rail.
- **Retarget the default.** Verify uses a well-known EVM wallet so both
  steps are exercisable. A run for any other address must pass `--address`.
- **EVM only.** Do not pass Solana addresses, Arc, or CCTP paths.
- **`maxAmount` is a guardrail, not the price.** Per-step caps $0.01
  (Alchemy) and $0.40 (Arkham); full-run cap $0.50. Live quotes
  (2026-08-22): Alchemy $0.001, Arkham $0.21. Do not raise the $1 CLI
  per-call ceiling.
- **Verify is free / probe-only.** `selat skill run` requires an armed
  session budget. No auto-pay. No `--yes`. No `--skip-schema-check`.
- **The live 402 is the source of truth.** If a step stops serving a
  challenge, `selat skill verify` flags it — omit it and re-add when
  the gateway serves it.
- **Non-advisory, always.** Cite the paid sources; do not present the
  brief as financial advice. Never place a trade.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay`
> requires today — a probe reads a free, chain-independent quote and never
> settles. A real paid run resolves the settlement chain from your funded
> Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/wallet-desk-brief`
- Live gate (free, probe-only — pass `--live-probe`, do **not** add `--pay`):
  `selat skill verify ./skills/wallet-desk-brief --live-probe --address 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
- Single-step probe (no pay):
  `selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" --chain base --probe-only --live-probe`
  `selat-pay POST "https://api.arkm.com/x402/intelligence/address" --body '{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}' --chain base --probe-only --live-probe`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the pinned endpoints, rails, skipped CoinGecko note, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
