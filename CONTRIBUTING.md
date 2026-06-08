# Contributing a skill

A skill wraps one or more SELAT catalogue endpoints into a named, installable
capability, paid via [`selat-pay`](https://github.com/SELAT-AI/selat-pay) and the
SELAT Router. Skills are **declarative JSON manifests** (no executable code) authored
to the [Agent Skill SOP](references/agent-skill-authoring-sop.md).

## Flow

The whole loop, end to end:

```bash
selat skill new my-skill --dir skills          # 1. scaffold
#   …edit the files (replace every TODO)…       # 2. author
selat skill validate ./skills/my-skill         # 3. static SOP check
selat skill verify   ./skills/my-skill [--pay] # 4. live-402 check (the gate)
selat skill register ./skills/my-skill         # 5. add index.json entry
npm run validate                               # 6. whole-repo check (what CI runs)
selat skill submit   ./skills/my-skill         # 7. open the PR
```

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

3. **Validate** the SOP layout (also what CI runs per skill):
   ```bash
   selat skill validate ./skills/my-skill
   ```

4. **Verify the endpoint is real** — the gate (the catalogue is unreliable; the live
   402 is the source of truth):
   ```bash
   selat skill verify ./skills/my-skill          # free: probes each step's real 402 price/rail and checks it ≤ maxAmount
   selat skill verify ./skills/my-skill --pay    # also makes a capped real paid call to confirm it settles 200
   ```
   For skills with required params, pass them as flags (e.g. `--symbols ETH`). This
   writes `skills/my-skill/.selat/verify-receipt.json` — the provenance that `submit`
   attaches to the PR and that gates merge. Prefer **first-party** providers over
   proxies. Fix any step that's unreachable or quotes above its `maxAmount`.

5. **Register** — auto-add/update the [`index.json`](index.json) entry (derived from the
   manifest: name, rail, kind, description):
   ```bash
   selat skill register ./skills/my-skill
   ```

6. **Validate the whole repo** (exactly what CI runs):
   ```bash
   npm run validate            # every skill vs SOP + index.json consistency
   ```

7. **Submit** — open the PR (gated on a passing verify receipt):
   ```bash
   selat skill submit ./skills/my-skill --dry-run   # preview the branch/PR
   selat skill submit ./skills/my-skill             # branch + commit + push + open PR
   ```
   `submit` requires a passing `verify` receipt, branches, commits `skills/my-skill/` +
   the `index.json` entry, pushes, and opens a PR with the verification receipt in the
   body as provenance. No write access? It prints the fork-and-PR commands to run.
   CI (`scripts/validate-skills.mjs`) runs automatically; a maintainer paid-re-verifies
   the endpoint before merge. On merge the skill is instantly installable.

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
