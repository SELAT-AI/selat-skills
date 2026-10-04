# manifest.json reference (`selat-skill/v1`)

The manifest is the **inert payment recipe** the `selat` CLI compiles into
`selat-pay` calls. No code. Shape:

```json
{
  "schema": "selat-skill/v1",
  "name": "my-skill",                 // MUST equal the folder name (kebab-case)
  "description": "One line; what it does and which rail.",
  "maxAmount": "5.00",                // per-step fallback cap (a filter, not a price; NOT a run total)
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

- **`url`** — always the payable `endpoint.url` from `selat search` (catalogue
  `serviceUrl` + the endpoint path), never the provider host. Put GET
  params in the query string; put POST/PUT/PATCH/DELETE params in `body`.
- **`${param}`** — substituted from `params` (with the caller's overrides or the
  `default`). Use the same names in `url`/`body` and `params`.
- **`maxAmount`** — string USD, a per-call cap. The CLI applies
  `step.maxAmount ?? manifest.maxAmount` to each call, so the top-level value is
  only a **fallback for steps that declare no cap of their own**. It is **not** a
  full-run cap: nothing enforces a total across steps, and a run can spend up to
  the sum of its step caps. Give every step its own cap, and quote the run's
  cost as the sum of the live step prices. Keep the top-level value no higher
  than the largest step cap: `selat skill install --max-amount <usd>` refuses a
  manifest whose declared caps (top-level included) exceed that value. Treat
  caps as guardrails and set them with headroom over the live quote.
- **`rail`** — a descriptive label: `direct` (Circle nanopayment, paid to the
  upstream), `routed` (via the SELAT Router), or `mixed` (a multi-step skill using
  both). It feeds `index.json` and the listing; it does not choose how the step
  pays — `selat-pay` detects the mode from the live 402 at run time. Set it from
  the `mode` that `selat skill verify` reports.
- **`chain` — optional, normally omitted.** Settlement chain is resolved at
  runtime from where the agent wallet's Circle Gateway balance actually sits (an
  emergent property of the deposit flow), so a paid call settles on a funded
  chain the Router accepts. Pin `"chain": "<key>"` at the top level only if the
  skill *must* settle on a fixed chain. Probing ignores chain entirely (it reads
  a free, chain-independent quote).
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
