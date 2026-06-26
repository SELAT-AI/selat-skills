# manifest.json reference (`selat-skill/v1`)

The manifest is the **inert payment recipe** the `selat` CLI compiles into
`selat-pay` calls. No code. Shape:

```json
{
  "schema": "selat-skill/v1",
  "name": "my-skill",                 // MUST equal the folder name (kebab-case)
  "description": "One line; what it does and which rail.",
  "chain": "base",                    // settlement chain
  "maxAmount": "5.00",                // full-run spending cap (a filter, not a price)
  "params": {
    "email":  { "required": false, "default": "test@stripe.com", "description": "Person email" },
    "domain": { "required": false, "default": "stripe.com",      "description": "Company domain" }
  },
  "steps": [
    {
      "label": "person resolve — Tomba enrich by email",
      "rail": "routed",                                   // direct | routed | mixed
      "method": "GET",
      "url": "https://mpp.orthogonal.com/tomba/v1/enrich?email=${email}",
      "maxAmount": "5.00"
    },
    {
      "label": "company search — Nyne",
      "rail": "routed",
      "method": "POST",
      "url": "https://mpp.orthogonal.com/nyne/company/search",
      "body": { "query": "${company}" },                  // POST params go in the BODY
      "maxAmount": "5.00"
    }
  ]
}
```

## Field rules

- **`url`** — always the catalogue `serviceUrl` + the endpoint path. Put GET
  params in the query string; put POST/PUT/PATCH/DELETE params in `body`.
- **`${param}`** — substituted from `params` (with the caller's overrides or the
  `default`). Use the same names in `url`/`body` and `params`.
- **`maxAmount`** — string USD. Top-level is the full-run cap; per-step overrides
  it for that call. Treat as a guardrail; set with headroom over the live quote.
- **`rail`** — `direct` (Circle nanopayment, paid to the upstream), `routed` (MPP
  via the SELAT Router), or `mixed` (a multi-step skill using both).
- **`kind`** (in `SKILL.md` frontmatter `metadata`, not the manifest) — `single`
  (one merchant) or `multi`.

## Multi-step / waterfall skills

The manifest `steps` array is **linear** — the CLI runs them in order. Conditional
logic (cheapest-first, escalate-on-gap, stop-when-found) belongs in `SKILL.md`
**Workflow** as the procedure the agent follows; the manifest just lists the
available steps with their costs. Order steps cheapest-first.

## SKILL.md frontmatter that must match the manifest

```yaml
---
name: my-skill                        # == folder == manifest.name
description: Use this skill when ...   # trigger-rich, < 1024 chars
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and (for routed) a reachable SELAT Router.
metadata:
  author: your-org
  version: "1.0"
  rail: routed
  kind: multi
---
```
