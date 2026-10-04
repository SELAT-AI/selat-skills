# Verification status

Last checked 2026-10-04 with free live probes (`selat-pay --probe-only
--live-probe`). Nothing was signed or paid.

## Static Validation

`selat skill validate ./skills/self-evolving-agent` passes, as does the
repository-wide `node scripts/validate-skills.mjs` gate.

## Live 402 Verification

The manifest is a fixed three-call, read-only preflight:

- `https://x402.ottoai.services/kol-sentiment`
- `https://x402.ottoai.services/hyperliquid-market?asset=${asset}`
- `https://stabledomains.dev/api/check`

The no-param command fails closed before network access because `asset` and
`domainCandidate` are required. The free gate is:

```bash
selat skill verify ./skills/self-evolving-agent \
  --asset BTC \
  --domainCandidate agent-alpha-research.com \
  --live-probe
```

Latest probe (2026-10-04):

| Step | Mode | Live price | Cap |
| --- | --- | --- | --- |
| Otto KOL sentiment | `routed-x402` | $0.00315 | $0.004 |
| Otto Hyperliquid market (`BTC`) | `routed-x402` | $0.00105 | $0.002 |
| StableDomains (`agent-alpha-research.com`) | `routed-mpp` | $0.0105 | $0.075 |

- Expected total: `$0.0147` (`.com`-class domain); `$0.0567` with an
  `.ai`/`.io`-class domain, which quotes `$0.0525` for step 3.
- Sum of per-step caps: `$0.081`.
- A malformed or unsupported domain quotes `$0.105` for step 3 and is refused
  by the cap before payment.

Run `selat skill verify ... --live-probe` again after manifest edits. Live
probe results are authoritative.

This is a quote and live-schema check only. It does not prove post-payment
output. No paid verification was run.
