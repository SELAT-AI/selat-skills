---
name: onchain-desk-brief
description: Use this skill when the user wants a cited on-chain desk brief on one EVM wallet or one protocol — e.g. "desk brief on 0x...", "what's on this wallet", "protocol brief on Uniswap", "cited on-chain read of Aave", "wallet holdings plus social chatter for <address>", "what is happening around <protocol> on-chain". Pins Alchemy token-by-address (x402 via Circle Gateway; verify prints routed-x402) and SELAT-native Twitter (x402 via Circle Gateway on catalog.selat.ai; verify prints routed-x402). MPP (Allium prices) is parked — router.selat.ai 502s; Dune is not a pin. Not financial-intel (asset/ticker market brief), not hiring-signal-scout, not cited-launch-watch, not a holdings-only lookup. Pays per call via selat-pay (USDC via Circle Gateway), no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet for paid runs. The runner pays on whichever chain holds Gateway USDC. Every paid step hops the SELAT Router (`SELAT_ROUTER_URL`) — including Alchemy. `selat skill verify --live-probe` (no --pay) is free and needs no funded wallet; it prints `routed-x402` for Alchemy and Twitter.
metadata:
  author: SELAT-AI
  version: "1.2"
  rail: x402 via Circle Gateway
  kind: multi
---

# onchain-desk-brief

One **EVM wallet address** or one **protocol** in. A **cited desk brief** out.
Shipped steps are Alchemy + SELAT Twitter (`x402 via Circle Gateway`; verify
prints `routed-x402`). The intended third rail — **MPP on Tempo** via Allium
prices — is **parked**: `router.selat.ai` returns 502. Dune is **not** a pin
($4.20 session quote is not settleable under the $1 CLI ceiling).

This is **not** `financial-intel` (asset/ticker market brief), **not** a
hiring-signal or launch-watch skill, and **not** the retired holdings-only
lookup. Research only — never trade execution or financial advice.

## When To Use

Use when the user names **one wallet** (`0x…`) or **one protocol** and wants a
short, cited on-chain desk read that spans holdings and social chatter.

Do not use for "is \<asset\> a buy", ticker/macro fusion, hiring signals, or
launch watches — those are other skills. Do not use for Solana-inbound
addresses. If the user asks to trade on the result, decline that part and say so.

## Rails

Shipped settlement mode (skill `rail` is `x402 via Circle Gateway` — MPP is
parked, not a fake third step):

- **x402 via Circle Gateway** — Alchemy (`x402.alchemy.com`) and SELAT-native
  Twitter (`catalog.selat.ai`). Manifest rail stays this taxonomy label.
  `selat skill verify --live-probe` prints **`routed-x402`** for both.
  selat-pay 0.9.8 hops the SELAT Router for every paid call, including
  Gateway-capable Alchemy — this is **not** a no-router-hop claim.
- **MPP on Tempo — parked.** Allium
  `POST https://agents.allium.so/api/v1/developer/prices` (retired
  `allium-price` URL; catalog ~$0.02) is dual-protocol on a bare probe. Default
  selat-pay / `selat skill verify --live-probe` prefers MPP, then
  `router.selat.ai` returns `502 expected upstream 402 challenge, got 500`.
  Not pinned. Do not pretend it 402s through the router. Dune
  `POST /api/v1/sql/execute` live-quotes **$4.20** (`routed-mpp`, Tempo
  `session`) — not a settleable pin; not in the manifest.

The `selat` CLI auto-detects each step's protocol at call time. Rail names are
**not** a pay-chain claim — the buyer is the funded Gateway chain. A reachable
`SELAT_ROUTER_URL` is required for every shipped step, including Alchemy.

## Workflow

1. Install: `selat skill install onchain-desk-brief`
2. Normalize the ask into **one** subject:
   - Wallet `0x…` → `--address <0x>` (lowercase fine). Set `--twitter_query` to a
     known label or ticker, not the raw address.
   - Protocol name → `--protocol <name>` and `--twitter_query "<name> OR <TICKER>"`.
     Map the protocol to its EVM token/contract for `--address` (defaults are
     Uniswap UNI).
3. Tell the user the live quote and wait for a yes before spending. Do not
   pass `--yes`. Do not auto-pay. Live quotes (2026-08-21, probe-only):
   Twitter **$0.001** (`routed-x402`), Alchemy **$0.001** (`routed-x402`).
   Say the Allium prices MPP step is parked (router 502). Do not invent an
   Allium or Dune settleable quote.
