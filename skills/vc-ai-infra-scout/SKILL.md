---
name: vc-ai-infra-scout
description: Use when the user wants VC-style deal-sourcing intelligence on AI infrastructure (inference, GPU, training, agent infra), crypto-AI / decentralized compute, robotics / embodied-AI (foundation models, humanoid, sim-to-real), or agentic payments. Runs a 9-step discovery pipeline across Tavily, Exa, Product Hunt, Twitter/X, LinkedIn, and Apollo. Paid per call over mixed x402 + MPP rails. No API keys.
license: Apache-2.0
compatibility: Requires selat CLI >= 1.0, selat-pay >= 0.3.2, and a funded Circle Gateway balance.
metadata:
  author: SELAT-AI + user-updated
  version: "1.1.0"
  rail: routed
  kind: multi
  maxCostUsd: "0.40"
---

# vc-ai-infra-scout

## When To Use

Use this skill when the user wants to discover early-stage companies, funding rounds, founders, and investor theses across the AI-infrastructure ecosystem. Covers four sub-theses:

- **AI Infrastructure** — inference runtimes, GPU orchestration, training stacks, vector/data infra
- **Crypto-AI / Decentralized AI** — on-chain AI agents, DePIN-for-compute, distributed GPU/ML
- **Robotics / Embodied AI** — robotics foundation models, humanoid/embodied-AI, sim-to-real, actuation/sensor stacks
- **Agentic Payments** — agent commerce, x402/stablecoin agent settlement, agentic-payment rails

## Workflow

1. Install: `selat skill install vc-ai-infra-scout`
2. Run with thesis override: `selat skill run vc-ai-infra-scout --thesis "robotics foundation model" --twitterQuery "robotics foundation model" --fundraisingQuery "robotics startup raised seed" --investorQuery "robotics VC partner" --domain "modal.com"`
3. The skill compiles each of 9 steps into `selat-pay` calls and returns a JSON response.
4. Synthesize the 9 steps into a VC intelligence memo (tiered funding map, investor thesis extraction, geographic blindspots, strategic recommendations).

## Pipeline Steps

| Step | Source | Rail | Purpose |
|------|--------|------|---------|
| 1 | Tavily (x402 Base) | x402 on Base | Broad web discovery for `${thesis} startup funding` |
| 2 | Parallel MPP | MPP Tempo | Product Hunt launches scoped to `${thesis}` |
| 3 | Exa | MPP Tempo | Deep web context on startup + funding signals |
| 4 | Twitter/X advanced_search | x402 Gateway | Founder buzz, company chatter |
| 5 | Twitter/X advanced_search | x402 Gateway | Recent pre-seed/seed fundraising news |
| 6 | Tavily (LinkedIn scope) | x402 on Base | LinkedIn post search for funding announcements |
| 7 | Twitter/X advanced_search | x402 Gateway | Investor/fund-partner thesis tweets |
| 8 | Apollo people-search | MPP Tempo | Founder shortlist by keyword + title |
| 9 | Apollo org-enrichment | MPP Tempo | Deep-dive enrichment on the target domain |

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `thesis` | yes | `AI infrastructure` | Core search term. Try: `robotics foundation model`, `humanoid robotics`, `decentralized AI compute`, `agentic payment rails` |
| `twitterQuery` | no | `AI infra founder` | Twitter/X search for founder buzz. Override for your thesis: e.g. `robotics foundation model` |
| `fundraisingQuery` | no | `startup raised seed funding round` | Fundraising news query. Override: `robotics startup raised seed funding` |
| `investorQuery` | no | `seed fund partner thesis` | Investor/partner chatter. Override: `robotics seed fund partner` |
| `domain` | no | `modal.com` | Top company's domain for Apollo org-enrichment. Must override to the best lead. |

**Output:** JSON with `ok`, `skill`, `user_summary`, and `steps[]` array containing per-step API responses.

## Gotchas

- **Intent fidelity:** Robotics foundation-model queries can display lower surface area on Hacker News / Product Hunt than infra queries. Steps 1–3 may miss early-stage robotics companies that are stealth or academic. Supplement with direct `selat-pay` Twitter/X advanced_search when needed.
- **Timeout leakage:** Running via `selat skill run twitter-research` can time out and leave background micropayments settling against session budget. Use `selat-pay` directly for single-calls to avoid this.
- **Invalid — no SKILL.md:** `selat skill validate` fails if `SKILL.md` is missing. The scaffold creates it; keep it updated.
- **Domain must be overridden:** If you leave `domain` as `modal.com`, step 9 will enrich Modal regardless of whether Modal was surfaced by your thesis. Always pick the most interesting company from steps 1–7.
- **Embodied AI null on Twitter:** The phrase "embodied AI" frequently returns zero tweets. Use `physical AI`, `foundation model for robots`, or company-specific hashtags instead.

## Validation

- Probe (no pay): `selat skill verify /path/to/vc-ai-infra-scout`
- Full run: `selat skill run vc-ai-infra-scout --thesis "<your thesis>" --json`
- A successful run prints `status=200` for each step.

## Cost Estimate

| Step | Endpoint | Quoted Price |
|------|----------|-------------|
| 1 | Tavily | $0.0105 |
| 2 | Parallel MPP | $0.0105 |
| 3 | Exa | $0.00735 |
| 4–5–7 | Twitter/X ×3 | $0.001 × 3 = $0.003 |
| 6 | Tavily (LinkedIn) | $0.0105 |
| 8 | Apollo people | $0.00525 |
| 9 | Apollo org | $0.0084 |
| **Total** | | **~$0.055** |

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — catalogue endpoints called by this skill.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
