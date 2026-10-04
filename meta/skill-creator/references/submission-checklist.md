# Submitting a skill to the hub

Use the official `selat skill` CLI from the `selat-skills` repo root. This is the
canonical submission flow; the repo-level [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
is a quick-reference pointer to it.

## The command sequence

```bash
selat skill new my-skill --dir skills          # 1. scaffold
#   …edit the files (replace every TODO)…       # 2. author
selat skill validate ./skills/my-skill         # 3. static SOP check
selat skill verify   ./skills/my-skill [--pay] # 4. live-402 check (the gate)
npm run catalog                                # 5. regenerate index.json + README table
npm run validate                               # 6. whole-repo check (what CI runs)
selat skill submit   ./skills/my-skill         # 7. open the PR
```

## What each step does

1. **`selat skill new`** — scaffolds `skills/my-skill/` (`manifest.json`,
   `SKILL.md`, `references/endpoints.md`, `evals/evals.json`). Offline equivalent:
   `node meta/skill-creator/scripts/new-skill.mjs my-skill`.
2. **Author** — replace every `TODO`. Wire steps to the payable `endpoint.url`
   from `selat search` (not the provider host); POST params in `body`; `maxAmount` with headroom.
3. **`selat skill validate ./skills/my-skill`** — static SOP check (schema, name ==
   folder, no `TODO`, evals present). Same check CI runs per skill.
4. **`selat skill verify ./skills/my-skill`** — **the gate.** Probes each step's
   real 402 price/rail (free, no wallet) and checks it ≤ `maxAmount`. Add `--pay`
   to make a capped real call confirming a settled 200. Pass required params as
   flags (e.g. `--symbols ETH`). Writes `skills/my-skill/.selat/verify-receipt.json`
   — the provenance that `submit` attaches and that gates merge. Fix unreachable or
   over-cap steps; prefer first-party providers over proxies.
5. **`npm run catalog`** — regenerates `index.json` and the README skills table
   from every manifest (name, rail, kind, description; `summary` if set). Don't
   hand-edit either file; CI fails if they drift from the manifests.
6. **`npm run validate`** — whole-repo SOP + `index.json` consistency (exactly what
   CI runs).
7. **`selat skill submit ./skills/my-skill`** — preview with `--dry-run` first.
   Requires a passing verify receipt; then branches, commits `skills/my-skill` + the
   `index.json` entry, pushes, and opens a PR with the receipt in the body. No write
   access? It prints the fork-and-PR commands. CI re-runs the validator; a
   maintainer paid-re-verifies before merge.

## CI errors that block merge

- `manifest.json` valid `selat-skill/v1`; `name` == folder; non-empty `steps[]`
  with valid methods + URLs.
- `SKILL.md` present with frontmatter `name` (== folder) and `description`; **no
  `TODO`**.
- `evals/evals.json` valid JSON; `skill_name` == folder.
- The skill is listed in `index.json`, and every entry has a folder.

## Pre-submit checklist

- [ ] Folder, `manifest.name`, `SKILL.md` `name`, `evals` `skill_name` all match (kebab-case).
- [ ] Every step uses the payable `endpoint.url` from `selat search`, not the provider URL.
- [ ] No Apify prepaid-token Actor URLs as steps.
- [ ] POST/PUT params in `body`; GET params in the query string.
- [ ] Params have real defaults; `maxAmount` set as a generous filter.
- [ ] First-party provider chosen over a proxy where equivalent.
- [ ] `selat skill validate` passes; `selat skill verify` produces a passing receipt.
- [ ] `npm run validate` → 0 errors.
- [ ] No `TODO`, secrets, or `orth`/CLI/`subprocess` calls.
- [ ] Did **not** copy the authoring SOP into the skill's `references/`.
