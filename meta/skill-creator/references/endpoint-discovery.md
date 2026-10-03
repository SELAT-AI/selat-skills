# Finding payable endpoints in the federated catalogue

Discover endpoints with **`selat search`** — the same live, hosted federated
catalogue that `selat run` ranks at payment time, so the endpoints you wire are
the ones agents are actually routed to. It is free: no wallet, no spend.

```bash
# ranked shortlist for a capability
selat search "enrich a person by email" --top 10

# machine-readable: endpoint URL, method, price, payment schemes per result
selat search "enrich a person by email" --top 10 --json

# why each match is (or isn't) payable right now
selat search "enrich a person by email" --explain

# re-fetch the catalogue first if you suspect drift
selat search "enrich a person by email" --refresh
```

Narrow to a known kind of service with `--capability <name>` (e.g.
`--capability web.search`). Don't wire endpoints from a stale local catalogue
dump or a cached registry file — the hosted catalogue is the one `selat run`
uses.

## The `serviceUrl` rule (read this twice)

Every catalogue record carries **two** URLs. In `selat search --json` output:

| Field | Example | Use it for |
|---|---|---|
| `service.url` (provider) | `https://api.fiber.ai/` | documentation only — **NOT payable** |
| `endpoint.url` (payable) | `https://mpp.orthogonal.com/fiber/v1/email-to-person/single` | the `url` your manifest step calls |

The x402/MPP **402 challenge is served only at the payable host** (the
catalogue's `serviceUrl`; `endpoint.url` is `serviceUrl` + path). For
Orthogonal-routed merchants it is `mpp.orthogonal.com/<merchant>`; for Locus,
`<merchant>.mpp.paywithlocus.com`; for Tempo, `<merchant>.mpp.tempo.xyz`. A direct
merchant's `serviceUrl` equals its own host.

**Manifest `url` = `endpoint.url`**, with `${param}` placeholders added to the
query string (GET) — POST params go in `body`. Example:

```
endpoint.url  https://mpp.orthogonal.com/tomba/v1/enrich
manifest url  https://mpp.orthogonal.com/tomba/v1/enrich?email=${email}
```

Wiring the provider host (`api.tomba.io/v1/enrich`) returns "no x402/MPP
challenge" and a `down` skill. This is the single most common authoring mistake.

## Endpoints a skill step can't use

- **Apify Actors** (`payments[].scheme` = `prepaid-token`, URL on
  `api.apify.com`). They are paid by a prepaid token bought once and drawn down,
  not per call at the Actor URL, so a manifest step that `selat-pay`s the Actor
  URL won't work. `selat skill verify --pay` skips them. Use a per-call endpoint
  instead, or leave the capability to `selat run`.
- **Endpoints with no price in the catalogue** (`priceUnknown: true`) — wire
  them only after a probe shows a live price you can cap.

## Confirm an endpoint is live before you wire it

The catalogue can list endpoints the gateway no longer serves (drift). Once the
skill exists, `selat skill verify ./skills/<name>` runs this probe across every
step and gates submission. While discovering, probe a single candidate
directly — free, no wallet:

```bash
# GET endpoint: params in the query
selat-pay GET "https://mpp.orthogonal.com/tomba/v1/enrich?email=test@stripe.com" \
  --chain base --probe-only

# POST endpoint: params in the BODY (query params often yield no challenge)
selat-pay POST "https://mpp.orthogonal.com/nyne/company/search" \
  --body '{"query":"Stripe"}' --chain base --probe-only
```

`--chain base` is just the flag the probe requires — probing is free and
chain-independent and never settles. A paid run resolves the settlement chain at
runtime from the funded Gateway balance, so it's not a manifest field.

A served endpoint prints `detected ... mpp=yes`, `mode=routed-mpp`, and a
`price=$X`. If it returns "no challenge" even when called correctly, the gateway
isn't serving it — don't include it.
