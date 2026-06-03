# selat-skills

Skill definitions for the SELAT agent-payments ecosystem. Each skill is a
declarative **JSON manifest** that composes one or more catalogue API endpoints
into a named capability, paid via [`selat-pay`](https://github.com/SELAT-AI/selat-pay)
and the SELAT Router.

This repo holds skill **content** only. The CLI that lists, installs, and runs
these skills lives in [`selat-cli`](https://github.com/SELAT-AI/selat-cli)
(`selat skill list|install|run`).

## Layout

```
skills/<name>/manifest.json   # the skill definition (inert data — no executable code)
skills/<name>/README.md       # human docs for the skill
index.json                    # catalog used by `selat skill list --available`
```

## Rails

Skills are tagged by payment rail:

- **direct** — Circle nanopayment / Gateway-batched, paid straight to the upstream (no router hop).
- **routed** — erc-3009 or tempo-native **MPP**, paid via the SELAT Router, which translates the agent's inbound Gateway-batched payment to the upstream's scheme.
- **mixed** — a multi-rail skill that uses both in one run (see `market-snapshot`).

## Skills

| Skill | Rail | Kind | What it does |
|---|---|---|---|
| [token-price](skills/token-price) | direct | single | Crypto spot prices by symbol (Alchemy) |
| [wallet-holdings](skills/wallet-holdings) | direct | single | Multi-chain token holdings (Alchemy) |
| [web-search](skills/web-search) | routed | single | Web search via Exa/BlockRun |
| [allium-price](skills/allium-price) | routed | single | Latest token price via Allium (MPP) |
| [market-snapshot](skills/market-snapshot) | mixed | multi | Spot price (direct) + token price (routed MPP) |

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

## License

Apache-2.0.
