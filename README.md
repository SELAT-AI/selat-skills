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
- **mixed** — a multi-step skill whose steps settle on more than one rail in one run (e.g. `stock-direction-signals`, which mixes x402 and MPP steps).

In the manifests, each step's `rail` is a descriptive label read from the live
probe (`x402 via Circle Gateway`, `x402 on Base`, `MPP on Tempo`,
`MPP on Solana`). A skill whose steps all share one label lists that label in
the table below; otherwise it lists `mixed`. A label names the merchant's rail,
not the chain you pay from: the CLI settles from your funded Circle Gateway
balance.

## Current coverage

This catalog's vetted skills are listed below. Coverage is concentrated in two
families:

- **B2B / GTM enrichment** — lead, person, company, email, prospecting, funding,
  creator, and VC sourcing workflows.
- **Financial / social / web research** — market and wallet intelligence,
  stock-direction research, Twitter/X research, social listening, Perplexity web
  search, and entity reputation briefs.

The table below and `index.json` are generated from each skill's `manifest.json`
by `npm run catalog`; CI fails if either is out of date.

## Skills

<!-- BEGIN GENERATED SKILLS TABLE: edit skills/<name>/manifest.json, then run `npm run catalog` -->

20 skills. Generated from each skill's `manifest.json` (rail and kind are derived from its steps).

| Skill | Rail | Kind | What it does |
|---|---|---|---|
| [account-intel](skills/account-intel/SKILL.md) | mixed | multi | Entity-centric footprint & reputation intelligence — profile one specific person, brand, or handle across… |
| [comprehensive-enrichment](skills/comprehensive-enrichment/SKILL.md) | MPP on Tempo | multi | Fixed 12-call, read-only person + company enrichment bundle across Apollo, Hunter, Clado contacts, Orthogonal… |
| [email-campaign](skills/email-campaign/SKILL.md) | MPP on Tempo | multi | Fixed six-call, read-only email-campaign preparation pipeline. |
| [enrich-waterfall](skills/enrich-waterfall/SKILL.md) | mixed | multi | Fixed 17-call, read-only person and company enrichment bundle across Apollo, Hunter, Scrape Creators… |
| [financial-intel](skills/financial-intel/SKILL.md) | mixed | multi | Fixed five-call, read-only crypto market-research bundle across Alchemy, CoinGecko, Alpha Vantage, Nansen, and… |
| [find-twitter-influencers](skills/find-twitter-influencers/SKILL.md) | mixed | multi | Fixed five-call, read-only Twitter/X influencer discovery bundle for one company and niche. |
| [gtm-enrichment-deep](skills/gtm-enrichment-deep/SKILL.md) | MPP on Tempo | multi | Fixed three-call, read-only GTM enrichment bundle for one known business lead. |
| [gtm-enrichment-smart](skills/gtm-enrichment-smart/SKILL.md) | MPP on Tempo | multi | Fixed three-call, read-only B2B lead qualification bundle. |
| [lead-enrichment](skills/lead-enrichment/SKILL.md) | MPP on Tempo | multi | Fixed five-call, read-only full-contact B2B lead cross-check. |
| [perplexity-search](skills/perplexity-search/SKILL.md) | x402 on Base | single | Web search via Perplexity's x402 endpoint (paysponge gateway), routed through the SELAT Router. |
| [person-lookup](skills/person-lookup/SKILL.md) | MPP on Tempo | single | Look up a person — work history, title, employer, and public professional profiles — via Apollo people-search… |
| [recent-funding-rounds](skills/recent-funding-rounds/SKILL.md) | MPP on Tempo | single | One bounded, read-only Brave News Search for recently published startup-funding coverage. |
| [sales-prospecting](skills/sales-prospecting/SKILL.md) | MPP on Tempo | multi | Build targeted B2B prospect lists with verified contact information, fully MPP-via the SELAT Router. |
| [scrapecreators](skills/scrapecreators/SKILL.md) | mixed | multi | Multi-merchant social media scraping across SELAT-native (X/Twitter — catalog.selat.ai, x402 via Circle… |
| [self-evolving-agent](skills/self-evolving-agent/SKILL.md) | mixed | multi | Budgeted economic agent preflight: gather social sentiment, financial market context, and domain availability… |
| [social-intel](skills/social-intel/SKILL.md) | mixed | multi | Grounded web-context intelligence on any topic, brand, or account — cross-checks two independent web searches… |
| [stock-direction-signals](skills/stock-direction-signals/SKILL.md) | mixed | multi | Provider-filtered stock direction research — Alpha Vantage MPP for quote/chart/technicals/news/earnings… |
| [twitter-research](skills/twitter-research/SKILL.md) | x402 via Circle Gateway | multi | Read-only Twitter/X research toolkit: 9 SELAT-native (catalog.selat.ai) GET reads covering account reads… |
| [vc-ai-infra-scout](skills/vc-ai-infra-scout/SKILL.md) | mixed | multi | Deal-sourcing scout for AI infrastructure, crypto-AI / DePIN, robotics / embodied-AI, and agentic-payments… |
| [wallet-desk-brief](skills/wallet-desk-brief/SKILL.md) | x402 via Circle Gateway | multi | Fixed two-call, read-only EVM wallet snapshot for one explicit non-zero address: Alchemy token holdings across… |

<!-- END GENERATED SKILLS TABLE -->

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

Run it locally (needs `selat-pay >= 0.12.0` on PATH; set `SELAT_ROUTER_URL` for
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
  "maxAmount": "0.03",        // per-step fallback cap for steps without their own; NOT a run total
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
      "maxAmount": "0.005"     // optional per-step cap (overrides the top-level fallback)
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
