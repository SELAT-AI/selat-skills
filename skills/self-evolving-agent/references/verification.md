# Verification status

Checked on 2026-08-31 with SELAT CLI 0.16.15.

## Static Validation

`selat skill validate ./skills/self-evolving-agent` passes, as does the
repository-wide `node scripts/validate-skills.mjs` gate.

## Live 402 Verification

The current manifest is a fixed three-call, read-only intelligence preflight for
the budgeted economic-agent definition. It probes broad social sentiment,
asset-specific market context, and domain availability before any
infrastructure purchase or trading step.

Current manifest endpoints:

- `https://x402.ottoai.services/kol-sentiment`
- `https://x402.ottoai.services/hyperliquid-market?asset=${asset}`
- `https://stabledomains.dev/api/check`

The no-param command fails closed before network access because `asset` and
`domainCandidate` are required. The successful free gate is:

```bash
selat skill verify ./skills/self-evolving-agent \
  --asset BTC \
  --domainCandidate agent-alpha-research.com \
  --live-probe
```

Latest receipt:

- verified at: `2026-08-31T21:49:31.480Z`
- step 1: Otto KOL sentiment, `routed-x402`, live price `$0.00315`, cap `$0.004`
- step 2: Otto Hyperliquid market for `BTC`, `routed-x402`, live price `$0.00105`, cap `$0.002`
- step 3: StableDomains availability, `routed-mpp`, live price `$0.0105`, cap `$0.012`
- expected total: `$0.01470`
- cumulative cap: `$0.018`
- receipt file: `skills/self-evolving-agent/.selat/verify-receipt.json`

Run `selat skill verify skills/self-evolving-agent` again after manifest edits.
Live probe results are authoritative.

This verification is a quote and live-schema check only. It does not prove
post-payment output, fund Gateway, buy domains, purchase compute, or place
trades. No paid verification was run during this check.

The guidance portion of the skill remains usable as a local Agent Skill.
