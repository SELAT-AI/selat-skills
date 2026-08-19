# Endpoints — domain-trust-check

Domain trust and safety reconnaissance over a **single rail** — x402 through the
SELAT Router — paid per call via selat-pay (USDC via Circle Gateway), no API
keys. Answers one question about ONE domain: is it safe to trust or transact
with?

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | Registration age, DNS, email auth, TLS | GET | `https://api.x402node.dev/domain/check?domain=${domain}` | x402 via SELAT Router | $0.02625 |
| 2 | Live reachability + redirect chain | GET | `https://api.x402node.dev/url/check-status?url=${site}` | x402 via SELAT Router | $0.00399 |
| 3 | HTTP security headers | GET | `https://api.x402node.dev/web/headers?url=${site}` | x402 via SELAT Router | $0.00840 |
| 4 | Wayback first-capture age cross-check | GET | `https://api.x402node.dev/web/archive?url=${site}` | x402 via SELAT Router | $0.00525 |

Prices probe-verified 2026-08-19 against each endpoint's live 402. Full-run cap
(`maxAmount`): **$0.12**; per-step caps $0.05 / $0.01 / $0.02 / $0.02. Live
total ≈ **$0.04389**.

## Why these four

Each step contributes a dimension the others cannot:

- **`/domain/check`** is the provider's fused report — RDAP registration and
  expiry, DNS records, SPF/DKIM/DMARC, and TLS validity in one call. It is
  deliberately used *instead of* the provider's separate `/domain/whois`,
  `/domain/dns`, `/domain/email-security` and `/domain/ssl` endpoints, which
  would cost more and return overlapping data.
- **`/url/check-status`** proves the host actually answers right now and shows
  the redirect chain — registry data cannot tell you a domain parks or bounces
  somewhere unrelated.
- **`/web/headers`** reads transport posture (HSTS, CSP, X-Frame-Options,
  X-Content-Type-Options) that no registry record carries.
- **`/web/archive`** dates the site from the Internet Archive, giving an age
  signal **independent of the registrar**. A WHOIS record that claims age while
  Wayback shows no history — or a first capture long after registration — is the
  classic signature of a lapsed domain re-registered by someone new. That
  cross-check is the reason this is a composed skill rather than a single call.

## Provider and schema

All four endpoints are first-party to **`api.x402node.dev`** (contact
`support@x402node.dev`), which publishes a free OpenAPI 3.1 document at
`https://api.x402node.dev/openapi.json` and an x402 resource list at
`/.well-known/x402`. Schemas below were pinned from that document and confirmed
against the live 402.

| Endpoint | Query params | Type |
|---|---|---|
| `/domain/check` | `domain` | string |
| `/url/check-status` | `url` | string |
| `/web/headers` | `url` | string |
| `/web/archive` | `url` | string |

All params are plain strings, so `${param}` substitution is safe — there are no
integer or array fields that would need coercion.

## Live probes (free; no wallet)

```bash
# 1. fused registration / DNS / email-auth / TLS report
selat-pay GET "https://api.x402node.dev/domain/check?domain=example.com" \
  --chain base --probe-only

# 2. reachability + redirect chain
selat-pay GET "https://api.x402node.dev/url/check-status?url=https://example.com" \
  --chain base --probe-only

# 3. HTTP security headers
selat-pay GET "https://api.x402node.dev/web/headers?url=https://example.com" \
  --chain base --probe-only

# 4. Wayback first capture
selat-pay GET "https://api.x402node.dev/web/archive?url=https://example.com" \
  --chain base --probe-only
```

A served endpoint prints `detected ... x402=yes`, `mode=routed-x402`, and a
`price=$X on eip155:8453`.

`--chain base` is only the flag the probe requires — probing reads a free,
chain-independent quote and never settles. A paid run resolves the settlement
chain at runtime from the funded Gateway balance, so the manifest declares none.

## Alternatives considered

The catalogue carries several other live DNS/WHOIS/SSL providers —
`api.fetchx402.com` (all three at $0.00525), `netintel.dev` (`/dns/lookup`
$0.0021), and `jmt-x402-proxy…workers.dev` (`/v2/api/whois` $0.0021). They were
rejected only because splitting the fused report across hosts costs more for
overlapping data; any of them is a reasonable substitute if `api.x402node.dev`
stops serving a step.

Two catalogue entries that looked on-target were **dead at probe time** and are
deliberately excluded: `dns.use.x402atlas.com/rdap` and `agent402.tools/api/dns`
both returned `502` instead of a 402 challenge on 2026-08-19.
