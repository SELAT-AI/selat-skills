---
name: skill-creator
description: Use this skill when a contributor wants to build, author, scaffold, or submit a new skill to the SELAT skill hub (selat-skills) — e.g. "create a skill", "build a selat skill", "add a skill to the hub", "contribute a skill", "how do I write a manifest.json", "submit my skill", "wrap an MPP endpoint as a skill", "turn this paid API into a skill". Guides you through define → scaffold → wire endpoints → write SKILL.md → evals → validate → probe → open a PR, and encodes the gotchas that make a skill actually pay.
license: Apache-2.0
compatibility: Requires Node.js 18+, the selat CLI, and selat-pay >= 0.7.0 on PATH. Probing routed skills needs SELAT_ROUTER_URL set; it does NOT need a funded wallet (probe-only is free).
metadata:
  author: SELAT-AI
  version: "1.0"
  kind: guidance
---

# skill-creator

Author a new skill for the **selat-skills** hub and get it merged. A skill is a
declarative directory the `selat` CLI executes — **never code that calls
`selat-pay` itself**. Keep this open while you build; it carries the procedure
and the non-obvious failure modes.

## When To Use

Use when someone wants to add a capability to the hub by composing one or more
paid **federated-catalogue** endpoints into a named skill, or asks how the
manifest/SKILL.md/evals fit together, how to find a payable endpoint, or how to
submit. Not for editing the CLI or router — this is skill *content* only.

## Workflow

Follow these in order. Each later step assumes the earlier ones passed.

1. **Define one reusable unit of work.** One skill = one coherent capability
   (e.g. "enrich a person from an email"), not a department. Pick the **rail**:
   - `direct` — Circle nanopayment / Gateway-batched, paid straight to the upstream.
   - `routed` — erc-3009 or tempo-native **MPP**, paid via the SELAT Router. Most
     catalogue merchants are routed.
   - `mixed` — both in one run.
2. **Scaffold the directory:**
   `node scripts/new-skill.mjs <kebab-name> --rail routed --kind multi`
   This writes `<name>/{manifest.json, SKILL.md, evals/evals.json, references/endpoints.md}`.
3. **Discover endpoints in the federated catalogue.** For each capability, find
   the merchant's endpoint and record its **`serviceUrl`** (NOT the descriptive
   provider `url`), `method`, path, and price. See
   `references/endpoint-discovery.md`. This is where most skills go wrong — read it.
4. **Fill `manifest.json`.** One step per endpoint: `rail`, `method`,
   `url` = `serviceUrl` + path with `${param}` placeholders, `body` (real JSON for
   POST/PUT — see Gotchas), and a `maxAmount` cap. Define `params` with **real
   defaults**. See `references/manifest-reference.md`.
5. **Write `SKILL.md`.** Concise, procedural, per the SOP sections (When To Use,
   Workflow, Inputs And Outputs, Gotchas, Validation, References). Trigger-rich
   `description` under 1024 chars. No `TODO` left behind (it fails validation).
6. **Write `evals/evals.json`.** ~6 output evals plus trigger evals (8–10 that
   should fire, 8–10 that should not).
7. **Validate:** `node <hub>/scripts/validate-skills.mjs` — must be **0 errors**.
8. **Probe (free):** `node <hub>/scripts/probe-skills.mjs` then read
   `reliability.json`. Every step should be `reachable`. Drop or fix steps that
   aren't — see Gotchas. Aim for skill status `ok`.
9. **Submit.** Add a `{name, rail, kind, description}` row to `index.json`, open a
   PR. CI re-probes on a cron; `degraded`/`down` is recorded data, not a gate, but
   ship `ok` when you can. See `references/submission-checklist.md`.

## Available Scripts

- `scripts/new-skill.mjs <name> [--rail direct|routed|mixed] [--kind single|multi] [--dir <skills/>]`
  — scaffolds a complete skill skeleton. Non-interactive; `--help` for usage.

## Inputs And Outputs

| Input | What you provide |
|---|---|
| Capability | The one task the skill performs |
| Endpoints | Catalogue `serviceUrl` + path + method + price per step |
| Params | Named inputs with sensible defaults |

Output: a skill directory that validates, probes `ok`, and is ready for a PR.

## Gotchas

These are the failure modes that cost the most time. Internalize them.

- **Wire steps to the catalogue `serviceUrl`, NOT the provider `url`.** A
  catalogue record has a *descriptive* `url` (e.g. `https://api.tomba.io`) and a
  *payable* `serviceUrl` (e.g. `https://mpp.orthogonal.com/tomba`). The 402
  challenge is served **only** at the `serviceUrl`. Wiring the provider host
  yields "no x402/MPP challenge" and a `down` skill.
- **POST/PUT endpoints want params in the `body`, not the query string.** A POST
  with `?key=val` often returns no challenge; move those into `body` as real JSON.
- **`maxAmount` is a spending *filter*, not the price.** Set it to what you're
  willing to pay per call (e.g. `"5.00"`); the live 402 quote is the real price.
  Live prices run a few percent above the catalogue (gateway markup) — leave
  headroom or `withinCap` flips the skill to `degraded`.
- **Give params real defaults** (`email` → a sample address, `domain` →
  `stripe.com`). Empty defaults break body/path substitution so the probe (and
  users) can't exercise the step.
- **Probe before you submit, and trust the probe over the catalogue.** The
  catalogue lists endpoints the live gateway may not currently serve (drift). If a
  correctly-wired step still returns no challenge, the gateway isn't serving it —
  omit it and re-add later. Never ship a step you haven't seen return a quote.
- **The authoring SOP lives only at the repo root** `references/agent-skill-authoring-sop.md`.
  Do not copy it into your skill's `references/`.
- **`name` must equal the folder name**, kebab-case, and match across
  `manifest.json`, `SKILL.md` frontmatter, and the folder.

## Validation

Before opening a PR, all of these must hold:

- `node <hub>/scripts/validate-skills.mjs` → 0 errors, 0 warnings.
- `manifest.json` and `evals/evals.json` are valid JSON.
- Every manifest step probes `reachable` (`selat-pay --probe-only`); skill status `ok`.
- No `orth`/CLI/`subprocess` calls anywhere — the skill is purely declarative.
- No `TODO`, secrets, tokens, or local-only paths in any file.

Quick single-step probe (free, no wallet):

```bash
selat-pay POST "https://mpp.orthogonal.com/<merchant>/<path>" \
  --body '{"<param>":"<value>"}' --chain base --probe-only
# success prints: detected mpp=yes, mode=routed-mpp, price=$X on eip155:8453
```

## References

- `references/manifest-reference.md` — `selat-skill/v1` manifest schema, params, rails, examples.
- `references/endpoint-discovery.md` — finding endpoints in the federated catalogue and the `serviceUrl` rule.
- `references/submission-checklist.md` — validate → probe → `index.json` → PR.
- `../../references/agent-skill-authoring-sop.md` — the canonical authoring standard (read once).
