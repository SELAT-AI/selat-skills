---
name: crypto-news-sentiment
description: Use this skill when the user wants to fetch recent cryptocurrency news and social/KOL market sentiment — e.g. "get recent crypto news", "check crypto market sentiment", "show kol sentiment". Calls Otto AI's news and sentiment endpoints over direct x402.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.2, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: plentyfass
  version: "1.0"
  rail: direct
  kind: single
---

# crypto-news-sentiment

## When To Use

Use this skill when you need to gather recent crypto news headlines along with social media/KOL market sentiment metrics to evaluate current market trends.

## Workflow

1. Install: `selat skill install crypto-news-sentiment`
2. Run: `selat skill run crypto-news-sentiment`
3. The CLI compiles each step into a `selat-pay` call and prints the result.

Step 1: **Otto AI /crypto-news** `GET /crypto-news` — direct x402.
Step 2: **Otto AI /kol-sentiment** `GET /kol-sentiment` — direct x402.

## Inputs And Outputs

No input parameters are required.

Output:
- Recent crypto news list (headlines, sources, links)
- KOL sentiment summary (bullish/bearish indicators)

## Gotchas

- Requires a funded balance on Base network. Each call is priced at $0.001 (total cost ~$0.002).

## Validation

- Probe (no pay): `selat-pay GET "https://x402.ottoai.services/crypto-news" --chain base --probe-only`
- Probe (no pay): `selat-pay GET "https://x402.ottoai.services/kol-sentiment" --chain base --probe-only`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
