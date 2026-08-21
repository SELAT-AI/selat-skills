---
name: onchain-desk-brief
description: Use this skill when the user wants a cited on-chain desk brief on one EVM wallet or one protocol — e.g. "desk brief on 0x...", "what's on this wallet", "protocol brief on Uniswap", "cited on-chain read of Aave", "wallet holdings plus social chatter for <address>", "what is happening around <protocol> on-chain". Pins Alchemy token-by-address (x402 via Circle Gateway), Allium token search + latest price (MPP on Tempo), and SELAT-native Twitter (x402 via Circle Gateway on catalog.selat.ai). Not financial-intel (asset/ticker market brief), not hiring-signal-scout, not cited-launch-watch, not a holdings-only lookup. Pays per call via selat-pay (USDC via Circle Gateway), no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet for paid runs. The runner pays on whichever chain holds Gateway USDC. Allium and SELAT Twitter need a reachable SELAT Router (SELAT_ROUTER_URL); the Alchemy step does not. `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
  kind: multi
---

# onchain-desk-brief

One **EVM wallet address** or one **protocol** in. A **cited desk brief** out.
The skill gathers paid signal across **two settlement modes** — Circle
Gateway-batched nanopayment (`x402 via Circle Gateway`, Alchemy + SELAT Twitter)
and **MPP on Tempo** (Allium) — and the agent fuses it into one brief: what the
wallet or protocol holds on-chain, how its token is identified and priced, and
what X/Twitter is saying — with citations.

This is **not** `financial-intel` (asset/ticker market brief), **not** a
hiring-signal or launch-watch skill, and **not** the retired holdings-only
lookup. Research only — never trade execution or financial advice.

## When To Use

Use when the user names **one wallet** (`0x…`) or **one protocol** and wants a
short, cited on-chain desk read that spans holdings, token identity/price, and
social chatter.

Do not use for "is \<asset\> a buy", ticker/macro fusion, hiring signals, or
launch watches — those are other skills. Do not use for Solana-inbound
addresses. If the user asks to trade on the result, decline that part and say so.

## Rails

This skill spans **two settlement modes**, so the skill's `rail` is `mixed`:

- **x402 via Circle Gateway** — Alchemy (`x402.alchemy.com`) serves a Gateway-batched
  nanopayment paid straight to the upstream, **no router hop**. SELAT-native
  Twitter (`catalog.selat.ai`) is the same rail **through** the SELAT Router.
- **MPP on Tempo** — Allium (`agents.allium.so`) settles `MPP on Tempo` through
  the SELAT Router (Tempo `charge`; a bare probe also shows an x402 challenge).

The `selat` CLI auto-detects each step's protocol at call time. Rail names are
**not** a pay-chain claim — the buyer is the funded Gateway chain. A reachable
`SELAT_ROUTER_URL` is required for Allium and Twitter, not for Alchemy.

## Workflow

1. Install: `selat skill install onchain-desk-brief`
2. Normalize the ask into **one** subject:
   - Wallet `0x…` → `--address <0x>` (lowercase fine). Set `--twitter_query` to a
     known label or ticker, not the raw address. Keep `--protocol` / `--tokenAddress`
     on a related EVM token if the user named one; otherwise leave ETH/USDC-class
     defaults only when they still describe the same desk.
   - Protocol name → `--protocol <name>` and `--twitter_query "<name> OR <TICKER>"`.
     Map the protocol to its EVM token/contract for `--address` and `--tokenAddress`
     (defaults are Uniswap UNI). Allium search is the identity step when the map
     is uncertain.
3. Tell the user the live quote: a full run is about **five cents** (four paid
   calls, capped at $0.50) — "this pulls four paid feeds for about $0.05 — proceed?"
   Wait for a yes before spending. Do not pass `--yes`. Do not auto-pay.
4. Paid run (requires an **armed session budget**; the runner will refuse if none
   is armed):
   `selat skill run onchain-desk-brief --address <0x> --protocol <name> --tokenChain ethereum --tokenAddress <0x> --twitter_query "<query>"`
5. The CLI compiles each step into a `selat-pay` call and prints each result.
   Afterwards, report what was actually spent.

Recommended agent procedure (cheapest-first; retarget **every** param — never let
the Uniswap defaults run for a different wallet or protocol):

1. **Social pulse** — SELAT-native Twitter advanced search (~$0.001). Raw tweets
   only; the agent scores tone and recency itself.
2. **On-chain footprint** — Alchemy `GET /data/v1/assets/tokens/by-address`
   (~$0.001). Wallet holdings or the protocol token/contract footprint.
3. **Token identity** — Allium `GET /api/v1/developer/tokens/search` (~$0.03):
   name, symbol, holders, volume, FDV for `${protocol}` on `${tokenChain}`.
4. **Latest price** — Allium `POST /api/v1/developer/prices` (~$0.02) for
   `${tokenAddress}` on `${tokenChain}`.
5. **Synthesize** a compact cited brief: subject, on-chain footprint, token
   identity and price, social chatter, what would change the read, and source
   notes. Hedged and non-advisory.

Relay the brief in plain language with the dollar cost. Keep endpoint URLs and
raw JSON out of what the user sees. When the user only wants a subset, call the
individual steps with `selat-pay` instead of the full manifest.

If setup is missing (no wallet, no armed budget), **ask and wait**. Do not run
wallet-creation or init commands for the user.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `address` | yes | UNI token `0x1f98…f984` | EVM wallet or protocol-token/contract for Alchemy. |
| `protocol` | no | `uniswap` | Protocol or token name for Allium search. |
| `tokenChain` | no | `ethereum` | Allium chain (EVM only). |
| `tokenAddress` | no | UNI token | Token contract for Allium latest price. Native ETH = zero address. |
| `twitter_query` | no | `uniswap OR UNI` | Twitter advanced-search query. |

Output: per-step JSON (tweets, Alchemy token footprint, Allium search hits,
Allium price) that the agent fuses into one cited, non-advisory desk brief.

## Gotchas

- **Pinned providers only.** Use Alchemy, Allium, and SELAT Twitter as wired.
  Do not substitute QuickNode RPC, Dune session-MPP, Exa, Nansen, CoinGecko, or
  in-skill catalog discover. QuickNode (`x402.quicknode.com`) is JSON-RPC, not
  this brief. Dune (`api.dune.com`) 402s as Tempo `session`, not the `charge`
  MPP this repo pins.
- **Retarget the Uniswap defaults.** Verify uses UNI-flavored values so every
  step is exercisable. A wallet run that leaves `protocol` / `twitter_query` on
  Uniswap researches the wrong desk.
- **GET params in the query, POST params in `body`.** Twitter and Alchemy are
  GET; Allium search is GET (`q`, `chain`); Allium prices is POST with a
  **JSON array** `[{ "chain", "token_address" }]`.
- **Allium is dual-protocol.** A bare probe 402s with both an x402 `accepts`
  list and `WWW-Authenticate: Payment` (`method=tempo`, `intent=charge`). Pin
  the rail as `MPP on Tempo` — same taxonomy as other selat-skills. Don't flip
  the rail from the x402 half of a bare probe.
- **Allium MPP through the SELAT Router 500s today.** `selat-pay` prefers MPP
  when both challenges are present, then the router returns
  `expected upstream 402 challenge, got 500`. A hand-built Allium call with
  `--prefer-x402` quotes through the router (search ~$0.0315, prices ~$0.021).
  `selat skill run` cannot pass that flag — if those two steps fail, rerun just
  the Allium URLs via `selat-pay … --prefer-x402` after the user confirms spend.
  Dune (`api.dune.com`) was probed as the other MPP family host; it 402s as
  Tempo `session` at a ~$4.20 router quote and is not pinned.
- **EVM only.** Do not pass Solana addresses, `tokenChain=solana`, Arc, or CCTP
  paths.
- **`maxAmount` is a guardrail, not the price.** Per-step caps are $0.01
  (Alchemy, Twitter) and $0.10 (Allium); full-run cap $0.50. Live quotes
  (2026-08-21): Twitter $0.001, Alchemy $0.001, Allium search $0.03 bare /
  $0.0315 via `--prefer-x402`, Allium prices $0.02 bare / $0.021 via
  `--prefer-x402`. Router quotes can sit a few percent above the bare 402.
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
  `selat skill verify ./skills/onchain-desk-brief --live-probe --address 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --protocol uniswap --tokenChain ethereum --tokenAddress 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --twitter_query "uniswap OR UNI"`
- Single-step probe (no pay):
  `selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0x1f9840a85d5af5bf1d1762f925bdaddc4201f984" --chain base --probe-only`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the pinned endpoints, rails, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
