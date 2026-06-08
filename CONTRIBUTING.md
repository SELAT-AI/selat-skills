# Contributing a skill

A skill wraps one or more SELAT catalogue endpoints into a named, installable
capability, paid via [`selat-pay`](https://github.com/SELAT-AI/selat-pay) and the
SELAT Router. Skills are **declarative JSON manifests** (no executable code) authored
to the [Agent Skill SOP](references/agent-skill-authoring-sop.md).

## Flow

1. **Scaffold** the SOP layout with the CLI:
   ```bash
   selat skill new my-skill --dir skills
   ```
   This creates `skills/my-skill/` with `manifest.json`, `SKILL.md`,
   `references/endpoints.md`, and `evals/evals.json`. (Or copy an existing skill.)

2. **Author** — replace every `TODO`:
   - **`manifest.json`** — set `name` (must equal the folder), `chain`, `maxAmount`,
     `params`, and `steps[]` pointing at real catalogue endpoints. Reference params as
     `${param}` in `url`/`body`. Set `maxAmount` with headroom over the live price.
   - **`SKILL.md`** — frontmatter (`name`, `description` with trigger phrasing,
     `license`, `compatibility`, `metadata`) + the body sections (When To Use,
     Workflow, Inputs And Outputs, Gotchas, Validation, References).
   - **`references/endpoints.md`** — the endpoint URL(s), method, rail, ~price.
   - **`evals/evals.json`** — a few trigger and non-trigger evals; `skill_name` must
     equal the folder.

3. **Verify the endpoint is real** (the catalogue is unreliable — the live 402 is the
   source of truth):
   ```bash
   selat-pay <METHOD> "<url>" --chain base --probe-only      # confirm it quotes
   selat-pay <METHOD> "<url>" --chain base --max-amount <cap> # confirm it settles 200
   ```
   Prefer **first-party** providers over proxies. Note the live price; it should match
   `references/endpoints.md` and sit under `maxAmount`.

4. **Register** — add an entry to [`index.json`](index.json):
   ```json
   { "name": "my-skill", "rail": "direct|routed|mixed", "kind": "single|multi", "description": "..." }
   ```

5. **Validate** locally (both must pass):
   ```bash
   selat skill validate ./skills/my-skill   # single skill (authoring)
   npm run validate                         # whole repo + index.json consistency (what CI runs)
   ```

6. **Open a PR.** CI runs `scripts/validate-skills.mjs`. A maintainer reviews and
   paid-verifies the endpoint before merge.

## Rules CI enforces (errors block merge)

- `manifest.json` is valid `selat-skill/v1`; `name` equals the folder; `steps[]`
  non-empty with valid methods + URLs.
- `SKILL.md` present with frontmatter `name` (= folder) and a `description`; **no
  remaining `TODO`s**.
- `evals/evals.json` valid JSON; `skill_name` equals the folder.
- The skill is listed in `index.json`, and every `index.json` entry has a folder.

Warnings (missing recommended section, missing `references/endpoints.md`, empty evals)
do not block but should be addressed.

## Guidelines

- **Manifests are inert data** — never embed code; values go into `url` (URL-encoded)
  or `body` (JSON-encoded) via `${param}` substitution.
- **First-party over proxy** when equivalent — first-party providers are cheaper or
  equal and offer real identity/recourse.
- **Cap with headroom** — `maxAmount` slightly above the observed live price; the live
  402 is authoritative, so don't trust catalogue prices.
- **One coherent capability per skill.** Multi-step is fine (see `market-snapshot`),
  but keep the intent focused.
