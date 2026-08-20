---
name: cheapest-viable-call
description: Use this skill before paying for any capability from the federated catalogue — when the user asks "what's the cheapest way to get X", "find a payable endpoint for X", "which of these actually work before I pay", or before any selat run/selat-pay call where you have not already probed the target for free. Also use when a prior paid call failed on a missing parameter or wrong price, to shortlist alternatives before retrying. Not for actually calling or paying for an endpoint — it only shortlists; pass the winner to selat run or selat-pay yourself.
license: Apache-2.0
compatibility: Requires the selat CLI on PATH (or $SELAT_RUNNER) and Node.js 18+. No wallet, no funded Gateway balance, and no SELAT_ROUTER_URL override needed — every call this skill makes is free discovery or a non-settling probe.
metadata:
  author: TomAkaninyene
  version: "1.0"
  rail: none
  kind: script
---

# cheapest-viable-call

## When To Use

Before any paid call to a capability discovered through `selat search` or
`selat run`. The federated catalogue lists endpoints that may be unreachable,
mispriced, or undocumented — paying blind to find out is real, non-refundable
spend. Use this skill first to get a shortlist of endpoints that are actually
payable right now, at their real price, with a warning on any endpoint whose
required parameters aren't documented. Also reach for it after a paid call
fails on a missing/wrong parameter, to find an alternative before retrying —
retrying blind on the same undocumented endpoint just charges again.

Not for making the call itself — the winning candidate still goes through
`selat run "<intent>"` or a manifest-driven skill; this only narrows the field
for free.

## Workflow

1. Run: `node scripts/cheapest-viable-call.mjs "<intent>" --limit 8 --json`
2. The script runs two existing free `selat` commands for the same intent and
   joins their output — it does not implement its own discovery or probing:
   - `selat search "<intent>" --top 8 --json` — catalogue-advertised price and
     declared input schema per candidate.
   - `selat skill compare "<intent>" --limit 8 --json` — a live, non-settling
     402 probe per candidate: reachable or not, router-quoted live price, and
     (when unreachable) the exact failure signature.
3. Candidates that fail the probe are dropped into `discarded[]` with their
   failure signature verbatim — don't retry those without a reason to believe
   the underlying listing changed.
4. Surviving candidates are ranked by **live router-quoted price**, ascending
   — not the catalogue price, which this skill's own measurements show can be
   wrong by more than 3x (see Gotchas).
5. **Tell the user** the top 1-2 candidates in plain language before calling
   anything: name, live price, and — if `schema.level` is `schema-unknown` —
   an explicit warning that the call may be charged and still fail because no
   required-parameter list is documented for it.
6. Hand the chosen candidate's endpoint to `selat run "<intent>"` (or a
   manifest step, if wiring a multi-step skill) — this skill does not call or
   pay for anything itself.

## Available Scripts

- `scripts/cheapest-viable-call.mjs "<intent>" [--limit N] [--json] [--dry-run]`
  — the only script. Non-interactive, `--help` for usage, `--dry-run` prints
  the two `selat` commands it would run without running them. Exit codes: `0`
  = at least one payable survivor, `1` = ran cleanly with zero survivors, `2`
  = a `selat` subcommand produced no usable JSON.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `intent` | yes | — | The capability to search for, e.g. `"real-time crypto funding rates"` |
| `limit` | no | `8` | Candidates to shortlist and probe |

Output (`--json`): `{ intent, checkedAt, candidatesProbed, payableCount,
discardedCount, survivors[], discarded[] }`. Each survivor: `service`,
`endpoint`, `method`, `livePriceUsd`, `catalogueUsd`, `divergencePct`,
`divergenceFlag` (true at ≥15% divergence), `priceNote`, `schema` (`level`:
`declared` | `no-params-declared` | `schema-unknown`, plus `note`). Each
discarded entry: `service`, `endpoint`, `failureSignature` (verbatim probe
error). Without `--json`, the same data prints as a human-readable list to
stdout; progress goes to stderr.

