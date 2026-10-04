---
name: vc-ai-infra-scout
description: Use this skill when the user wants VC-style deal-sourcing intelligence on AI infrastructure (inference, GPU, training, agent infra), crypto-AI / decentralized compute, robotics / embodied-AI (foundation models, humanoid, sim-to-real), or agentic payments. Runs a 9-step discovery pipeline across Tavily, Parallel (Product Hunt), Exa, SELAT-native Twitter/X, LinkedIn posts (via Tavily), and Apollo. Paid per call over mixed x402 + MPP rails through the SELAT Router. No API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.12.0 (for `--live-probe`), and a funded Circle Gateway balance (the runner pays on whichever chain holds it). Every step routes through the SELAT Router, so a reachable SELAT Router (SELAT_ROUTER_URL) is required. `selat skill verify --live-probe` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.2"
  rail: mixed
  kind: multi
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
2. Pick a thesis preset (see **Thesis Presets**) and a target company, then run: `selat skill run vc-ai-infra-scout --thesis "robotics foundation model" --twitterQuery "robotics foundation model" --fundraisingQuery "robotics startup raised seed funding" --investorQuery "robotics seed fund partner" --domain "<target-domain>"`. `--domain` is required: the run is refused without it.
   Before running, tell the user the cost: all 9 steps run every time, about $0.087 at live prices. Wait for a yes.
3. The skill compiles each of 9 steps into `selat-pay` calls and returns a JSON response.
4. Synthesize the 9 steps into a VC intelligence memo (tiered funding map, investor thesis extraction, geographic blindspots, strategic recommendations).

## Pipeline Steps

| Step | Source | Rail | Purpose |
|------|--------|------|---------|
| 1 | Tavily | x402 on Base | Broad web discovery for `${thesis} startup funding` |
| 2 | Parallel (Product Hunt scope) | MPP on Tempo | Product Hunt launches scoped to `${thesis}` |
| 3 | Exa | x402 via Circle Gateway | Deep web context on startup + funding signals |
| 4 | SELAT-native Twitter/X advanced_search | x402 via Circle Gateway | Founder buzz, company chatter |
| 5 | SELAT-native Twitter/X advanced_search | x402 via Circle Gateway | Recent pre-seed/seed fundraising news |
| 6 | Tavily (LinkedIn scope) | x402 on Base | LinkedIn post search for funding announcements |
| 7 | SELAT-native Twitter/X advanced_search | x402 via Circle Gateway | Investor/fund-partner thesis tweets |
| 8 | Apollo people-search | MPP on Tempo | Founder shortlist by keyword + title |
| 9 | Apollo org-enrichment | MPP on Tempo | Deep-dive enrichment on the target domain |

Rail labels name each merchant's rail, not the chain you pay from. The SELAT
Router settles every step from your funded Circle Gateway balance.

## Thesis Presets

The manifest has no preset mechanism, so each preset is a set of flags to copy. Always add `--domain`.

| Track | `--thesis` | `--twitterQuery` | `--fundraisingQuery` | `--investorQuery` |
|---|---|---|---|---|
| AI infrastructure | `AI infrastructure` | `AI infra founder` | `AI infra startup raised seed` | `AI infra VC partner thesis` |
| Robotics / embodied AI | `robotics foundation model` | `robotics foundation model` | `robotics startup raised seed funding` | `robotics seed fund partner` |
| Crypto-AI / DePIN | `decentralized AI compute` | `decentralized AI compute founder` | `decentralized AI startup raised seed` | `crypto AI VC partner thesis` |
| Agentic payments | `agentic payment rails` | `agentic payments founder` | `agentic payment startup raise` | `agentic payments VC partner thesis` |

For robotics, avoid the phrase "embodied AI" in Twitter queries (see Gotchas).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `thesis` | no | `AI infrastructure` | Core search term. Try: `robotics foundation model`, `humanoid robotics`, `decentralized AI compute`, `agentic payment rails` |
| `twitterQuery` | no | `AI infra founder` | Twitter/X search for founder buzz. Override for your thesis: e.g. `robotics foundation model` |
| `fundraisingQuery` | no | `startup raised seed pre-seed funding round` | Fundraising news query. Override: `robotics startup raised seed funding` |
| `investorQuery` | no | `seed fund partner thesis` | Investor/partner chatter. Override: `robotics seed fund partner` |
| `domain` | **yes** | none | Domain of the one company to enrich in step 9 (Apollo org-enrichment). No default, so a placeholder can never silently enrich an unrelated company. |

**Output:** JSON with `ok`, `skill`, `user_summary`, and `steps[]` array containing per-step API responses.

## Gotchas

- **Intent fidelity:** Robotics foundation-model queries surface less on general web search and Product Hunt than infra queries do. Steps 1–3 may miss early-stage robotics companies that are stealth or academic. Supplement with a direct `selat-pay` call to SELAT-native Twitter/X advanced_search when needed.
- **Timeout leakage:** A `selat skill run vc-ai-infra-scout` that times out can leave in-flight micropayments settling against the session budget. Use `selat-pay` directly for single follow-up calls.
- **All 9 steps always run:** `selat skill run` has no step selection, so every run pays for all 9 calls. Optional params you omit fall back to their AI-infra defaults; pass all four query params for a different thesis.
- **Domain is required:** Step 9 enriches exactly the `--domain` you pass, and the run is refused without one (v1.2.0 removed the old `modal.com` default, which enriched Modal on every run regardless of thesis). Every run pays for the step 9 call, so pass a company you actually want enriched: one you already track, or a lead from an earlier free `selat search` or web search. The pipeline cannot pick it for you, because all 9 steps run in one pass.
- **Embodied AI null on Twitter:** The phrase "embodied AI" frequently returns zero tweets. Use `physical AI`, `foundation model for robots`, or company-specific hashtags instead.

## Validation

> `--chain base` in the probe command below is only the flag `selat-pay`
> requires today — a probe reads a free, chain-independent quote and never
> settles. A real paid run resolves the settlement chain from your funded Circle
> Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/vc-ai-infra-scout`
- Live gate (free, probe-only): `selat skill verify ./skills/vc-ai-infra-scout --live-probe --domain figure.ai`
- Single-step probe (no pay):
  `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/org-enrichment" --body '{"domain":"figure.ai"}' --chain base --probe-only --live-probe`
- Full run (paid): `selat skill run vc-ai-infra-scout --thesis "<your thesis>" --domain "<target-domain>" --json`
- A successful run prints `status=200` for each step.

## Cost Estimate

| Step | Endpoint | Live quote (probed 2026-10-04) | Step cap |
|------|----------|-------------|----------|
| 1 | Tavily | $0.0105 | $0.02 |
| 2 | Parallel | $0.0105 | $0.05 |
| 3 | Exa | $0.007 | $0.05 |
| 4–5–7 | SELAT-native Twitter/X ×3 | $0.001 × 3 = $0.003 | $0.05 each |
| 6 | Tavily (LinkedIn) | $0.0105 | $0.02 |
| 8 | Apollo people-search | $0.00525 | $0.05 |
| 9 | Apollo org-enrichment | $0.0399 | $0.06 |
| **Total** | | **~$0.087** (two paid runs on 2026-10-02 cost $0.0867 each) | |

Each step is capped by its own `maxAmount`. The top-level `maxAmount` ($0.06)
is only a fallback for a step with no cap of its own; it is not a total-run
cap. The worst case is the sum of the step caps ($0.40).

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — catalogue endpoints called by this skill.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
