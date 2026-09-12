# selat-skills

Skill definitions for the SELAT agent-payments ecosystem. Each skill composes
one or more catalogue API endpoints into a named capability, paid via
[`selat-pay`](https://github.com/SELAT-AI/selat-pay) and the SELAT Router.

Skills follow the **Agent Skill** authoring standard — see
[`references/agent-skill-authoring-sop.md`](references/agent-skill-authoring-sop.md).
This repo holds skill **content** only; the CLI that lists, installs, and runs
these skills lives in [`selat-cli`](https://github.com/SELAT-AI/selat-cli)
(`selat skill list|install|run`).

## Skill layout

Each skill is an Agent Skill directory:

```
skills/<name>/
├── SKILL.md            # required — frontmatter + operational docs (the SOP)
├── manifest.json       # machine-readable payment recipe (read by selat-cli)
└── evals/
    └── evals.json      # trigger + output-quality evals
```

- **`SKILL.md`** makes the skill activatable and documented per the SOP
  (frontmatter `name`/`description`/`license`/`compatibility`/`metadata`, plus
  `When To Use`, `Workflow`, `Inputs And Outputs`, `Gotchas`, `Validation`,
  `References`).
- **`manifest.json`** is the inert, machine-readable recipe `selat-cli` executes
  (no code — just steps mapped to `selat-pay` calls). It is the one skill file
  the CLI fetches on `selat skill install <name>`.
- **`evals/evals.json`** holds trigger and output assertions per the SOP.

## Rails

- **direct** — Circle nanopayment / Gateway-batched, paid straight to the upstream (no router hop).
- **routed** — erc-3009 or tempo-native **MPP**, paid via the SELAT Router, which translates the agent's inbound Gateway-batched payment to the upstream's scheme.
- **mixed** — a multi-rail skill that uses both in one run (see `market-snapshot`).

## Current coverage

This catalog currently has 20 vetted skills. Coverage is concentrated in two
families:

- **B2B / GTM enrichment** — lead, person, company, email, prospecting, funding,
  creator, and VC sourcing workflows.
- **Financial / social / web research** — market and wallet intelligence,
  stock-direction research, Twitter/X research, social listening, Perplexity web
  search, and entity reputation briefs.

The table below mirrors the current `index.json` catalog.

## Skills

| Skill | Rail | Kind | What it does |
|---|---|---|---|
| [enrich-waterfall](skills/enrich-waterfall/SKILL.md) | mixed | multi | Cheapest-first B2B person and company enrichment waterfall. |
| [comprehensive-enrichment](skills/comprehensive-enrichment/SKILL.md) | MPP on Tempo | multi | Deep multi-source person and company enrichment. |
| [lead-enrichment](skills/lead-enrichment/SKILL.md) | MPP on Tempo | multi | Fixed five-call, full-contact B2B lead cross-check through Hunter, Apollo, and Clado. |
| [person-lookup](skills/person-lookup/SKILL.md) | MPP on Tempo | single | Person lookup through Nyne. |
| [gtm-enrichment-smart](skills/gtm-enrichment-smart/SKILL.md) | mixed | multi | Cost-conscious GTM enrichment with conditional gap fills. |
| [gtm-enrichment-deep](skills/gtm-enrichment-deep/SKILL.md) | MPP on Tempo | multi | Deep GTM enrichment through Apollo and Sixtyfour. |
| [sales-prospecting](skills/sales-prospecting/SKILL.md) | MPP on Tempo | multi | Prospect-list building, contact lookup, and verification. |
| [email-campaign](skills/email-campaign/SKILL.md) | MPP on Tempo | multi | Email-campaign prospecting and deliverability pipeline. |
| [recent-funding-rounds](skills/recent-funding-rounds/SKILL.md) | MPP on Tempo | single | Recent funding-round discovery. |
| [find-twitter-influencers](skills/find-twitter-influencers/SKILL.md) | mixed | multi | Twitter/X influencer discovery with enrichment. |
| [scrapecreators](skills/scrapecreators/SKILL.md) | mixed | multi | Social data reads across Twitter/X, Instagram, and LinkedIn. |
| [social-intel](skills/social-intel/SKILL.md) | mixed | multi | Cross-platform social intelligence with web grounding. |
| [self-evolving-agent](skills/self-evolving-agent/SKILL.md) | mixed | multi | Economic-agent preflight for market, social, and domain context. |
| [financial-intel](skills/financial-intel/SKILL.md) | mixed | multi | Multi-signal market intelligence for assets and tickers. |
| [account-intel](skills/account-intel/SKILL.md) | mixed | multi | Entity footprint and reputation intelligence. |
| [vc-ai-infra-scout](skills/vc-ai-infra-scout/SKILL.md) | mixed | multi | VC deal-sourcing scout for AI infrastructure theses. |
| [twitter-research](skills/twitter-research/SKILL.md) | x402 via Circle Gateway | multi | Read-only Twitter/X research toolkit. |
| [perplexity-search](skills/perplexity-search/SKILL.md) | routed | single | Perplexity-backed web search through x402. |
| [stock-direction-signals](skills/stock-direction-signals/SKILL.md) | mixed | multi | Non-advisory bullish/bearish/mixed stock signal brief. |
| [wallet-desk-brief](skills/wallet-desk-brief/SKILL.md) | x402 via Circle Gateway | multi | Read-only EVM wallet attribution and holdings brief. |

The `index.json` catalog at the repo root backs `selat skill list --available`.

## Reliability registry (`reliability.json`)

[`reliability.json`](reliability.json) is an auto-generated registry of how every
skill is *actually* behaving against its live endpoints. A scheduled CI job
([`.github/workflows/reliability.yml`](.github/workflows/reliability.yml)) re-runs
each skill's HTTP-402 probe with `selat-pay --probe-only` — a **free** quote that
reads the 402 challenge but never signs or pays, so it needs no funded wallet and
no secrets — and records per step:

- **reachable** — did the endpoint return a live 402/MPP challenge?
- **livePriceUsd** — the real quoted USDC price (not the catalogue's claim).
- **withinCap** — is the live price within the step's `maxAmount`?
- **mode** / **rail** / **latencyMs** / **error**.

Each skill rolls up to a status: **ok** (all steps reachable and within cap),
**degraded** (some steps failing), or **down** (no steps reachable). This is the
scheduled half of the contribution gate: [`selat skill verify`](CONTRIBUTING.md)
proves a skill once at submit time; this re-verifies the whole catalogue on a cron
so reliability reflects current reality, not the day it was merged — uptime/price
from real calls, not vanity stars.

Run it locally (needs `selat-pay >= 0.3.2` on PATH; set `SELAT_ROUTER_URL` for
routed steps):

```bash
npm run probe                      # writes reliability.json
```

## Manifest format (`selat-skill/v1`)

```jsonc
{
  "schema": "selat-skill/v1",
  "name": "<kebab-id matching the folder>",
  "description": "<one line>",
  // chain is NOT declared here — the settlement chain is resolved at runtime
  // from your funded Circle Gateway balance. Pin "chain": "<key>" only if the
  // skill must settle on a fixed chain.
  "maxAmount": "0.03",        // default USD cap for all steps
  "params": {                  // user inputs, substituted as ${name}
    "<key>": { "required": true, "default": "...", "description": "..." }
  },
  "steps": [
    {
      "label": "...",          // shown in the CLI run output
      "rail": "direct|routed", // informational; selat-pay auto-detects
      "method": "GET|POST|...",
      "url": "https://... with ${param}",
      "body": { },             // optional; object/array is JSON-encoded, ${param} substituted
      "maxAmount": "0.005"     // optional per-step cap override
    }
  ]
}
```

Manifests are **inert data**: installing one never executes code. Values
substituted into `url` are URL-encoded; values in `body` are JSON-encoded.

## Authoring a new skill

The full guide is the **[`meta/skill-creator`](meta/skill-creator/SKILL.md)** skill —
it walks a contributor through the whole loop (define → scaffold → discover endpoints
→ author → validate → verify → register → submit), encodes the gotchas, and ships a
[`new-skill.mjs`](meta/skill-creator/scripts/new-skill.mjs) scaffolder. It lives under
`meta/` (not `skills/`) because it is a guidance skill with no payment manifest.
**[CONTRIBUTING.md](CONTRIBUTING.md)** is the repo-level quick reference that points to it.

In short: `selat skill new <name> --dir skills` to scaffold, fill in the files (per the
[SOP](references/agent-skill-authoring-sop.md)), `selat skill verify` the endpoints live
(the gate), `selat skill register`, `npm run validate`, then `selat skill submit`.

## License

Apache-2.0.
