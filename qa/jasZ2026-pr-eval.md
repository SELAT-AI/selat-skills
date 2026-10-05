# QA evaluation: jasZ2026 skill-repair PRs

**Repo:** `SELAT-AI/selat-skills`  
**Author:** [jasZ2026](https://github.com/jasZ2026) (Xiaochao Zhou)  
**Reviewed against:** `origin/main` @ `4855431` (`chore(reliability): refresh reliability.json`, 2026-09-12)  
**PR list command:** `gh pr list --repo SELAT-AI/selat-skills --author jasZ2026 --state all --limit 100`  
**Closed PRs:** none. PR **#98** is not in this author’s series.  
**Method:** `gh pr view` + `gh pr diff` for each PR vs current `main`; live quotes from `reliability.json` (`generatedAt` **2026-09-12T20:13:41Z**, probe-only). No paid calls in this review. No code fixes.

**CLI skew:** every PR body cites **selat CLI 0.16.15**. Published `SELAT-AI/selat-cli` latest GitHub release is **v0.16.1** (2026-08-20). Treat every receipt as produced by an unpublished CLI, then re-probe on the runner you will actually ship.

**Batch shape:** 16 open PRs, all `MERGEABLE` / `CLEAN` vs current `main`, all `validate` CI green. Each is a one-commit contract rewrite of a single skill. **Every PR edits `index.json`.** Twelve also edit `README.md`. Skill directories do not overlap. Merging more than one without rebase **will** conflict on the catalog files and can revert a sibling’s README row.

---

## Verdict table

| PR | Skill | Verdict | Severity blockers | Notes |
|---:|---|---|---|---|
| [#93](https://github.com/SELAT-AI/selat-skills/pull/93) | email-campaign | **MERGE WITH NITS** | none | Kills send/draft + Abstract + duplicate verifier. Fiber schema is new and dynamically priced; probe-only. Index still says finder “and” verifier of one email while steps are independent. |
| [#94](https://github.com/SELAT-AI/selat-skills/pull/94) | account-intel | **HOLD** | `handle`/`name` still default `"OpenAI"`; Alchemy uses `polygon-mainnet` not `matic-mainnet`; Validation uses USDC contract `0xa0b8…eb48` as OpenAI’s wallet; trigger evals omit required `address` | GET→POST Alchemy is the right repair. README not updated. |
| [#95](https://github.com/SELAT-AI/selat-skills/pull/95) | comprehensive-enrichment | **HOLD** | Diffbot still sends scalar `"name"`; Clado `/search` unbounded **and currently down**; README not updated | Honest 13-call bundle, Abstract removed. Sibling #96 documents the Diffbot/Clado shapes this PR missed. |
| [#96](https://github.com/SELAT-AI/selat-skills/pull/96) | enrich-waterfall | **HOLD** | README on `main` still says **“Cheapest-first…”** (this PR does not touch README); Clado `/linkedin-profile`, `/scrape`, `/search` **unreachable** on 2026-09-12 | Strongest *internal* repair in the batch (async StableSocial gone, `xHandle`/`organizationId` explicit, Diffbot arrays). Do not land until Clado is live and README is rewritten. |
| [#97](https://github.com/SELAT-AI/selat-skills/pull/97) | financial-intel | **MERGE WITH NITS** | none | Live 2026-09-12 quotes still match the PR table on every step. README still says “assets and tickers”; index is crypto-only. Alchemy mode claimed `routed-x402`, registry says `direct`. |
| [#99](https://github.com/SELAT-AI/selat-skills/pull/99) | find-twitter-influencers | **MERGE WITH NITS** | none | Contact purchase (Hunter/Clado) removed. README still says “with enrichment.” New Orthogonal `company-enrich` + `twitter/user/search` are not in `reliability.json`. |
| [#100](https://github.com/SELAT-AI/selat-skills/pull/100) | gtm-enrichment-deep | **MERGE WITH NITS** | none | Cleanest GTM repair. Live quotes match exactly. Apollo caps are tight (1.25×). Sixtyfour catalog lie is gone. Probe-only on PII enrichment. |
| [#101](https://github.com/SELAT-AI/selat-skills/pull/101) | gtm-enrichment-smart | **MERGE WITH NITS** | none | Kills default `elonmusk` Twitter spend and fake conditionals. Rail `mixed` → MPP-only is correct. Same unregistered Orthogonal company-enrich host as #99. |
| [#102](https://github.com/SELAT-AI/selat-skills/pull/102) | lead-enrichment | **HOLD** | “business-phone” overclaim; evals omit match / free-mail / charged-failure / cost; paid phone buy with no smoke | Mechanical repair is real (no `williamhgates`, no fake email chaining). Index/SKILL/step label inflate Clado `phone_enrichment: true` into a business-line filter. |
| [#103](https://github.com/SELAT-AI/selat-skills/pull/103) | person-lookup | **HOLD** | Sole step `POST clado…/clado/search` is **`down`** on 2026-09-12; field list promised without paid schema; cap `$0.070` loses if 30-result pricing returns | Contract on paper is right (drop `"AI startups"`, require company, `limit=5`). Do not merge a `down` skill. |
| [#104](https://github.com/SELAT-AI/selat-skills/pull/104) | recent-funding-rounds | **MERGE WITH NITS** | none | Drops Fundable / silent `artificial intelligence` default. Live `$0.03675` / cap `$0.050`. No unrelated non-trigger eval. |
| [#105](https://github.com/SELAT-AI/selat-skills/pull/105) | sales-prospecting | **MERGE WITH NITS** | none | Abstract + Fiber harvest claims gone. Top-level `maxAmount` `$0.050` is **below** expected run `$0.07245` (documented as per-step fallback only). Paid smoke missing. |
| [#106](https://github.com/SELAT-AI/selat-skills/pull/106) | scrapecreators | **MERGE WITH NITS** | none | Clado + async StableSocial removed; 11 sync Orthogonal + Twitter reads. High-risk smoke missing (`{jobId,pending}` vs sync is OpenAPI-checked, not paid-200). No charged-failure eval. |
| [#107](https://github.com/SELAT-AI/selat-skills/pull/107) | self-evolving-agent | **HOLD** | `SKILL.md` frontmatter **unchanged**: still matches “operate… AgentMail… wallet treasury… live trade.” `trigger-agentmail-wallet-identity` kept. Body still claims Twitter/X / on-chain / prediction-market APIs the manifest does not call | Manifest/index/README are honest 3-call preflight. Activation surface is not. Merging as-is makes the catalog and the agent trigger contradict each other. |
| [#108](https://github.com/SELAT-AI/selat-skills/pull/108) | social-intel | **HOLD** | Tavily cap tightened to `$0.015`; 2026-09-12 registry: Tavily **unreachable**, error `Cannot convert 0.016 to a BigInt` | Contract repair is the right one (no Reddit/X). Do not ship a cap below the amount the current pay stack cannot even parse. |
| [#109](https://github.com/SELAT-AI/selat-skills/pull/109) | wallet-desk-brief | **MERGE WITH NITS** | none | Correct Alchemy POST + `matic-mainnet`; ownership → probabilistic attribution; Vitalik default removed. Probe-only on ~$0.211 (Arkham `$0.21`). Highest demo/payment-path value in the mergeable set. |

**None of the 16 is `MERGE` clean. None is `REJECT`.** Direction is uniformly “stop overclaiming; make the manifest the contract.” Blockers are leftover defaults, dead merchants, catalog drift, and one activation-surface lie (#107).

---

## Cross-cutting themes

### 1. The batch is one authoring template applied 16 times

Every PR: drop placeholder defaults → require a coherent identifier set → delete Abstract / async / unpayable routes → tighten caps around an Aug 29–31 probe → add fail-closed / no-auto-retry language → rewrite `index.json` (and usually README) to “Fixed N-call, read-only…”. That is the right template. Variance is whether the author finished the last 10% (defaults, sibling schema, README, frontmatter, evals).

### 2. Abstract Company Enrichment is dead on live main

`reliability.json` 2026-09-12: `https://abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup` → **no x402 or MPP challenge**. That single dead host degrades **email-campaign, enrich-waterfall, find-twitter-influencers, gtm-enrichment-smart, sales-prospecting** (and is the retired step #95/#96/#99/#101/#105 replace). Replacing it with Orthogonal `GET …/company-enrich/companies/enrich` is correct — but that replacement host is **not in the 2026-09-12 registry**. Re-probe it once and share the receipt across #93, #95, #96, #99, #101.

### 3. Clado people-search / LinkedIn scrape is down

Same snapshot:

| Route | Used by (main / these PRs) | Status |
|---|---|---|
| `clado.mpp.paywithlocus.com/clado/search` | person-lookup; comprehensive-enrichment; enrich-waterfall | **unreachable** |
| `…/clado/linkedin-profile` | enrich-waterfall; scrapecreators (main) | **unreachable** |
| `…/clado/scrape` | enrich-waterfall; scrapecreators (main) | **unreachable** |
| `…/clado/contacts` | lead-enrichment; comprehensive-enrichment; enrich-waterfall | **ok** (`$0.04515` LinkedIn-only; phone flags raise price) |

#103 / #95 / #96 cannot be treated as spend-safe until `/clado/search` (and for #96, profile + scrape) returns a 402 again. #102’s contacts step is a different host path and is still live.

### 4. Tavily is broken in the current pay stack

`Cannot convert 0.016 to a BigInt` on every Tavily step (`social-intel`, `vc-ai-infra-scout` ×2). #108 *tightens* the Tavily cap from `$0.05` → `$0.015`. If `0.016` is the live amount, the repaired skill is over cap on day one. This is a **selat-pay / CLI decimal bug** as much as a skill bug; it will also keep `vc-ai-infra-scout` degraded even if #108 never merges.

### 5. “Cheapest-first” / “conditional fallback” / “the runner will skip” is a lie the CLI cannot keep

`selat skill run` pays every step. The PRs that say this out loud (#93, #95, #96, #99–#101, #105–#109) are the ones that restore a honest contract. #96 is the headline case: `index.json` on `main` still says “Cheapest-first B2B person+company enrichment waterfall across 14 MPP merchants.”

### 6. Silent defaults / celebrity placeholders

Removed in most PRs (`John`/`Doe`/`Stripe`/`williamhgates`/`elonmusk`/`0xd8dA…`/`agent payments`). **Left in #94:** `handle` and `name` still default `"OpenAI"`. A run with `--name Anthropic --address 0x…` and no handle still pays for OpenAI’s Twitter.

### 7. Ownership vs attribution; outreach vs prepare

#109 is the model: Arkham is probabilistic attribution, not ownership. #93/#100/#101/#105 correctly refuse send/CRM. #102 then overcorrects by labeling generic `phone_enrichment: true` as “business-phone.” #107 index says “does not … place trades” while `SKILL.md` frontmatter still matches “live trade.”

### 8. Probe-only is documented; paid smoke is missing where it matters

Rubric allows probe-only. Flag high-risk gaps:

| Risk | PRs | Why a 402 is not enough |
|---|---|---|
| Alchemy GET→POST + 5-network body | #94, #109 | Main registry still probes the **old GET**. #109 docs: Alchemy 7-day delivery 80% / 5 samples. |
| Dynamic-price search (Fiber, Clado search) | #93, #95, #96, #103 | Caps assume `pageSize`/`limit` are honored. |
| Phone/PII purchase | #102, #100, #101, #105 | `reveal_*` and `phone_enrichment` flags only proven if a paid body comes back. |
| Async→sync social | #106 | Claim is “no `{jobId, pending}`.” OpenAPI ≠ paid 200. |
| 13–18 independent paid calls | #95, #96 | Cumulative ~$0.53–$0.62; one paid application error still charges. |

### 9. Catalog stack risk is the merge blocker even when the skill is good

All 16 PRs share one `index.json` array. README hunks for #100–#109 include **adjacent pre-repair rows**. Example: #101’s README still contains `Deep GTM enrichment through Apollo and Sixtyfour` as unchanged context. If #100 merges first, that line is already gone; merging #101 next can **revert** #100’s catalog sentence. Same pattern for Fiber / Nyne / Fundable / “conditional gap fills.”

**Do not merge two of these without rebase. Do not land a README hunk against stock `main` after a sibling has already rewritten the table.**

### 10. Rail / mode drift

Several PRs claim “all Twitter/Alchemy steps are `routed-x402`.” `reliability.json` 2026-09-12 reports `catalog.selat.ai/twitter/*` and the **current** Alchemy GET as `mode: "direct"`. That does not block merge by itself, but it is a leftover overclaim in compatibility strings (#94, #97, #99, #109).

---

## Which PRs conflict with each other

Skill directories do **not** overlap. Conflicts are catalog + shared merchants.

| Shared surface | PRs | What breaks |
|---|---|---|
| `index.json` (entire `skills[]`) | **all 16** | Second merge conflicts unless rebased. |
| `README.md` catalog table | 93, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109 | Adjacent-row revert risk (see theme 9). |
| README **not** updated | 94, 95, 96, 97, 99 | Solo merge leaves `selat skill list` (index) honest and the human catalog stale. Worst: #96 leaves **“Cheapest-first…”** in README. |
| Orthogonal `company-enrich` | 93, 95, 96, 99, 101 | One unregistered host; one re-probe should be shared. |
| Clado `/search` | 95, 96, 103 | All blocked on the same down merchant. |
| Diffbot `enhance` body | 95 vs 96 | #95: `"name": "${company}"`. #96: `name[]` / `url[]` / `refresh:false` / `size:1`. #96 says a scalar can produce a **paid application error**. |
| Alchemy `tokens/by-address` POST | 94 vs 109 | #94: `polygon-mainnet`. #109: **`matic-mainnet`** (and `endpoints.md` says do not substitute). Same vendor, two network IDs. |
| Twitter research vs “social intel” | 99, 106, 108 | #108 stops claiming X/Reddit APIs. #99/#106 are the skills that actually call Twitter. |

---

## Recommended merge order

Merge **one at a time**, rebase onto `main` after each, and rewrite only *that* skill’s `index.json` / README row. Do not take a PR’s full README hunk after a sibling has landed.

### Land now (after rebase + one-line catalog fix if needed)

1. **#104 `recent-funding-rounds`** — smallest, live price matches, isolated merchant.
2. **#109 `wallet-desk-brief`** — demo / payment-path skill; correct Alchemy contract + attribution language. Prefer a paid Alchemy 200 before NYC if the desk will be shown live.
3. **#97 `financial-intel`** — quotes still match 2026-09-12; add a README crypto-only line on rebase.
4. **#100 `gtm-enrichment-deep`** — cleanest GTM contract.
5. **#101 `gtm-enrichment-smart`** — rebase after #100 so README does not resurrect Sixtyfour.
6. **#93 `email-campaign`** — Fiber is new; keep the no-send language.
7. **#105 `sales-prospecting`** — rebase after #100/#101; watch the top-level `$0.050` vs `$0.07245` session-budget docs.
8. **#99 `find-twitter-influencers`** — on rebase, change README from “with enrichment” to the no-contact-data wording.
9. **#106 `scrapecreators`** — last among mergeable; 11-call social surface, largest smoke gap.

### Hold (do not merge until the named blocker is gone)

| Order if unblocked | PR | Unblock condition |
|---|---|---|
| 10 | **#108 social-intel** | Re-probe Tavily. If live ≥ `$0.016` or BigInt still throws, raise the cap (or fix selat-pay) *before* merge. This is the PR that stops the Reddit/X catalog lie. |
| 11 | **#94 account-intel** | Drop `OpenAI` defaults; use `matic-mainnet`; stop using the USDC contract as OpenAI’s wallet; require `address` in trigger evals. |
| 12 | **#102 lead-enrichment** | Say “phone enrichment” not “business-phone”; add match / free-mail / charged-failure / cost evals; paid smoke of the phone flag. |
| 13 | **#107 self-evolving-agent** | Rewrite `SKILL.md` frontmatter, When To Use, Gather Intelligence, and `trigger-agentmail-wallet-identity` so agents do not match “operate / AgentMail / live trade.” |
| 14 | **#103 person-lookup** | `/clado/search` reachable again; paid field list or stop promising role/education/location. |
| 15 | **#95 comprehensive-enrichment** | Adopt #96 Diffbot arrays + Clado `limit`; Clado search live; README row. |
| 16 | **#96 enrich-waterfall** | Clado profile/scrape/search live; **README cheapest-first line deleted**; paid smoke of the 18-call bundle or a documented subset. |

---

## Launch / NYC demo / payment-path impact

What would break a launch claim if these PRs stay open **or** if the wrong ones merge:

### If nothing merges (current `main` as demoed)

| Claim on `main` today | Reality (2026-09-12) | Demo failure mode |
|---|---|---|
| `index.json` / README: enrich-waterfall is **cheapest-first** | CLI pays all 20 steps; 4 unreachable (Abstract + 3 Clado) | Agent promises a cheap waterfall, charges ~$0.53 of live steps, then dies on Clado. |
| `social-intel` “fuses Reddit + X/Twitter” | Manifest is Exa + Tavily only; Tavily probe **errors** | Social-listening demo is a web-search pair, and the second call may not even quote. |
| `email-campaign` “before I send” / bounce-check | Abstract dead; no send API exists; duplicate verifier on `main` | Outreach demo implies send capability the skill never had. |
| `person-lookup` “via Nyne” | Manifest is Clado search; skill is **`down`** | People-search demo has no 402. |
| `gtm-enrichment-deep` “Apollo + Sixtyfour” | Sixtyfour is not in the manifest | Catalog lie in `selat skill list`. |
| `recent-funding-rounds` “via Fundable” | Brave news only | Structured-deal claim; articles ≠ rounds. |
| `wallet-desk-brief` “who owns this wallet” + Alchemy **GET** | Arkham is a label; GET `?address=` is not the documented Portfolio body; Vitalik is the silent default | Desk demo can attribute the sample wallet or miss holdings on the POST-only contract. |
| `self-evolving-agent` “operate… AgentMail… live trade” | Manifest is KOL + Hyperliquid + domain check | NYC “economic agent” story overclaims identity, funding, and trading. |
| `find-twitter-influencers` “with enrichment” | Hunter + Clado contact steps still on `main`; Abstract dead | Demo either buys contact data or fails on Abstract. |

### If the mergeable set lands in the order above

- **Payment path:** #109 is the one that makes the wallet desk executable (POST + no silent Vitalik). Still probe-only on Arkham `$0.21` — a live desk should pay once in rehearsal.
- **Outreach path:** #93/#100/#101/#105 make “prepare / qualify / research, never send” consistent. Do **not** demo #102 until the phone-buy wording is honest.
- **Social path:** #99 + #106 are the skills that actually hit Twitter/IG/TikTok/LinkedIn. #108 must stay **off** the stage until Tavily quotes. Do not let an agent pick `social-intel` for “what’s Twitter saying.”
- **Enrichment path:** leaving #95/#96/#103 on HOLD is correct. Shipping them now installs **down/degraded** Clado steps into a “repaired” catalog.
- **#107 is the dangerous merge:** index/README would say “does not create identity / fund / trade” while the skill **description agents match on** still says AgentMail + treasury + live trade. That is worse than today’s consistent overclaim.

### Shared payment-stack bugs this batch cannot fix

- Tavily `0.016` BigInt (`social-intel`, `vc-ai-infra-scout`) — CLI / selat-pay.
- Clado search/profile/scrape 402 gone — merchant.
- Abstract lookup 402 gone — merchant (PRs already delete it).

Those three will show up in `reliability.json` after any merge. A launch readout that only looks at “PRs merged” will still be red.

---

## Per-PR review (claim / manifest / spend / evals / catalog / evidence)

### #93 `email-campaign` — MERGE WITH NITS

**What it repairs on `main`:** `skills/email-campaign/SKILL.md` still triggers on “verify these emails before I send.” Manifest has Stripe/John defaults, a duplicate Hunter verifier, and Abstract company context (dead). Fiber is documented in SKILL but **absent** from `manifest.json`.

**Contract after PR:** six required params (`industry`, `domain`, `firstName`, `lastName`, `company`, `email`), no defaults. Steps: Fiber `company-search` (`industriesV2.anyOf`, `employeeCountV2`, `pageSize: 10`) → Hunter domain-search / finder / **one** verifier → Apollo people-enrichment → Company Enrich GET. Caps sum `$0.505`; claimed probe `$0.392962`. README + index updated; evals cover Fiber schema, single-verifier, Abstract regression, no-send, charged-failure.

**Nits:** index says finder **and** verifier of “one known target’s work email”; verifier checks the **supplied** `email`. Fiber `$0.21` / cap `$0.25` is tight and not in today’s registry. Probe-only.

---

### #94 `account-intel` — HOLD

**What it repairs:** Alchemy GET `?address=` + default zero address (wasted paid call / empty holdings). `query` unused. “Three rails” / cheapest-first language.

**What it leaves:**

```text
skills/account-intel/manifest.json
  handle.default = "OpenAI"          # unchanged
  name.required = true
  name.default  = "OpenAI"           # still a silent default
  address.required = true            # good; zero-address default removed
```

Alchemy POST body uses `"polygon-mainnet"`. Sibling #109 `skills/wallet-desk-brief/references/endpoints.md` (new): **“Polygon's Portfolio API identifier is `matic-mainnet`. Do not substitute.”**

`SKILL.md` Validation example: `--address 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` (USDC). That re-teaches false association after the PR’s own “do not infer ownership” rule.

Workflow steps 1 and 4 still say **“(x402 on Base, ~$0.001)”** after the Rails section was rewritten to routed-x402 / two protocols.

Evals `trigger-cross-platform-account` / `trigger-brand-footprint` / `trigger-person-reputation` / `cost-before-spend` never require `address`, contradicting `no-address-placeholder-disclosure`. No charged-failure eval. README not updated.

Alchemy POST + 5-network body is otherwise the right live shape. Spend vs current live Twitter/YouTube/Brave/Exa/Alchemy GET quotes is inside cap.

---

### #95 `comprehensive-enrichment` — HOLD

**Repairs:** seven required identifiers; no `williamhgates` / empty `pricingUrl`; Abstract → Company Enrich GET; “skip Clado to save cost” removed; evals for identity-mismatch, no-skip, Abstract regression, charged-failure.

**Blockers:**

- `skills/comprehensive-enrichment/manifest.json` Diffbot step still `"name": "${company}"`. #96’s `endpoints.md` says Diffbot OpenAPI wants `name[]` / `url[]` and a scalar **can charge then application-error**.
- Clado `search` body is unbounded `{ "query": "${firstName} ${lastName} ${company}" }`. Same merchant is **unreachable** on 2026-09-12. Cap `$0.40` assumes the Aug 29 `$0.31815` quote still exists.
- README still: “Deep multi-source person and company enrichment.”
- 13 independent paid calls, ~$0.62 claimed, Firecrawl “charge then error” on a bad `pricingUrl`. No paid smoke.

Hunter `domain-search` live is now `$0.01365`, not the PR’s `$0.108150` — cap still holds; the table is stale.

---

### #96 `enrich-waterfall` — HOLD

**Repairs (skill-internal, strongest in the batch):** 20 → 18 steps; StableSocial Instagram/TikTok **async job** routes deleted; Abstract → Company Enrich; `xHandle` and `organizationId` required because the runner cannot chain; Diffbot arrays; Clado contacts `email_enrichment`+`phone_enrichment`; Clado search `limit: 5`; cheapest-first / stop-on-match language deleted from SKILL + manifest + index.

**Blockers:**

- This PR **does not edit `README.md`**. Current README line 57: **“Cheapest-first B2B person and company enrichment waterfall.”** That is the lie the PR exists to kill.
- Required Clado steps `/linkedin-profile`, `/scrape`, `/search` are **dead** on 2026-09-12. PR body said all 18 were green on 2026-08-30.
- Highest spend (~$0.53 claimed) and no paid smoke.

If #95 and #96 both land, take **#96’s** Diffbot and Clado-search shapes as canonical.

---

### #97 `financial-intel` — MERGE WITH NITS

Five required params (`symbol`, `coin`, `ticker`, `assetChain`, `query`); no `ETH`/`AAPL` defaults. Endpoints unchanged and **all live-ok**. Caps `$0.002/$0.08/$0.015/$0.07/$0.02` vs live `$0.001/$0.063/$0.0084/$0.0525/$0.00735` — exact match to the PR table. Nansen is labeled **chain-wide**, not “this token’s smart money.” Evals cover equity-only, advice, trade execution, paid-partial-failure.

**Nits:** README still “assets and tickers”; index is a “crypto research bundle.” Alchemy compatibility says routed; registry says `direct`. Probe-only is acceptable at this risk.

---

### #99 `find-twitter-influencers` — MERGE WITH NITS

Drops Hunter finder + Clado contacts + Abstract + Exa `findSimilar` + single-handle `user/info`/`last_tweets`. Five calls: Apollo org-search (5), Company Enrich GET, Exa search (10), `twitter/user/search`, `twitter/tweet/advanced_search`. No defaults. Evals: no DMs, no guaranteed count of 20, no contact column.

**Nits:** README **not** updated — still “Twitter/X influencer discovery **with enrichment**.” `twitter/user/search` and Orthogonal company-enrich are absent from `reliability.json`. Twitter steps claimed `routed-x402`; registry `direct`. `findSimilar` is still live (`$0.00525`) — removal is scope-narrowing, not a dead-route cleanup.

---

### #100 `gtm-enrichment-deep` — MERGE WITH NITS

Two required params (`email`, `domain`). Always-run Apollo people + Hunter company + Apollo org (no fake “only if Hunter is thin”). `reveal_personal_emails` / `reveal_phone_number` **false**. Live `$0.0399+$0.01365+$0.0399` = `$0.09345` matches registry. README + index drop Sixtyfour. Evals: domain required, free-mail, personal-contact minimization, Hunter≠funding, charged-failure.

**Nits:** Apollo cap `$0.05` / `$0.0399` = 1.25×. Probe-only on work-email PII. Thin unrelated non-trigger (sibling #101 has `no-trigger-unrelated`).

---

### #101 `gtm-enrichment-smart` — MERGE WITH NITS

Kills the 8-step “conditional” recipe that always charged, including Twitter against default **`elonmusk`**, and dead Abstract. Three calls: Hunter combined-enrichment, Hunter verifier, Company Enrich GET. Rail corrected to **MPP-only**. Evals are the strongest GTM set (`no-twitter-default`, `deliverability-not-consent`, `choose-deep-when-needed`).

**Nits:** Orthogonal company-enrich not in registry. Combined cap `$0.03` / `$0.02415` = 1.24×. Frontmatter example still says “before outreach” next to “does not send.” Probe-only.

---

### #102 `lead-enrichment` — HOLD

**Repairs:** six required identifiers; no placeholder identities; no “email from step 1” chaining; Apollo reveal flags false; Clado `email_enrichment: false`, `phone_enrichment: true`; Fiber/Sixtyfour catalog lie removed.

**Blockers:**

- `index.json` / `SKILL.md` / step label: **“business-phone”**. Manifest sends generic `phone_enrichment: true`. That is any phone Clado sells.
- Evals are only seven (`full-authorized-lead-cross-check`, `no-false-step-chaining`, `reject-incoherent-placeholder-target`, `narrow-email-only-request`, `company-only-request`, `probe-only-validation`, `privacy-and-consent-boundary`). Missing the match / free-mail / charged-failure / numeric-cost evals siblings treat as required.
- This is the only PR that **raises** spend to buy a phone on every run (`$0.10815` claimed vs live LinkedIn-only `$0.04515`). No paid smoke.

---

### #103 `person-lookup` — HOLD

**Repairs:** required `name` + `company`; drop default `"AI startups"`; `limit: 5`, `offset: 0`, `advanced_filtering: true`, `companies: ["${company}"]`; cap `$1.00` → `$0.070`; catalog Nyne lie removed; evals refuse generic “who is X?” and private-contact near-misses.

**Blockers:**

```text
reliability.json person-lookup status=down
error=no x402 or MPP challenge detected at
  https://clado.mpp.paywithlocus.com/clado/search
```

`references/endpoints.md` admits OpenAPI has no response schema and “do not promise a particular field until a paid smoke test,” then `SKILL.md` still lists role, employer, work history, education, location, public links. Cap `$0.070` vs historical unbounded quote `$0.31815` is unpayable if `limit` is ignored.

---

### #104 `recent-funding-rounds` — MERGE WITH NITS

Required `focus` + `freshness` (`pd|pw|pm|py`); numeric `count: 10`; cap `$0.40` → `$0.050` vs live `$0.03675`. Fundable / structured-deal claim gone. README + index updated. Evals: calendar-week caveat, required-input, paid-failure-no-retry.

**Nit:** no unrelated non-trigger. Query dropped the word `startup` (`${focus} funding round announced`). Low-risk; probe-only is fine.

---

### #105 `sales-prospecting` — MERGE WITH NITS

Nine required inputs; five Apollo/Hunter reads; Abstract + Hunter domain-harvest + Fiber gone; `reveal_*` false; searches `per_page=10`, `page=1`. Live sibling quotes match (`$0.00525/$0.00525/$0.0399/$0.0084/$0.01365` ≈ `$0.07245`). Evals: format/enum, privacy, no-outreach, paid-failure.

**Nits:** top-level `maxAmount` `"0.050"` < expected total `$0.07245`. Documented as per-step fallback; any consumer that treats top-level as a session cap will under-budget. People-enrichment cap 1.25×. Paid smoke missing. Prompt `bounded-coherent-bundle` still says “outreach planning.”

---

### #106 `scrapecreators` — MERGE WITH NITS

Nine required platform-specific identifiers; 11 calls (3 SELAT Twitter GETs + 8 Orthogonal Scrape Creators GETs). Clado LinkedIn + StableSocial async IG/TikTok removed. Distinct handles; dedicated LinkedIn person/post/company URLs; `trim=true`. Caps 3×`$0.002` + 8×`$0.03`; claimed `$0.171`. README now includes TikTok.

**Nits:** no charged-failure eval. Eval `twitter-contracts` mixes handle `openai` with Jack’s first tweet id. Sync-vs-async is the central claim and is **not** paid-200 proven. Main registry still probes the old 12-step Clado/StableSocial recipe (`degraded`).

---

### #107 `self-evolving-agent` — HOLD

**Manifest repair is real:** required `asset` + `domainCandidate`; Hyperliquid URL actually includes `?asset=`; defaults gone; quotes `$0.00315+$0.00105+$0.0105` match live; index/README say “does not create identity, buy infrastructure, fund wallets, or place trades.”

**Activation surface is not repaired.** Unchanged frontmatter:

```yaml
# skills/self-evolving-agent/SKILL.md (this PR does not edit `description`)
description: Use this skill when the user wants to design or operate a
  budgeted economic agent with its own operational identity, AgentMail
  address, agent-wallet treasury, infrastructure budget, social and
  financial intelligence loop, monetization or trading hypotheses...
```

Body leftovers: When To Use still lists mailbox/OTP, buy compute/domains, live trading; Gather Intelligence still claims Twitter/X trends, influencer movement, prediction markets, on-chain flows — **APIs this skill does not call**. Eval `trigger-agentmail-wallet-identity` still expects AgentMail inbox + Circle OTP. Version stays `"2.0"`.

Merging this makes `selat skill list` honest and agent routing **less** honest.

---

### #108 `social-intel` — HOLD

**Contract repair is the right one:** required `topic` (no `agent payments` default); explicit “does not query Reddit, X/Twitter, or other social-platform APIs”; Exa + Tavily only; evals `notrigger-2` (X/Twitter), `guardrail-1` (missing topic), `failure-1` (no auto-retry). README + index stop saying “cross-platform social intelligence.”

**Spend blocker:**

```text
reliability.json social-intel Tavily
  reachable=false
  error=Cannot convert 0.016 to a BigInt
```

PR sets Tavily `maxAmount` **`$0.015`** (was `$0.05`) on an Aug 31 quote of `$0.0105`. Current stack cannot parse `0.016`. Same error on `vc-ai-infra-scout`. Re-probe and raise the cap (or fix selat-pay) before merge. Exa `$0.00735` / cap `$0.010` still matches.

---

### #109 `wallet-desk-brief` — MERGE WITH NITS

**Repairs the demo wallet skill:** Alchemy GET/query → POST `addresses[]` + five networks including **`matic-mainnet`**; required non-zero address, Vitalik default removed; Arkham = probabilistic attribution; evals for `0x…` placeholder, missing address, attribution safety, no-retry, trade non-trigger. README + index updated. Version `1.1`.

**Nits:** probe-only on `$0.001 + $0.21`. Main registry still probes the **old GET** as `direct` `$0.001` — that is not proof of the new POST body. Arkham cap `$0.25` / `$0.21` is ~19% headroom. Compatibility still says both steps `routed-x402`.

This is the highest-value mergeable PR for a payment-path / NYC wallet desk, provided rehearsal pays Alchemy once.

---

## Review metadata

| Item | Value |
|---|---|
| Open PRs reviewed | 16 (#93–#97, #99–#109) |
| Recently closed jasZ2026 PRs | **none** |
| All individually mergeable vs `main`? | yes (`CLEAN`) as of this review |
| All `validate` CI | SUCCESS (ran 2026-08-31; not re-run against today’s `reliability.json`) |
| Live registry | `reliability.json` 2026-09-12: 10 ok / 9 degraded / 1 down (`person-lookup`) |
| This review’s paid calls | none |

**Do not treat Aug 31 `selat skill verify` receipts as current.** Re-probe on the shipped CLI after rebase, especially Orthogonal company-enrich, Clado search, Tavily, and Alchemy POST.
