# jasZ2026 skill-fix stale rebase (P1)

Date: 2026-09-12  
Operator: Cursor Cloud Agent (`SELAT-DEV`)  
Target `main`: `48554310645e7e57d596431b91a39af82781a681`  
(`chore(reliability): refresh reliability.json [skip ci]`)

## Why this was stale

Sixteen OPEN skill-fix PRs by `jasZ2026` (opened 2026-08-31) were 49–50
commits behind `main`. Bodies cited SELAT CLI **0.16.15**. Current tooling is
`@selat-ai/selat-cli@0.17.2` / `@selat-ai/selat-pay@0.11.2`.

Those 49–50 commits on `main` were **only** scheduled
`reliability.json` refreshes. `index.json`, `README.md`, and
`skills/<name>/` for these sixteen skills had **not** changed on `main`
since each PR's merge-base. Rebases were therefore clean: no conflict
resolution and no skill-contract edits.

## What this pass did

For each PR in ascending number order:

1. Fetched latest `main`.
2. Rebased the SELAT-AI branch onto `main` (rebase, not merge).
3. Force-with-lease pushed so the existing PR updated.
4. Ran `selat skill validate ./skills/<skill>`.
5. Ran `node scripts/validate-skills.mjs` (must stay 0 errors).
6. Ran free `selat skill verify ./skills/<skill> --live-probe` (no `--pay`).
7. Commented the rebase SHA, CLI/pay versions, validate result, per-step
   quotes vs caps, and any HOLD.

Skill PRs were **not** merged. No paid calls. No contract changes beyond
the rebase itself (none were required).

Tooling used for verify:

- `@selat-ai/selat-cli@0.17.2`
- `@selat-ai/selat-pay@0.11.2`
- `SELAT_ROUTER_URL=https://router.selat.ai` (same public URL as
  `.github/workflows/reliability.yml`)

## Behind-count before / after

| PR | Branch | Skill | Before behind/ahead | After behind/ahead | Rebased HEAD | Conflicts |
|---:|---|---|---|---|---|---|
| 93 | `codex/fix-email-campaign` | email-campaign | 50 / 1 | **0 / 1** | `6edfce6` | none |
| 94 | `codex/fix-account-intel` | account-intel | 50 / 1 | **0 / 1** | `762972f` | none |
| 95 | `codex/fix-comprehensive-enrichment` | comprehensive-enrichment | 50 / 1 | **0 / 1** | `e8c08bf` | none |
| 96 | `codex/fix-enrich-waterfall` | enrich-waterfall | 50 / 1 | **0 / 1** | `082df2d` | none |
| 97 | `codex/fix-financial-intel` | financial-intel | 50 / 1 | **0 / 1** | `e5d1c61` | none |
| 99 | `codex/fix-find-twitter-influencers` | find-twitter-influencers | 49 / 1 | **0 / 1** | `0ce82d6` | none |
| 100 | `codex/fix-gtm-enrichment-deep` | gtm-enrichment-deep | 49 / 1 | **0 / 1** | `d9bd825` | none |
| 101 | `codex/fix-gtm-enrichment-smart` | gtm-enrichment-smart | 49 / 1 | **0 / 1** | `e85b886` | none |
| 102 | `codex/fix-lead-enrichment` | lead-enrichment | 49 / 1 | **0 / 1** | `02ff958` | none |
| 103 | `codex/fix-person-lookup` | person-lookup | 49 / 1 | **0 / 1** | `a3a143d` | none |
| 104 | `codex/fix-recent-funding-rounds` | recent-funding-rounds | 49 / 1 | **0 / 1** | `e564a49` | none |
| 105 | `codex/fix-sales-prospecting` | sales-prospecting | 49 / 1 | **0 / 1** | `d7594f5` | none |
| 106 | `codex/scrapecreators-qc` | scrapecreators | 49 / 1 | **0 / 1** | `c87b8eb` | none |
| 107 | `codex/self-evolving-agent-qc` | self-evolving-agent | 49 / 1 | **0 / 1** | `b4dcce3` | none |
| 108 | `codex/social-intel-qc` | social-intel | 49 / 1 | **0 / 1** | `c9836c4` | none |
| 109 | `codex/wallet-desk-brief-qc` | wallet-desk-brief | 49 / 1 | **0 / 1** | `7836b76` | none |

**Rebase blocked: 0 of 16.** Every branch is 0 commits behind `main`.

## Static validation

On every rebased tree:

- `selat skill validate ./skills/<skill>` → valid
- `node scripts/validate-skills.mjs` → **20 skills, 0 errors, 0 warnings**

## Live-probe results (free, no `--pay`)

Quoted totals below are the sum of reachable step quotes. Per-step caps
are the merge gate; the top-level manifest `maxAmount` is a fallback
per-step ceiling, not a cumulative run cap. The session budget is the
run-wide tripwire and was not armed (no paid calls).

