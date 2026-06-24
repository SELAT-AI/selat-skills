# Finding payable endpoints in the federated catalogue

The federated catalogue merges three sources — **Circle**, **Agentic Market**,
and **MPP** (which includes the Orthogonal- and Locus-routed merchants). Discover
with the runtime-integration scripts:

```bash
# all services, or filter
node discover_federated_catalog.mjs --search enrich
node discover_federated_catalog.mjs --source mpp --json
node discover_federated_catalog.mjs --payable-now --max-price 0.05
```

For raw per-endpoint detail (method, path, price, payment), inspect the MPP
catalogue cache (`mpp-catalog.json`) — each service lists `endpoints[]` with a
`payment` block.

## The `serviceUrl` rule (read this twice)

Every catalogue record carries **two** URLs:

| Field | Example | Use it for |
|---|---|---|
| `url` (provider) | `https://api.tomba.io` | documentation only — **NOT payable** |
| `serviceUrl` (gateway) | `https://mpp.orthogonal.com/tomba` | the endpoint your manifest calls |

The x402/MPP **402 challenge is served only at the `serviceUrl`**. For
Orthogonal-routed merchants it is `mpp.orthogonal.com/<merchant>`; for Locus,
`<merchant>.mpp.paywithlocus.com`; for Tempo, `<merchant>.mpp.tempo.xyz`. A direct
merchant's `serviceUrl` equals its own host.

**Manifest `url` = `serviceUrl` + the endpoint path.** Example:

```
serviceUrl   https://mpp.orthogonal.com/tomba
path         /v1/enrich
manifest url https://mpp.orthogonal.com/tomba/v1/enrich?email=${email}
```

Wiring the provider host (`api.tomba.io/v1/enrich`) returns "no x402/MPP
challenge" and a `down` skill. This is the single most common authoring mistake.

## Confirm an endpoint is live before you wire it

The catalogue can list endpoints the gateway no longer serves (drift). Probe each
candidate — free, no wallet:

```bash
# GET endpoint: params in the query
selat-pay GET "https://mpp.orthogonal.com/tomba/v1/enrich?email=test@stripe.com" \
  --chain base --probe-only

# POST endpoint: params in the BODY (query params often yield no challenge)
selat-pay POST "https://mpp.orthogonal.com/nyne/company/search" \
  --body '{"query":"Stripe"}' --chain base --probe-only
```

A served endpoint prints `detected ... mpp=yes`, `mode=routed-mpp`, and a
`price=$X`. If it returns "no challenge" even when called correctly, the gateway
isn't serving it — don't include it.
