# Submitting a skill to the hub

Run from the `selat-skills` repo root with your new skill in `skills/<name>/`.

## 1. Validate (the contribution gate)

```bash
node scripts/validate-skills.mjs
```

Must report **0 errors**. It checks: `manifest.json` schema/name/steps/url,
`SKILL.md` frontmatter name == folder + description + no `TODO`,
`evals/evals.json` present, and that the skill is listed in `index.json`.

## 2. Probe for reliability (free)

```bash
SELAT_ROUTER_URL=https://router.selat.ai node scripts/probe-skills.mjs
```

Regenerates `reliability.json` by firing `selat-pay --probe-only` at every step
(free live-402 quote; no wallet, no payment). Open `reliability.json` and confirm
your skill is `ok` (every step `reachable`, `withinCap`). Fix or drop unreachable
steps (see `endpoint-discovery.md`). `degraded`/`down` is *recorded data*, not a
hard gate — but ship `ok`.

## 3. Register in `index.json`

Add one row (keep the existing entries):

```json
{ "name": "my-skill", "rail": "routed", "kind": "multi", "description": "What it does. Routed (MPP) via the SELAT Router." }
```

## 4. Open the PR

```bash
git checkout -b add-my-skill
git add skills/my-skill index.json reliability.json
git commit -m "Add my-skill (<rail>)"
git push -u origin add-my-skill
gh pr create --base main --title "Add my-skill" --body "..."
```

In the PR body, note the rail, the merchants used, and the probe result. A
scheduled CI job re-runs `probe-skills.mjs` so `reliability.json` reflects current
reality after merge.

## Pre-PR checklist

- [ ] Folder, `manifest.name`, and `SKILL.md` `name` all match (kebab-case).
- [ ] Every step uses the catalogue `serviceUrl`, not the provider `url`.
- [ ] POST/PUT params are in `body`; GET params in the query string.
- [ ] Params have real defaults.
- [ ] `maxAmount` set as a generous filter (not the exact price).
- [ ] `validate-skills.mjs` → 0 errors.
- [ ] `probe-skills.mjs` → skill `ok`.
- [ ] No `TODO`, secrets, or `orth`/CLI/`subprocess` calls.
- [ ] Listed in `index.json`.
- [ ] Did **not** copy the authoring SOP into the skill's `references/`.
