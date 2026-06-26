---
name: person-lookup
description: Use this skill when the user wants to look up a specific person — e.g. "who is [name]?", "look up [name]", "find info about [name]", "what's [name]'s background?", "find [name]'s work history / social profiles / contact info". Runs an async person search via Nyne.ai (work history, education, social profiles, location, contact info), routed through the SELAT Router as a tempo-native MPP payment.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay, and a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). This is a routed MPP skill — it also requires a reachable SELAT Router (SELAT_ROUTER_URL) to translate the inbound Gateway-batched payment into an outbound MPP/tempo payment to Nyne.ai.
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
3. The CLI compiles the step into a `selat-pay` call. Each step in the manifest becomes one capped payment — here a single routed POST to Nyne.ai via the SELAT Router — and prints a ✓/✗ summary with the response status.

Step:

- **person search — Nyne.ai** `POST /person/search` — **ROUTED MPP** via the SELAT Router.

Nyne person search is **async**: the POST returns a `requestId`. The upstream aggregates results and the response payload is returned once the search completes; results may take a few seconds.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `query` | yes | — | Name plus company / role / geography for disambiguation, e.g. `"Sam Altman OpenAI"`. |

Outputs: comprehensive person data — full name and current title, current employer and role, work history, education, location, social profiles, skills, and contact info when available. The initial POST returns a `requestId` for polling on async runs.

## Gotchas

- This is a **routed** step: `SELAT_ROUTER_URL` must be set and the router reachable. There is no direct rail in this skill.
- Nyne search is **async** — the POST may return a `requestId` rather than final results; poll until the search completes.
- Per-step cap is $0.40 (full-run cap $0.40). Nyne's `/person/search` price is variable/usage-based at the catalog, so the cap is set generously; raise it only if a run is rejected for exceeding `maxAmount`.
- Common names return multiple matches — add a company or title to the `query` to narrow down. A 404 means not found; try alternate spellings or more context.

## Validation

- Probe without paying (free 402 probe):
  - `selat-pay POST "https://api.nyne.ai/person/search" --body '{"query":"Dario Amodei Anthropic CEO"}' --chain base --probe-only`
- A successful run prints `status=200` and a ✓ summary for the routed step.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoint this skill calls (merchant, method/path, price, source).
- selat-pay — https://github.com/SELAT-AI/selat-pay

_Third-party: "Nyne.ai" is a trademark of its respective owner; this skill calls their public API and is not affiliated with or endorsed by them._
