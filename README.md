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