4. Paid run (requires an **armed session budget**; the runner will refuse if none
   is armed):
   `selat skill run onchain-desk-brief --address <0x> --protocol <name> --twitter_query "<query>"`
5. The CLI compiles each step into a `selat-pay` call and prints each result.
   Afterwards, report what was actually spent.

Recommended agent procedure (cheapest-first; retarget **every** param — never let
the Uniswap defaults run for a different wallet or protocol):

1. **Social pulse** — SELAT-native Twitter advanced search (~$0.001,
   `routed-x402`). Raw tweets only; the agent scores tone and recency itself.
2. **On-chain footprint** — Alchemy `GET /data/v1/assets/tokens/by-address`
   (~$0.001, `routed-x402`). Wallet holdings or the protocol token/contract
   footprint.
3. **Synthesize** a compact cited brief: subject, on-chain footprint, social
   chatter, what would change the read, and source notes. Hedged and
   non-advisory. Do not call Allium or Dune from this skill.

Relay the brief in plain language with the dollar cost. Keep endpoint URLs and
raw JSON out of what the user sees. When the user only wants a subset, call the
individual steps with `selat-pay` instead of the full manifest.

If setup is missing (no wallet, no armed budget), **ask and wait**. Do not run
wallet-creation or init commands for the user.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `address` | yes | UNI token `0x1f98…f984` | EVM wallet or protocol-token/contract for Alchemy. |
| `protocol` | no | `uniswap` | Protocol or token name used to retarget `twitter_query`. |
| `twitter_query` | no | `uniswap OR UNI` | Twitter advanced-search query. |

Output: per-step JSON (tweets, Alchemy token footprint) that the agent fuses
into one cited, non-advisory desk brief.

## Gotchas

- **Pinned providers only.** Use Alchemy and SELAT Twitter as wired. Do not
  substitute QuickNode RPC, Allium, Dune, Exa, Nansen, CoinGecko, or in-skill
  catalog discover. Do not add a fake MPP step.
- **Alchemy is `routed-x402`.** Verify prints `routed-x402` for the Alchemy
  step. Do not claim a Gateway-batched nanopayment with **no router hop**.
  Do not claim Alchemy skips `SELAT_ROUTER_URL`.
- **Allium prices is parked (502).** Probe 2026-08-21, no `--pay`:
  `selat-pay POST https://agents.allium.so/api/v1/developer/prices` via
  `router.selat.ai` → `502 expected upstream 402 challenge, got 500`
  (`x402=yes mpp=yes`, `mode=routed-mpp`). Bare host 402 is ~$0.02. Not a
  router live-402. Not pinned.
- **Dune is not a pin.** `POST https://api.dune.com/api/v1/sql/execute`
  quotes **$4.20** `routed-mpp` (Tempo `session`) — above the $1 CLI ceiling.
  Removed from the manifest. Do not raise the ceiling.
- **Retarget the Uniswap defaults.** Verify uses UNI-flavored values so every
  shipped step is exercisable. A wallet run that leaves `twitter_query` on
  Uniswap researches the wrong desk.
- **GET params in the query.** Twitter and Alchemy are GET.
- **EVM only.** Do not pass Solana addresses, Arc, or CCTP paths.
- **`maxAmount` is a guardrail, not the price.** Per-step caps $0.01; full-run
  cap $0.50. Live quotes (2026-08-21): Twitter $0.001, Alchemy $0.001.
- **Twitter returns raw tweets.** Do not claim a finished sentiment score unless
  the response includes one.
- **Verify is free / probe-only.** `selat skill run` requires an armed session
  budget. No auto-pay. No `--yes`.
- **The live 402 is the source of truth.** If a step stops serving a challenge,
  `selat skill verify` flags it — omit it and re-add when the gateway serves it.
- **Non-advisory, always.** Cite the paid sources; do not present the brief as
  financial advice.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay`
> requires today — a probe reads a free, chain-independent quote and never
> settles. A real paid run resolves the settlement chain from your funded Circle
> Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/onchain-desk-brief`
- Live gate (free, probe-only — pass `--live-probe`, do **not** add `--pay`):
  `selat skill verify ./skills/onchain-desk-brief --live-probe --address 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --protocol uniswap --twitter_query "uniswap OR UNI"`
- Single-step probe (no pay):
  `selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0x1f9840a85d5af5bf1d1762f925bdaddc4201f984" --chain base --probe-only --live-probe`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the pinned endpoints, rails, parked MPP note, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
