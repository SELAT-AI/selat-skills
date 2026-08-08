# Enriching endpoint schemas

Pin each endpoint's **request schema** before you write `body` / `${param}` in the
manifest. The catalogue usually ships an endpoint's URL, method, and price but **no
parameter schema** — so authors guess, and a guess costs real money.

## Why this matters (read first)

- **The SELAT Router settles the payment *before* the upstream validates the body.**
  A wrong param name, a missing required field, or a bad type returns a `4xx` from the
  upstream — **after** the money has moved. There is no chargeback rail.
- **`selat skill verify` / `--probe-only` check *payability*, not *correctness*.** The
  402 probe confirms the endpoint is reachable and priced; it never validates your
  body. A step can pass free-verify and still `400` on every paid call.

So: resolve the exact request shape from a **free** source first, then confirm with a
single paid `verify --pay`.

## Free schema sources (in order of preference)

1. **The gateway's OpenAPI.** Many x402 gateways serve one at a predictable path —
   try `GET <serviceUrl-host>/openapi.json` (also `/openapi`, `/docs`, `/swagger.json`).
   It gives paths, methods, required flags, types, and enums.
   ```bash
   curl -s https://<host>/openapi.json | jq '.paths | keys'
   ```
2. **The 402 challenge's self-describing schema.** x402 v2 challenges often carry the
   expected body under `extensions.bazaar.info.input.body` in the base64
   `payment-required` header — a free, per-endpoint schema straight from the server.
   ```bash
   curl -s -D - -o /dev/null -X POST https://<host>/<path> \
     -H 'content-type: application/json' -d '{}' \
     | awk 'tolower($1)=="payment-required:"{print $2}' \
     | base64 -d | jq '.accepts[0].scheme, .extensions.bazaar.info.input.body'
   ```
3. **The upstream provider's public API docs** — when the gateway is a thin passthrough
   (e.g. a Perplexity / RentCast proxy), the underlying provider's reference is
   authoritative for field semantics.

## Corroborate against the LIVE API — the spec can be wrong

The OpenAPI is a starting point, **not** the source of truth. Observed drift:

- **Wrong param name.** A twitter proxy's OpenAPI documented `tweet_id` for
  `/tweet/replies` and `/tweet/retweeters`, but the live API required **`tweetId`**
  (camelCase) and returned `400 {"detail":"tweetId is required"}`. (Its `/tweets`
  endpoint really did use `tweet_ids` — three id conventions on one API.)
- **Under-declared required fields.** A Perplexity `/v1/agent` OpenAPI marked only
  `input` required, but the live endpoint rejected any body without **one of**
  `model` / `models` / `preset`: `400 "validation failed: model, models, or preset is
  required"`.

Always confirm the pinned schema settles `200` with a real `selat skill verify --pay`
before submitting. The live 402 / a paid call wins over any spec.

## Record it in `references/endpoints.md`

For every endpoint, capture: **param name · required · type · enum/format · the
manifest `${param}` that fills it**. Map each `${param}` to the *real* API param name
(e.g. `${handle}` → `userName=`). Note anything that would 4xx: required enums,
comma-separated vs singular fields, date formats, URL-encoding.

## Manifest constraints the schema must respect

- **`${param}` substitutes as a string — no type coercion.** A numeric or array field
  wired as `"max_results": "${n}"` sends `"8"` (a string) and can 4xx. Keep only
  string-typed fields in the manifest `body`; document integer/array fields for a
  hand-built `selat-pay` call rather than wiring them through `${…}`.
- **The runner is linear — no step chaining, no polling.** Async (POST → poll) and
  paginated (cursor) flows can't live in the manifest; document them in `SKILL.md`
  **Workflow** as an agent procedure, with the exact bodies here in `endpoints.md`.
- **POST/PUT params go in `body`; GET params in the query string.**

## One caveat worth flagging in the skill

Some 402 challenges embed the whole schema in the `payment-required` **HTTP header**.
If that header exceeds ~16 KB it overflows Node's default `--max-http-header-size` and
`fetch` throws `UND_ERR_HEADERS_OVERFLOW` (seen on a Perplexity `/v1/sonar` at ~17 KB).
If an endpoint's probe fails with a fetch/overflow error, this — not the rail — is the
likely cause; note it and prefer a lighter endpoint until the client/router raise the
limit.
