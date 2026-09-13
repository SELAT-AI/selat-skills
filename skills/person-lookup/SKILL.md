---
name: person-lookup
description: Use this skill when the user wants to look up a specific person — e.g. "who is [name]?", "look up [name]", "find info about [name]", "what's [name]'s background?", "find [name]'s work history / social profiles". Runs a synchronous Apollo people-search (title, employer, public professional profiles) through the SELAT Router as an MPP payment via Locus.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay, and a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). This is a MPP on Tempo skill — it also requires a reachable SELAT Router (SELAT_ROUTER_URL) to translate the inbound Gateway-batched payment into an outbound MPP payment to Apollo via Locus.
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: MPP on Tempo
  kind: single
---

# person-lookup

## When To Use

Use when the user wants background on a specific person: who they are, their current role and employer, work history, location, or public professional profiles. Trigger on phrasings like "who is X?", "look up X", "find info about X", or "research X". Best results when the user supplies a company or job title alongside the name.

## Workflow

1. Install: `selat skill install person-lookup`
2. Run: `selat skill run person-lookup --query "Dario Amodei Anthropic CEO"`
3. The CLI compiles the step into a `selat-pay` call. Each step in the manifest becomes one capped payment — here a single POST to Apollo people-search via the SELAT Router — and prints a ✓/✗ summary with the response status.

Step:

- **person search — Apollo** `POST /apollo/people-search` — **MPP on Tempo** via the SELAT Router.

Apollo people-search is **synchronous**: one POST with `q_keywords` returns matching people directly in the response — no request IDs, no polling.

The previous Clado `POST /clado/search` route no longer serves a 402. Company Enrich `POST /people/search` quotes live (~$0.129 at `pageSize=5`) but filters on company name/domain, not a person-name query. Apollo people-search is the live 1:1 replacement (free-probed 2026-09-12, `$0.00525`).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `query` | yes | `Dario Amodei Anthropic CEO` | Name plus company / role / geography for disambiguation, e.g. `"Sam Altman OpenAI"`. |

Outputs: matching person records from Apollo — name, current title, employer, location, and public professional profile fields when the provider returns them.

## Gotchas

- This is a **via the SELAT Router** step: `SELAT_ROUTER_URL` must be set and the router reachable. Every step settles through the SELAT Router.
- Per-step cap is $0.02 (full-run cap $0.02) — a ceiling above the live quote, not the charge. Apollo `/apollo/people-search` live price is $0.00525 (probe-verified 2026-09-12).
- Common names return multiple matches — add a company or title to the `query` to narrow down.
- This skill does not call Clado contacts and must not advertise private email or phone retrieval.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/person-lookup`
- Free live gate:
  ```bash
  SELAT_ROUTER_URL=https://router.selat.ai \
    selat skill verify ./skills/person-lookup \
    --query "Dario Amodei Anthropic CEO" \
    --live-probe
  ```
- Single-endpoint probe:
  - `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/people-search" --body '{"q_keywords":"Dario Amodei Anthropic CEO"}' --chain base --probe-only --live-probe`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoint this skill calls (merchant, method/path, price, source).
- selat-pay — https://github.com/SELAT-AI/selat-pay

_Third-party: "Apollo" is a trademark of its respective owner; this skill calls their public API and is not affiliated with or endorsed by them._
