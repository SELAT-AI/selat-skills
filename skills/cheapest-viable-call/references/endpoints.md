# cheapest-viable-call — endpoints

This skill calls no fixed catalogue endpoint of its own. It shells out to two
existing free `selat` subcommands for whatever intent the caller provides,
and joins their output. Both are free discovery/probe calls — neither settles
a payment, regardless of the intent.

| Command | What it returns | Cost |
|---|---|---|
| `selat search "<intent>" --top N --json` | Catalogue-advertised price (`payments[].amountUsd` / `minAmountUsd`) and declared `inputSchema` per candidate | Free |
| `selat skill compare "<intent>" --limit N --json` | Live, non-settling 402 probe per candidate: `reachable`, router-quoted `livePriceUsd`, and (on failure) the exact `error` string | Free |

`manifest.json`'s one declared step points at
`https://catalog.selat.ai/api/v1/federated` — the machine-readable federated
catalog endpoint `selat search` itself queries under the hood (per SELAT's own
`llms.txt`: "The full merged catalog is also machine-readable server-side at
`https://catalog.selat.ai/api/v1/federated`"). That step is declarative only,
to satisfy the repo validator's non-empty-`steps[]` requirement — it is not
what this skill's script actually calls at runtime (the script calls the
`selat` CLI, not this URL directly). See the `rail: none` gotcha in
`SKILL.md` for why.

## Measured numbers behind this skill (source: a live session against the
production catalogue and router, 2026-08-19)

- **Payability:** 5 of 15 top-ranked results across 3 unrelated search
  queries actually returned a real 402 challenge (33%).
- **Router markup:** exactly +5.00% over the live upstream `accepts[]` price,
  measured identically across weather, crypto-price, funding-rate, and
  image-generation endpoints.
- **Catalogue accuracy:** catalogue-advertised price vs. live router-quoted
  price diverged from +5% (agreement) up to **+320%** on one funding-rate
  endpoint and **+110%** on another, in the same session.
- **Schema documentation:** a real paid call to a weather endpoint with a
  catalogue-declared `required: null` parameter, and no schema in its 402
  challenge either, returned HTTP 400 (`Provide 'city' or both 'lat' and
  'lon' parameters`) **after** a real $0.0105 USDC charge had already
  settled — the exact failure mode `schema.level: "schema-unknown"` exists to
  warn about before it happens again.
