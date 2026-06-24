---
name: skill-creator
description: Use this skill when a contributor wants to build, author, scaffold, verify, or submit a new skill to the SELAT skill hub (selat-skills) — e.g. "create a skill", "build a selat skill", "add a skill to the hub", "contribute a skill", "how do I write a manifest.json", "verify my skill", "submit my skill", "wrap an MPP endpoint as a skill". Guides you through the official `selat skill` flow (new → author → validate → verify → register → submit) and encodes the gotchas that make a skill actually pay.
license: Apache-2.0
compatibility: Requires Node.js 18+, the selat CLI, and selat-pay >= 0.7.0 on PATH. Verifying routed skills needs SELAT_ROUTER_URL set; `selat skill verify` (without --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.1"
  kind: guidance
---

# skill-creator

Author a new skill for the **selat-skills** hub and get it merged, using the
official `selat skill` CLI. A skill is a declarative directory the `selat` CLI
executes — **never code that calls `selat-pay` itself**. This is the hub's
contribution guide ([`CONTRIBUTING.md`](../../CONTRIBUTING.md) points here); keep
it open while you build.

## When To Use

Use when someone wants to add a capability to the hub by composing one or more
paid **federated-catalogue** endpoints into a named skill, or asks how the
manifest/SKILL.md/evals fit together, how to find a payable endpoint, how to
verify it, or how to submit. Not for editing the CLI or router — this is skill
*content* only.

## Workflow

The whole loop (matches `CONTRIBUTING.md`):

```bash
selat skill new my-skill --dir skills           # 1. scaffold
#   …edit the files (replace every TODO)…        # 2. author
selat skill validate ./skills/my-skill          # 3. static SOP check
selat skill verify   ./skills/my-skill [--pay]  # 4. live-402 check (THE GATE)
selat skill register ./skills/my-skill          # 5. add index.json entry
npm run validate                                # 6. whole-repo check (what CI runs)
selat skill submit   ./skills/my-skill          # 7. open the PR
```

1. **Define + scaffold.** One skill = one coherent capability; pick the **rail**
   (`direct` Circle nanopayment / `routed` MPP via the SELAT Router / `mixed`).
   Then `selat skill new <name> --dir skills` writes `skills/<name>/` with
   `manifest.json`, `SKILL.md`, `references/endpoints.md`, `evals/evals.json`.
   (No CLI handy? `scripts/new-skill.mjs` does the same scaffolding offline.)
2. **Discover endpoints** in the federated catalogue and record each merchant's
   **`serviceUrl`** (NOT the descriptive provider `url`), method, path, price.
   See `references/endpoint-discovery.md` — this is where most skills break.
3. **Author** — replace every `TODO`:
   - `manifest.json` — `name` (== folder), `chain`, `maxAmount` (cap *with
     headroom*, a filter not a price), `params` (real defaults), `steps[]` with
     `url` = `serviceUrl` + path, `${param}` substitution, `body` for POST.
   - `SKILL.md` — frontmatter + sections (When To Use, Workflow, Inputs And
     Outputs, Gotchas, Validation, References). No `TODO` may remain.
   - `references/endpoints.md` and `evals/evals.json` (`skill_name` == folder).
4. **Validate (static):** `selat skill validate ./skills/<name>`.
5. **Verify (the gate):** `selat skill verify ./skills/<name>` probes each step's
   real 402 price/rail (free) and checks it ≤ `maxAmount`; `--pay` makes a capped
   real call to confirm it settles 200. Pass required params as flags. This writes
   `skills/<name>/.selat/verify-receipt.json` — the provenance `submit` attaches to
   the PR and that **gates merge**. Fix any step that's unreachable or over cap;
   prefer **first-party** providers over proxies.
6. **Register:** `selat skill register ./skills/<name>` auto-adds/updates the
   `index.json` entry from the manifest.
7. **Whole-repo check:** `npm run validate` (exactly what CI runs).
8. **Submit:** `selat skill submit ./skills/<name>` (use `--dry-run` first). It
   requires a passing verify receipt, then branches, commits `skills/<name>` + the
   `index.json` entry, pushes, and opens a PR with the receipt as provenance. No
   write access? It prints fork-and-PR commands. A maintainer paid-re-verifies
   before merge.

## Available Scripts

- `scripts/new-skill.mjs <name> [--rail …] [--kind …] [--dir skills]` — offline
  scaffolder equivalent to `selat skill new`, for environments without the CLI.
  Non-interactive; `--help` for usage.

## Inputs And Outputs

| Input | What you provide |
|---|---|
| Capability | The one task the skill performs |
| Endpoints | Catalogue `serviceUrl` + path + method + price per step |
| Params | Named inputs with sensible defaults |

Output: a skill that passes `validate`, has a passing `verify` receipt, and is
ready for `submit`.

## Gotchas

- **Wire steps to the catalogue `serviceUrl`, NOT the provider `url`.** A record
  has a *descriptive* `url` (`https://api.tomba.io`) and a *payable* `serviceUrl`
  (`https://mpp.orthogonal.com/tomba`). The 402 is served only at the `serviceUrl`;
  the provider host yields "no challenge" and a failed verify.
- **POST/PUT params go in `body`, not the query string** — a POST with `?k=v`
  often returns no challenge.
- **`maxAmount` is a spending filter, not the price.** Set it with headroom over
  the live quote (gateway prices run a few percent above the catalogue) or `verify`
  flags the step as over-cap.
- **Give params real defaults** so `verify` (and users) can exercise each step.
- **`verify` is the gate, and the live 402 is the source of truth.** The catalogue
  lists endpoints the gateway may no longer serve. Never submit a step that doesn't
  verify; omit it and re-add when it's served.
- **Prefer first-party providers over proxies** when equivalent — cheaper/equal,
  with real identity and recourse.
- **The authoring SOP lives only at the repo root** `references/agent-skill-authoring-sop.md`;
  don't copy it into your skill.
- **`name` == folder**, kebab-case, consistent across folder, `manifest.json`, and
  `SKILL.md` frontmatter; `evals.json` `skill_name` == folder too.

## Validation

Before `submit`, all must hold:

- `selat skill validate ./skills/<name>` → passes (also the per-skill CI check).
- `selat skill verify ./skills/<name>` → every step reachable and ≤ `maxAmount`
  (writes the verify receipt). `--pay` confirms a real settled 200.
- `npm run validate` → 0 errors (whole-repo + `index.json` consistency).
- No `TODO`, secrets, or `orth`/CLI/`subprocess` calls — the skill is declarative.

Underlying free single-step probe (what `verify` runs per step):

```bash
selat-pay POST "https://mpp.orthogonal.com/<merchant>/<path>" \
  --body '{"<param>":"<value>"}' --chain base --probe-only
# success prints: detected mpp=yes, mode=routed-mpp, price=$X on eip155:8453
```

## References

- [`CONTRIBUTING.md`](../../CONTRIBUTING.md) — repo-level quick reference that points back to this skill.
- `references/manifest-reference.md` — `selat-skill/v1` manifest schema, params, rails, examples.
- `references/endpoint-discovery.md` — finding endpoints in the catalogue and the `serviceUrl` rule.
- `references/submission-checklist.md` — the `selat skill` command sequence + pre-PR checklist.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — the authoring standard.
