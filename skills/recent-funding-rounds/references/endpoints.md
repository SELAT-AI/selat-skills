# recent-funding-rounds — endpoint

The repaired skill uses one read-only Brave News Search operation through the
SELAT Router. A free live probe on 2026-08-30 confirmed a reachable `routed-mpp`
payment challenge and a live routed quote within the tightened cap. A probe
reads the challenge and never signs or settles.

| Purpose | Method and endpoint | Fixed request shape | Live routed quote | Per-call cap |
|---|---|---|---:|---:|
| Recent funding-news discovery | `POST brave.mpp.paywithlocus.com/brave/news-search` | `q="${focus} funding round announced"`, `count=10`, `freshness="${freshness}"` | $0.036750 | $0.050 |

The merchant's current payment metadata lists a $0.035 source-service charge;
the free SELAT probe reports the routed amount shown above. Always re-probe
before payment because price, rail, and availability can change.

## Request schema and freshness

The merchant's public OpenAPI currently documents:

| Field | Type | OpenAPI note | Manifest source |
|---|---|---|---|
| `q` | string | Required search query | `${focus} funding round announced` |
| `count` | number | Results from 1 to 50; provider default 20 | fixed numeric literal `10` |
| `freshness` | string | `pd`, `pw`, `pm`, `py`, or a date range | required `${freshness}` restricted by the skill to the four documented relative presets |
| `country` | string | Optional country code | omitted; provider behavior applies |

The skill deliberately uses a fixed numeric `count` because manifest parameter
substitution produces strings. It supports the four explicit relative presets:

- `pd`: past 24 hours;
- `pw`: past 7 days;
- `pm`: past 31 days;
- `py`: past 365 days.

Although the OpenAPI mentions a date-range form, it does not specify its syntax
in the operation schema. This skill therefore does not expose undocumented
date-range formatting. For exact calendar boundaries, use the closest rolling
window and transparently filter returned publication timestamps client-side.

## Scope and interpretation

- This is one synchronous news search; there is no polling or pagination step.
- `freshness` applies to indexed publication recency, not necessarily the date
  on which a financing legally closed or was first announced.
- Stage and amount phrases in `focus` are query terms, not structured database
  filters. Treat extracted company, stage, amount, and investor fields as claims
  supported by the returned article, not normalized deal records.
- The OpenAPI documents a successful response but does not publish a detailed
  response-object schema. Report only fields actually returned by a paid call.
- Free verification establishes reachability and price only. It does not prove
  application-response quality or successful paid delivery.
- A paid application error may still charge. Check payment history and obtain a
  fresh quote and approval before retrying.

## Free verification

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/recent-funding-rounds \
  --focus "artificial intelligence startups" \
  --freshness "pw" \
  --live-probe
```

Expected gate: one reachable `routed-mpp` challenge at or below the manifest
cap, with no payment signed or settled.