## Gotchas

Every number below is a live measurement from a real session against the
production federated catalogue and SELAT Router, not a guess:

- **Most top-ranked candidates aren't payable.** A 15-endpoint sweep (5
  results each from 3 unrelated search queries) found only **5/15 (33%)**
  actually returned a real 402 challenge. Failures cluster into a handful of
  signatures this skill surfaces verbatim rather than summarizing away:
  `no x402 or MPP challenge detected`, a router 502 wrapping
  `BAD URL with invalid x402 header: resource.tags: Array must contain at
  most 5 element(s)` (a malformed catalogue listing, not a router outage
  despite the 502), a router 502 wrapping `expected upstream 402 challenge,
  got 400`, and plain `fetch failed`.
- **The router adds a consistent premium over the live upstream accept** —
  measured at **exactly +5.00%** across every endpoint checked (weather,
  crypto-price, funding-rate, and image-generation endpoints all showed the
  identical figure). This is not what this skill flags as divergence.
- **The catalogue-advertised price is a separate, much less reliable number.**
  Measured divergences between the catalogue's advertised price and the live
  router-quoted price: **+5% to +320%** across endpoints in the same
  session, with one case at **+110%** and another at **+320%** (catalogue
  said $0.001/call; the endpoint actually charges $0.0042). `catalogueUsd` in
  this skill's output is exactly what the catalogue advertises — trust
  `livePriceUsd`, not it, and treat any `divergenceFlag: true` as reason to
  re-probe manually before paying at volume.
- **402 challenges and catalogue listings frequently carry no parameter
  documentation at all.** In one measured case, a catalogue entry declared
  `required: null` for its one query parameter and the 402 challenge itself
  carried no schema information beyond router settlement metadata — paying
  it blind returned an HTTP 400 (`Provide 'city' or both 'lat' and 'lon'
  parameters`) **after** a real $0.0105 charge had already settled. This
  skill's `schema.level: "schema-unknown"` flag exists specifically to warn
  before that happens — it cannot make the missing schema fully knowable
  (that upstream fact doesn't exist), only surface that it's missing.
- **`rail: none` / `kind: script` in this skill's frontmatter is a deliberate
  deviation from `references/manifest-reference.md`**, which only documents
  `direct | routed | mixed` for rail and `single | multi` for kind — because
  this skill settles no payment and its manifest step exists only to satisfy
  the repo validator's non-empty-`steps[]` requirement (see `manifest.json`;
  the declared step is a free, fixed catalogue read, not this skill's actual
  runtime logic, which lives entirely in `scripts/`). This mirrors the
  reviewer-endorsed fix on PR #34 (`api-failure-monitor`) — see this skill's
  PR description for the explicit differentiation from that skill.
- This skill never settles a payment. If a probe's `reachable: false` result
  looks wrong for an endpoint you know is up, re-run — `selat skill compare`
  probes are live network calls and can hit transient timeouts.

## Validation

Both underlying commands are free — no wallet, no funded balance, no
`SELAT_ROUTER_URL` override needed:

```bash
node scripts/cheapest-viable-call.mjs --help
node scripts/cheapest-viable-call.mjs "crypto funding rate open interest" --limit 5 --json
```

A successful run prints `payableCount` ≥ 0 with no thrown error; exit code
`0` when at least one candidate survives, `1` when none do (still a valid,
non-error result), `2` only if a `selat` subcommand itself failed to produce
parseable JSON.

## References

- `scripts/cheapest-viable-call.mjs` — the only executable logic; wraps
  `selat search --json` and `selat skill compare --json`, adds nothing that
  duplicates either.
- `references/endpoints.md` — the two `selat` subcommands this skill calls,
  and the measured numbers behind the Gotchas above.
- `manifest.json` — declarative-only for this skill; see the `rail: none`
  gotcha above for why.
- `../../references/agent-skill-authoring-sop.md` — authoring standard.
