# Endpoints — recent-funding-rounds

Use only these endpoint families for `recent-funding-rounds`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Bounded recent funding-news search | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | MPP on Tempo | $0.03675 | $0.050 |

This is a fixed 1-call manifest. The step table matches `manifest.json` exactly.

- **Live-probed 2026-10-04** (`selat-pay --probe-only --live-probe`, free, never
  signs): 402 reachable, mode `routed-mpp`, $0.03675 within the $0.050 cap.
- **Top-level `maxAmount` ($0.050)** is only the per-step fallback for a step
  that omits its own cap, not a full-run cap. With one step the two coincide.
- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Brave Search via Locus (`brave.mpp.paywithlocus.com`).

## Brave Search MPP — `MPP on Tempo`

serviceUrl: `https://brave.mpp.paywithlocus.com`

Live-probed price: `$0.03675` per call (`routed-mpp`). **POST with a JSON body**.
Returns recent news articles (title, snippet, source, publish date, URL), not a
structured funding database. Company, stage, amount, and investors must be
extracted from article text and labelled as article-derived.

| Step | Endpoint | Body params |
| --- | --- | --- |
| 1 — funding news | `/brave/news-search` | `q` (string, required) ← `${focus} startup funding round announced`; `count` (number, 1–50) fixed `10`; `freshness` (string) ← `${freshness}` |

```json
{ "q": "fintech Series A startup funding round announced", "count": 10, "freshness": "pw" }
```

`count` is a fixed numeric literal because manifest `${param}` substitution
produces strings. `freshness` is restricted by the skill to Brave's four
relative presets: `pd` (24 hours), `pw` (7 days), `pm` (31 days), `py` (365
days). These filter publication recency, not deal-close date, and are rolling
windows, not calendar periods. The OpenAPI also mentions a date-range form
without specifying its syntax, so the skill does not expose it. `country` is
omitted (provider default applies).

## Free verification

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/recent-funding-rounds \
  --focus "artificial intelligence" \
  --freshness "pw" \
  --live-probe
```

Single-step probe (the `--chain base` token is only selat-pay's required flag;
a probe never settles and the router quotes every Gateway chain identically):

```bash
selat-pay POST https://brave.mpp.paywithlocus.com/brave/news-search \
  --chain base --max-amount 0.050 --probe-only --live-probe \
  --body '{"q":"fintech Series A startup funding round announced","count":10,"freshness":"pw"}'
```

A free probe proves reachability and price, not response quality. A paid
application error may still charge; check payment history and get a fresh
quote and approval before any retry.
