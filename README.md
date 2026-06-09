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

## Skills

| Skill | Rail | Kind | What it does |
|---|---|---|---|
| [token-price](skills/token-price/SKILL.md) | direct | single | Crypto spot prices by symbol (Alchemy) |
| [wallet-holdings](skills/wallet-holdings/SKILL.md) | direct | single | Multi-chain token holdings (Alchemy) |
| [web-search](skills/web-search/SKILL.md) | routed | single | Web search via Exa/BlockRun |
| [allium-price](skills/allium-price/SKILL.md) | routed | single | Latest token price via Allium (MPP) |
| [market-snapshot](skills/market-snapshot/SKILL.md) | mixed | multi | Spot price (direct) + token price (routed MPP) |

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
  "chain": "base",            // default payment chain for all steps
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

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full flow. In short: `selat skill new <name> --dir skills`
to scaffold, fill in the files (per the [SOP](references/agent-skill-authoring-sop.md)),
verify the endpoint live (`selat-pay --probe-only`), add it to `index.json`, then
`npm run validate` (or `selat skill validate ./skills/<name>`) and open a PR. CI runs
the same validator on every PR.

## License

Apache-2.0.
