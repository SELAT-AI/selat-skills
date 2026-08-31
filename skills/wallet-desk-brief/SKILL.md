---
name: wallet-desk-brief
description: "Use this skill when the user supplies one explicit non-zero EVM address and wants a bounded, read-only wallet attribution-and-holdings snapshot—for example, 'what public label is associated with this wallet?', 'show this address's token footprint on the supported networks', or 'cross-check an Arkham label against holdings context'. It runs a fixed pair: Alchemy token holdings across five named networks and Arkham's probabilistic address intelligence. Require a free live quote and explicit cost approval before paying. It does not prove real-world ownership, cover every EVM chain, provide financial advice, or execute trades."
license: Apache-2.0
compatibility: "Requires the selat CLI and its bundled selat-pay. Paid runs need a funded Circle Agent Wallet and an armed session budget. Both calls currently traverse the SELAT Router as routed x402. `selat skill verify --live-probe` without `--pay` is free and needs no funded wallet."
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: x402 via Circle Gateway
  kind: multi
---

# wallet-desk-brief

A fixed two-call, read-only snapshot for one explicit EVM address. It retrieves
token holdings across five named networks and a separate probabilistic address
label, then returns two raw responses for the calling agent to reconcile. The
manifest does not prove ownership, merge results, score risk, or place trades.

## When To Use

Use this skill for public-blockchain research on one complete address when the
user wants both:

- a bounded token-holdings snapshot; and
- any label or entity association the attribution provider returns.

Do not use it for an asset/ticker outlook, protocol research, transaction-flow
analysis, compliance decisions, Solana-only addresses, ENS resolution, private
identity discovery, or order execution. A request to buy, sell, transfer, or
freeze assets is outside this read-only workflow.

## Input Gate

Require `address` to match `^0x[0-9a-fA-F]{40}$` and reject the all-zero address.
Do not accept `0x...`, an ENS name, a transaction hash, or a sample fallback.
Echo the normalized address and fixed network scope before verification so the
user can catch a mistargeted query.

Public-chain visibility does not make an attribution infallible. Do not infer a
private person's identity, intent, criminality, solvency, or control of the
address from a label or token balance alone.

## Rails And Fixed Pipeline

Both calls currently quote as `routed-x402` through the SELAT Router:

1. **Alchemy token holdings** — one POST request across Ethereum, Base, Polygon
   PoS, Arbitrum, and Optimism mainnets. Metadata, available USD prices, native
   tokens, and ERC-20 tokens are requested.
2. **Arkham address intelligence** — one POST request with the same address.
   The optional chain field is omitted, so preserve the chain returned by the
   provider and do not generalize the label to every chain.

This is a fixed pipeline, not a menu or fallback. The runner executes both calls
in order and may continue after an individual failure.

## Workflow

1. Validate the explicit address locally using the Input Gate above.
2. Run the free live gate:

   ```bash
   selat skill validate ./skills/wallet-desk-brief
   selat skill verify ./skills/wallet-desk-brief \
     --address <explicit-non-zero-evm-address> \
     --live-probe
   ```

3. Show both live routes and quotes, the expected cumulative cost, the sum of
   source-defined per-call caps, the proposed absolute session cap, and current
   transactability cautions. Explain that a paid application error may still be
   charged. Stop for explicit approval.
4. If wallet setup or funding is missing, treat it as a separate action requiring
   separate approval. Do not run `selat init` or `selat fund` implicitly.
5. After approval, arm only the approved cumulative session cap, execute exactly
   once, and disarm immediately after success or failure:

   ```bash
   selat budget start --amount <approved-session-cap>
   selat skill run wallet-desk-brief \
     --address <the-exact-approved-evm-address>
   selat budget stop
   ```

6. Inspect per-step status and payment history before any retry. Refresh the
   affected quote and obtain new approval; never rerun the whole pair
   automatically when only one step failed.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `address` | yes | none | One explicit non-zero EVM address used unchanged by both reads. |

The runner returns two independent raw JSON responses. The calling agent—not
the manifest—must normalize and synthesize them.

For holdings, preserve:

- the queried address and exact network for every token;
- raw balance, decimals, symbol/name, and token contract when available;
- price value and price timestamp when supplied;
- top-level `partialErrors` and per-token errors;
- pagination or truncation indicators.

For attribution, preserve:

- returned chain, entity, label, and contract/user-address flags;
- null or missing attribution as **unlabeled**, not anonymous or safe;
- provider confidence or evidence fields when present.

## Synthesis Rules

Return a compact, non-advisory brief containing:

1. Exact queried address, retrieval time, and the five-network holdings scope.
2. Arkham's returned label/entity and chain, explicitly described as a
   probabilistic provider attribution—not verified ownership.
3. Holdings by network, with raw balance conversions and price timestamps only
   when the response supplies enough metadata.
4. Partial-network failures, missing prices, pagination limits, spam/airdropped
   token caveats, and other evidence gaps.
5. Agreements or conflicts between the label and holdings without treating a
   token balance as proof of identity, intent, endorsement, or control.
6. Per-step success/failure, any charged error, and final settled cost.

Do not calculate a complete net worth unless every included holding has a valid,
time-stamped price and the result is demonstrably complete. Do not treat receipt
of a spam token or dust as evidence that the wallet chose or endorsed it. Keep
provider endpoint URLs and raw JSON out of the user-facing brief while citing
appropriate public evidence where available.

## Gotchas

- **The documented Alchemy contract is POST.** The body contains an `addresses`
  array and explicit networks. A GET/query request can expose a payment challenge
  but does not prove the post-payment business request is valid.
- **The network scope is fixed and incomplete.** No holdings on other EVM chains,
  Solana, Bitcoin, or exchange-internal accounts are retrieved.
- **Polygon's Portfolio API identifier is `matic-mainnet`.** Do not substitute a
  node-RPC hostname label in this request body.
- **Attribution is not ownership proof.** Labels can be incomplete, contested, or
  revised as intelligence changes.
- **A 200 can contain partial errors.** Inspect Alchemy's top-level network errors
  and individual token errors before calling the snapshot complete.
- **Caps are not prices.** Re-quote before each paid run and use the step-cap sum
  as the absolute maximum session exposure.
- **Paid failures may charge.** The runner may continue. Never auto-retry.
- **No default address.** Missing or malformed input must fail before any probe.

## Validation

- Static: `selat skill validate ./skills/wallet-desk-brief`
- Missing-input gate: `selat skill verify ./skills/wallet-desk-brief --live-probe`
  must fail before probing either endpoint.
- Free live gate:
  `selat skill verify ./skills/wallet-desk-brief --address 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --live-probe`
- Single-step free probes: see `references/endpoints.md`.
- Paid confirmation: add `--pay` only after a fresh quote, explicit approval, and
  an armed session budget. Never reuse approval after an address, route, quote,
  or cap changes.

## References

- `manifest.json` — the machine-readable fixed payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — request contracts,
  current routes, quotes, and interpretation limits.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md)
  — authoring standard.
- Alchemy Tokens By Wallet documentation —
  https://www.alchemy.com/docs/data/portfolio-apis/portfolio-api-endpoints/portfolio-api-endpoints/get-tokens-by-address
- Arkham API Guide — https://arkm.com/docs

Alchemy and Arkham are third-party services. Their names and trademarks belong
to their respective owners and are used only to identify the endpoints called.
