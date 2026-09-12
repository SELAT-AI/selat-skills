# person-lookup — endpoint

The repaired skill uses one read-only people-search endpoint through the SELAT
Router. The free live probe on 2026-08-30 confirmed `routed-mpp`, a quote within
the repaired cap, and a successful network-wide delivery history with only a
small sample. A probe reads the payment challenge and never signs or settles.

| Purpose | Method and endpoint | Fixed request shape | Live routed quote | Per-call cap |
|---|---|---|---:|---:|
| Public professional candidate lookup | `POST clado.mpp.paywithlocus.com/clado/search` | `query="${name} ${company}"`, `companies=["${company}"]`, `limit=5`, `offset=0`, `advanced_filtering=true` | $0.055650 | $0.070 |

The current network transactability signal reported three captured paid
requests, all answered with 2xx, and therefore labeled the sample low-confidence
rather than high-confidence. Treat that as limited evidence, not a guarantee.

## Request schema and pricing

The gateway's public OpenAPI describes:

| Field | Type | OpenAPI note | Manifest source |
|---|---|---|---|
| `query` | string | Required for a new search | `${name} ${company}` |
| `companies` | array of strings | Filter by company names | fixed one-element array containing `${company}` |
| `limit` | number | Maximum results; provider default 30, maximum 100 | fixed numeric literal `5` |
| `offset` | number | Results to skip; default 0 | fixed numeric literal `0` |
| `advanced_filtering` | boolean | Advanced filtering; default true | fixed boolean `true` |

The gateway marks the service as dynamically priced per result. A free probe of
the old query-only body inherited the 30-result default and quoted `$0.318150`.
Adding the explicit five-result limit and company filter quoted `$0.055650`,
reducing both data scope and expected cost. The numeric and boolean fields are
fixed literals because `${param}` substitution produces strings.

The OpenAPI documents a successful response but does not publish a detailed
response-object schema. Do not promise a particular field until a paid smoke
test confirms it. Report only fields actually returned by the live response.

## Scope and interpretation

- This is a synchronous candidate search: one request returns up to five people;
  there is no polling or pagination in the skill.
- `name` and `company` must identify one public professional target. The company
  filter is not optional because it bounds false matches and unnecessary data.
- The endpoint may return several candidates. The agent performs transparent
  disambiguation; the manifest does not guarantee an exact person match.
- This recipe does not invoke the provider's dedicated contact-enrichment
  operation and must not advertise private email or phone retrieval.
- A paid application error may still charge. Check payment history and obtain a
  fresh quote and approval before retrying.

## Free verification

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/person-lookup \
  --name "Research Lead" \
  --company "Example" \
  --live-probe
```

Expected gate: one reachable `routed-mpp` challenge at or below the manifest
cap. Re-probe immediately before payment because the live challenge is the
authoritative price and availability signal.