| PR | Skill | Steps | Reachable / in-cap | Quoted total | Sum of step caps | Probe | Comment |
|---:|---|---:|---|---:|---:|---|---|
| 93 | email-campaign | 6 | 6/6 | $0.298462 | $0.505 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/93#issuecomment-5649192029) |
| 94 | account-intel | 6 | 6/6 | $0.068100 | $0.280 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/94#issuecomment-5649192109) |
| 95 | comprehensive-enrichment | 13 | 12/13 | $0.205012 | $0.825 | **HOLD** | [comment](https://github.com/SELAT-AI/selat-skills/pull/95#issuecomment-5649195508) |
| 96 | enrich-waterfall | 18 | 15/18 | $0.438062 | $0.707 | **HOLD** | [comment](https://github.com/SELAT-AI/selat-skills/pull/96#issuecomment-5649195915) |
| 97 | financial-intel | 5 | 5/5 | $0.132250 | $0.187 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/97#issuecomment-5649195579) |
| 99 | find-twitter-influencers | 5 | 5/5 | $0.025362 | $0.044 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/99#issuecomment-5649195637) |
| 100 | gtm-enrichment-deep | 3 | 3/3 | $0.093450 | $0.120 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/100#issuecomment-5649195701) |
| 101 | gtm-enrichment-smart | 3 | 3/3 | $0.045412 | $0.065 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/101#issuecomment-5649195772) |
| 102 | lead-enrichment | 5 | 5/5 | $0.183750 | $0.255 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/102#issuecomment-5649195848) |
| 103 | person-lookup | 1 | 0/1 | — | $0.070 | **HOLD** | [comment](https://github.com/SELAT-AI/selat-skills/pull/103#issuecomment-5649198671) |
| 104 | recent-funding-rounds | 1 | 1/1 | $0.036750 | $0.050 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/104#issuecomment-5649198761) |
| 105 | sales-prospecting | 5 | 5/5 | $0.072450 | $0.098 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/105#issuecomment-5649198818) |
| 106 | scrapecreators | 11 | 11/11 | $0.171000 | $0.246 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/106#issuecomment-5649198881) |
| 107 | self-evolving-agent | 3 | 3/3 | $0.014700 | $0.018 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/107#issuecomment-5649198954) |
| 108 | social-intel | 2 | 2/2 | $0.017850 | $0.025 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/108#issuecomment-5649199013) |
| 109 | wallet-desk-brief | 2 | 2/2 | $0.211000 | $0.252 | **PASS** | [comment](https://github.com/SELAT-AI/selat-skills/pull/109#issuecomment-5649199112) |

**Probe PASS: 13 / 16.**  
**Probe HOLD: 3 / 16** (rebase succeeded; live Clado challenge missing).

Per-step quote tables live on each PR comment. Notable live quotes that
still cleared their step caps:

- email-campaign Fiber company-search: $0.21 / cap $0.25
- wallet-desk-brief Arkham intelligence/address: $0.21 / cap $0.25
- lead-enrichment Clado contacts: $0.10815 / cap $0.15
- enrich-waterfall Clado contacts (reachable): $0.15015 / cap $0.20

Hunter `domain-search` on the email-campaign tree now quotes **$0.01365**
(the 2026-08-29 PR body recorded $0.10815). Still within the $0.15 step
cap.

## Remaining HOLD items

These are **upstream probe blockers**, not rebase failures. Branches are
0 behind `main` and static validation is clean. Each failing route was
retried once with the same result. Skill contracts were not rewritten to
paper over the outage (constraint: preserve PR intent).

### HOLD — PR 95 `comprehensive-enrichment`

- Fail: step 1 `POST https://clado.mpp.paywithlocus.com/clado/search`
- Error: `no x402 or MPP challenge detected`
- Cap: $0.40
- 12/13 other steps quoted `routed-mpp` within cap (including
  `clado/contacts` at $0.04515)

### HOLD — PR 96 `enrich-waterfall`

- Fail: step 3 `…/clado/linkedin-profile` (cap $0.02)
- Fail: step 11 `…/clado/scrape` (cap $0.03)
- Fail: step 17 `…/clado/search` (cap $0.06)
- Same error: no x402/MPP challenge
- 15/18 other steps quoted within cap, including `clado/contacts`
  at $0.15015

### HOLD — PR 103 `person-lookup`

- Fail: the only step, `POST …/clado/search` (cap $0.07)
- Same error: no x402/MPP challenge
- This skill cannot pass `selat skill verify --live-probe` until Clado
  search serves a challenge again or the recipe is remapped (out of
  scope for this stale-fix pass)

### Shared diagnosis

`clado/contacts` still returns a live routed-MPP quote. The dead routes
are specifically:

- `/clado/search`
- `/clado/linkedin-profile`
- `/clado/scrape`

Likely a Clado/Locus challenge outage or catalog drift on those paths.
Recommended follow-up (separate from this rebase): re-probe those three
URLs; if still dark, remap or drop them in a dedicated QC pass rather
than silently changing these honesty/fixed-bundle PRs here.

## Constraints honored

- Did not merge any of the 16 skill PRs.
- Did not run `--pay` or settle any payment.
- Did not change skill contracts beyond replay-on-`main` (no conflict
  edits were needed).
- Preserved each PR's honesty / fixed-bundle QC intent.
- `index.json` / `README.md` on each branch still carry only that PR's
  skill-entry update on top of current `main` (main had not added
  conflicting catalog rows since the original bases).

## Success criteria

| Criterion | Status |
|---|---|
| Each of the 16 branches is 0 commits behind `main` (or documented failure) | **Met** — 16/16 at 0 behind |
| Each has a PR comment with fresh 0.17.2 validation + probe evidence | **Met** — 16/16 commented |
| Summary report committed | **Met** — this file |
