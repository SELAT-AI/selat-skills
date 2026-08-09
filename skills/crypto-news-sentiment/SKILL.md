---
name: crypto-news-sentiment
description: Use this skill when the user wants to fetch recent cryptocurrency news and social/KOL market sentiment — e.g. "get recent crypto news", "check crypto market sentiment", "show kol sentiment". Calls Otto AI's news and sentiment endpoints over direct x402 (~$0.00315 total).
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: ajimatimati
  version: "1.0"
  rail: direct
  kind: multi
---

# crypto-news-sentiment

## When To Use

Use this skill when you need to gather recent crypto news headlines along with social media/KOL market sentiment metrics to evaluate current market trends.

## Workflow

1. Install: `selat skill install crypto-news-sentiment`
2. Run: `selat skill run crypto-news-sentiment`
3. The CLI compiles each step into a `selat-pay` call and prints the result.

Step 1: **Otto AI /crypto-news** `GET /crypto-news` — direct x402 ($0.001).
Step 2: **Otto AI /kol-sentiment** `GET /kol-sentiment` — direct x402 ($0.002).

## Inputs And Outputs

No input parameters are required.

Output:
- Recent crypto news list (headlines, sources, links)
- KOL sentiment summary (bullish/bearish indicators)

## Gotchas

- Requires a funded balance on Base network. Step 1 is priced at $0.001 ($0.00105 verified) and Step 2 is priced at $0.002 ($0.0021 verified), for a total run cost of ~$0.00315.

## Validation

- Probe (no pay): `selat-pay GET "https://x402.ottoai.services/crypto-news" --chain base --probe-only`
- Probe (no pay): `selat-pay GET "https://x402.ottoai.services/kol-sentiment" --chain base --probe-only`

```json
{
  "receipt": "skills/crypto-news-sentiment/.selat/verify-receipt.json",
  "verified": true,
  "steps": [
    { "step": 1, "url": "https://x402.ottoai.services/crypto-news", "price": "$0.00105", "cap": "$0.01" },
    { "step": 2, "url": "https://x402.ottoai.services/kol-sentiment", "price": "$0.0021", "cap": "$0.01" }
  ]
}
```

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
