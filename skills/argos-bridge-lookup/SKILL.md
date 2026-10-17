---
name: argos-bridge-lookup
description: Use this skill when the user wants to check an ERC-20 token's Arc/Base CTS bridge connection, find its original or wrapped token, inspect wrapped supply, or verify whether its wrapper is ownerless. This is a paid read-only lookup, not a token transfer, wrapper deployment, balance lookup or general bridge aggregator.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.12.4, a reachable SELAT Router (SELAT_ROUTER_URL), network access and a supported funded wallet for paid execution.
metadata:
  author: Argos Bot
  version: "1.0"
  rail: routed
  kind: single
---

# Argos bridge lookup

## When To Use

Check a supplied ERC-20 contract on Arc or Base for its Circle CTS connection,
original/wrapped token mapping, wrapped supply and ownerless verification.
Do not use this skill to create a wrapper or move assets.

## Workflow

1. Obtain the token contract address and its chain. Reject addresses that do not
   match `^0x[0-9a-fA-F]{40}$`. Resolve chain ambiguity before spending; never
   infer an address from a ticker alone. Accept `arc` or `base`, and `latest` or
   `finalized` finality. The default lookup chain is Arc, not the payment chain.
2. Tell the user the lookup currently costs about 0.005 USDC, with a maximum
   allowance of 0.0075 USDC. Obtain spending approval unless already authorized.
3. Install and run the skill, replacing the example with the supplied address:

   ```bash
   selat skill install argos-bridge-lookup
   selat skill run argos-bridge-lookup --tokenAddress <ERC20_ADDRESS> --lookupChain arc --finality latest
   ```

4. Interpret `result.status` and each candidate's `status`, `connectionExists`
   and `ownerlessVerified`. Report original/wrapped mapping and wrapped supply
   only when returned. Say explicitly when no connection exists, the wrapper is
   missing, verification fails, or data is unavailable or ambiguous.
5. Tell the user the chain pair, verification outcome, supply if available and
   observation time. Mention cached results and their age when present. Prefer
   plain language; include contract addresses or raw JSON only when requested.

## Inputs And Outputs

| Input | Required | Default | Meaning |
|---|---|---|---|
| `tokenAddress` | yes | none | Original or wrapped ERC-20 contract |
| `lookupChain` | no | `arc` | Chain containing that contract: `arc` or `base` |
| `finality` | no | `latest` | `latest` or `finalized` observations |

The response contains `requestId`, `payment` and `result`. The result can include
candidate mappings, verification evidence, contracts, wrapped supply and
operational information. Read `references/endpoints.md` for exact fields.

## Gotchas

- This is one paid read-only request; it never signs or broadcasts bridge transactions.
- A successful HTTP response does not guarantee a verified bridge connection.
- Unknown/null verification is not a negative finding or proof of safety.
- Wrapped supply is not the user's wallet balance or transferable liquidity.
- Lookup finality does not prove a payment or bridge transaction is finalized.
- Do not automatically repeat a paid request after an uncertain settlement.
- The cap is a per-call spending limit, not the advertised price.
- Arc Gateway and Base exact-payment offers are distinct. A catalog label alone
  does not prove that a particular wallet/payment mode is supported; use the live challenge.

## Validation

Free live challenge verification (no payment or funded wallet):

```bash
selat skill verify ./skills/argos-bridge-lookup --live-probe --tokenAddress 0xece5ca8bf9220718e5727754026757512212cb3c --lookupChain arc --finality latest
```

A free probe proves a reachable payment challenge within the cap. It does not
prove paid delivery. A maintainer must perform a separately authorized capped
paid verification before merge. Evaluation cases are specifications, not claims
that paid responses were exercised.

## References

- `manifest.json` — one-call payment recipe.
- `references/endpoints.md` — request and response schema and discovery provenance.
- `evals/evals.json` — expected behavior and failure interpretation.
- https://bridge-api.argosbot.io/openapi.json — public API specification.
- https://argosbot.io/x402 — service information.

Argos Bot provides this service independently; protocol names do not imply
endorsement by Circle, Arc, Base or SELAT.
