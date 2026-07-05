# Verification status

Checked on 2026-06-30.

## Static Validation

`selat skill validate skills/self-evolving-agent` passes.

## Live 402 Verification

The current manifest is an unpaid intelligence preflight for the budgeted
economic-agent definition. It probes social sentiment, market context, and domain
availability before any infrastructure purchase or trading step.

Current manifest endpoints:

- `https://x402.ottoai.services/kol-sentiment`
- `https://x402.ottoai.services/hyperliquid-market`
- `https://stabledomains.dev/api/check`

`selat skill verify skills/self-evolving-agent` passes in unpaid probe mode.

Latest receipt:

- verified at: `2026-06-30T08:19:01.583Z`
- step 1: Otto KOL sentiment, routed x402, live price `$0.00105`, cap `$0.010`
- step 2: Otto Hyperliquid market, routed x402, live price `$0.00105`, cap `$0.010`
- step 3: StableDomains availability, routed MPP, live price `$0.0105`, cap `$0.015`
- receipt file: `skills/self-evolving-agent/.selat/verify-receipt.json`

Run `selat skill verify skills/self-evolving-agent` again after manifest edits.
Live probe results are authoritative.

This verification is a quote check only. It does not fund Gateway, buy domains,
purchase compute, or place trades.

The guidance portion of the skill remains usable as a local Agent Skill.
