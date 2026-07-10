---
name: person-lookup
description: Use this skill when the user wants to look up a specific person — e.g. "who is [name]?", "look up [name]", "find info about [name]", "what's [name]'s background?", "find [name]'s work history / social profiles / contact info". Runs a synchronous natural-language people search via Clado (work history, education, social profiles, location, contact info), routed through the SELAT Router as an MPP payment via Locus.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay, and a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). This is a routed MPP skill — it also requires a reachable SELAT Router (SELAT_ROUTER_URL) to translate the inbound Gateway-batched payment into an outbound MPP payment to Clado via Locus.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: single
---

# person-lookup

## When To Use

Use when the user wants background on a specific person: who they are, their current role and employer, work history, education, location, social profiles (LinkedIn, Twitter, GitHub, etc.), or contact information. Trigger on phrasings like "who is X?", "look up X", "find info about X", or "research X". Best results when the user supplies a company or job title alongside the name.

## Workflow

1. Install: `selat skill install person-lookup`
2. Run: `selat skill run person-lookup --query "Dario Amodei Anthropic CEO"`
3. The CLI compiles the step into a `selat-pay` call. Each step in the manifest becomes one capped payment — here a single routed POST to Clado via the SELAT Router — and prints a ✓/✗ summary with the response status.

Step:

- **person search — Clado** `POST /clado/search` — **ROUTED MPP** via the SELAT Router.

Clado search is **synchronous**: one POST with a natural-language query returns matching people directly in the response — no request IDs, no polling.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `query` | yes | — | Name plus company / role / geography for disambiguation, e.g. `"Sam Altman OpenAI"`. |

Outputs: comprehensive person data — full name and current title, current employer and role, work history, education, location, social profiles, skills, and contact info when available — returned directly in the POST response.

## Gotchas

- This is a **routed** step: `SELAT_ROUTER_URL` must be set and the router reachable. There is no direct rail in this skill.
- Per-step cap is $5.00 (full-run cap $5.00) — a loose spending filter, not the price. Clado's `/clado/search` live price is $0.31815 (probe-verified 2026-07-10).
- Common names return multiple matches — add a company or title to the `query` to narrow down. A 404 means not found; try alternate spellings or more context.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe without paying (free 402 probe):
  - `selat-pay POST "https://clado.mpp.paywithlocus.com/clado/search" --body '{"query":"Dario Amodei Anthropic CEO"}' --chain base --probe-only`
- A successful run prints `status=200` and a ✓ summary for the routed step.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoint this skill calls (merchant, method/path, price, source).
- selat-pay — https://github.com/SELAT-AI/selat-pay

_Third-party: "Clado" is a trademark of its respective owner; this skill calls their public API and is not affiliated with or endorsed by them._
