---
name: paid-capability-vendor-scout
description: Use this skill when the user wants to research, compare, map, or perform lightweight due diligence on a paid API, agent-commerce, x402, MPP, or machine-payment vendor — for example, "map SELAT's competitors", "research this agent payment startup", or "build a vendor landscape from this website". It combines website evidence, external web discovery, and a competitor market map through routed MPP payments.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, a reachable SELAT Router, and a funded Circle Gateway balance.
metadata:
  author: ranimth0707
  version: "1.0"
  rail: routed
  kind: multi
---

# paid-capability-vendor-scout

## When To Use

Use this skill for a quick evidence-backed landscape around a vendor that sells APIs or machine-consumable capabilities. It is especially useful for agentic payments, x402, MPP, API marketplaces, paid data, scraping, inference, and agent-wallet infrastructure.

Do not use it for a generic consumer-company profile or a full financial audit. The three calls are optimized for product positioning, public evidence, and competitor discovery.

## Workflow

1. Confirm the target company name, public website, and a focused research query.
2. Install the skill: `selat skill install paid-capability-vendor-scout`.
3. Before running, tell the user that the full three-step run is capped at **$0.35** and ask for approval.
4. Run:

```bash
selat skill run paid-capability-vendor-scout \
  --company "SELAT" \
  --website "https://selat.ai" \
  --research_query "SELAT AI agent payments competitors x402 MPP Circle Gateway"
```

5. Treat the outputs as three evidence layers:
   - **Website evidence:** extract the vendor's own claims, capabilities, rails, pricing cues, and positioning.
   - **External evidence:** identify third-party mentions, alternatives, corroboration, and missing evidence.
   - **Market map:** record the returned Aviato market-map identifier and any competitor data returned by the provider.
6. Synthesize a concise vendor brief with: positioning, core capability, payment rails, named competitors, differentiators, evidence gaps, and follow-up questions. Distinguish vendor claims from third-party evidence.
7. Tell the user what completed, the total recorded spend, and whether any provider returned only an asynchronous map identifier.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `company` | no | `SELAT` | Company or product name supplied to Aviato. |
| `website` | no | `https://selat.ai` | Public website scraped for first-party evidence and supplied to Aviato. |
| `research_query` | no | `SELAT AI agent payments competitors x402 MPP Circle Gateway` | Focused query for external evidence and competitors. |

Outputs:

- Markdown and metadata extracted from the target website.
- Web-search evidence related to the research query.
- An Aviato market-map response, commonly including a `mapID` for the generated competitor map.
- The agent's synthesized vendor-landscape brief.

## Gotchas

- The skill performs three paid calls. The live routed prices may include Router overhead, so the manifest uses per-step headroom and a $0.35 full-run cap.
- `website` must be a public HTTP(S) URL. Private dashboards and login-only pages will not produce useful website evidence.
- Context.dev search quality depends heavily on a narrow query; include the vendor name, category, rails, and terms such as competitors or alternatives.
- Aviato may return an asynchronous `mapID` rather than the completed map body. Report that identifier honestly; do not invent competitor results.
- Payment is settled before upstream body validation. Keep Aviato's required `name` and `website` fields intact.
- Vendor website text is first-party evidence, not independent validation.

## Validation

`--chain base` below is only used for free probing. A paid run resolves settlement from the funded Circle Gateway balance.

```bash
selat skill validate ./skills/paid-capability-vendor-scout
selat skill verify ./skills/paid-capability-vendor-scout
```

Individual free probes:

```bash
selat-pay GET "https://mpp.orthogonal.com/context-dev/web/scrape/markdown?url=https://selat.ai" --chain base --max-amount 0.05 --probe-only
selat-pay POST "https://mpp.orthogonal.com/context-dev/web/search" --body '{"query":"SELAT AI agent payments competitors"}' --chain base --max-amount 0.05 --probe-only
selat-pay POST "https://mpp.orthogonal.com/aviato/marketmap/generate" --body '{"name":"SELAT","website":"https://selat.ai"}' --chain base --max-amount 0.25 --probe-only
```

A successful paid call prints `status=200`. The Aviato generation call may return a `mapID`.

## References

- `manifest.json` — declarative payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — request shapes, prices, and rail notes.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- Context.dev OpenAPI — https://mpp.orthogonal.com/context-dev/openapi.json
- Aviato OpenAPI — https://mpp.orthogonal.com/aviato/openapi.json
- selat-pay — https://github.com/SELAT-AI/selat-pay
