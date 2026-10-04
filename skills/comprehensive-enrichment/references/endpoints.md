# Endpoints — comprehensive-enrichment

Use only these endpoint families for `comprehensive-enrichment`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

Dead Clado `/clado/search` was removed (no 402; re-checked 2026-10-04). Company
overview uses Orthogonal Company Enrich GET-by-domain (Abstract is dead). Clado
`/clado/contacts` is kept as a base lookup.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Person enrichment | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 | $0.06 |
| 2 — Email enrich | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-enrichment` | MPP on Tempo | $0.01365 | $0.02 |
| 3 — Find work email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 | $0.02 |
| 4 — Verify supplied email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 | $0.0125 |
| 5 — Contacts lookup (LinkedIn URL) | POST | `https://clado.mpp.paywithlocus.com/clado/contacts` | MPP on Tempo | $0.04515 | $0.06 |
| 6 — Person research | POST | `https://exa.mpp.tempo.xyz/search` | MPP on Tempo | $0.00525 | $0.0075 |
| 7 — Company overview | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 | $0.02 |
| 8 — Company emails (10) | POST | `https://hunter.mpp.paywithlocus.com/hunter/domain-search` | MPP on Tempo | $0.01365 | $0.02 |
| 9 — Funding + investors | POST | `https://diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance` | MPP on Tempo | $0.03675 | $0.05 |
| 10 — Pricing / features | POST | `https://firecrawl.mpp.tempo.xyz/v1/extract` | MPP on Tempo | $0.00525 | $0.0075 |
| 11 — Competitors | POST | `https://exa.mpp.tempo.xyz/findSimilar` | MPP on Tempo | $0.00525 | $0.0075 |
| 12 — Company research | POST | `https://exa.mpp.tempo.xyz/search` | MPP on Tempo | $0.00525 | $0.0075 |

This is a fixed 12-call manifest; `selat skill run` executes every step. The step
table matches `manifest.json` exactly. Live sum ≈ $0.205 (free probe
2026-10-04, every step `routed-mpp`); sum of per-step caps $0.2925. The
top-level `maxAmount` ($0.06) is only a per-step fallback, not a run budget.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Apollo, Hunter, Clado, and Diffbot KG via Locus (`*.mpp.paywithlocus.com`). Exa (`exa.mpp.tempo.xyz`) and Firecrawl (`firecrawl.mpp.tempo.xyz`) are MPP on Tempo but not Locus. Orthogonal Company Enrich via `mpp.orthogonal.com`.

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.0399` per call (`routed-mpp`, 2026-10-04; Locus range
`$0.038–$0.318`, the upper end only with `reveal_phone_number`). **POST with a
JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person enrichment | `/apollo/people-enrichment` | `first_name`, `last_name`, `organization_name`, `linkedin_url`; `reveal_personal_emails: false`, `reveal_phone_number: false` (fixed literals) |

```json
{ "first_name": "Patrick", "last_name": "Collison", "organization_name": "Stripe", "linkedin_url": "https://www.linkedin.com/in/patrickcollison", "reveal_personal_emails": false, "reveal_phone_number": false }
```

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`, 2026-10-04): email-enrichment / email-finder /
domain-search `$0.01365`, email-verifier `$0.0084`. All endpoints are **POST
with a JSON body**. Domain-search is dynamically priced by `limit` (`limit: 100`
quoted `$0.10815`), so `limit: 10` is a fixed numeric literal.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Email enrich | `/hunter/email-enrichment` | `email` (string, required) |
| Find work email | `/hunter/email-finder` | `domain`, `first_name`, `last_name` |
| Verify supplied email | `/hunter/email-verifier` | `email` (string, required) |
| Company emails | `/hunter/domain-search` | `domain` (string, required), `limit` (number, fixed `10`) |

```json
{ "domain": "stripe.com", "limit": 10 }
```


**Paid smoke (2026-10-04):** paid `email-finder` and `domain-search` calls
through the router both returned 200 with real data ($0.01365 each), so the
transactability index's 0% readings (last 502s, Aug 12–14) were stale, not
current. On an accept-all domain, the finder returned `source_type: "generated"`
with `verification.status: "valid"`: a pattern guess, not a published address.
`email-enrichment` has not been re-tested since its August 502s.

## Clado contacts — `MPP on Tempo`

serviceUrl: `https://clado.mpp.paywithlocus.com`

Live-probed price: `$0.04515` (`routed-mpp`, 2026-10-04) for a `linkedin_url`-only
body. **POST with a JSON body**. The paid `phone_enrichment` flag quotes
`$0.10815` and both flags `$0.15015`; neither is sent, so report phone/email only
if the response contains it. Dead Clado `/search`, `/linkedin-profile`, and
`/scrape` are not used.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Contacts lookup | `/clado/contacts` | `linkedin_url` (string, required) |

```json
{ "linkedin_url": "https://www.linkedin.com/in/patrickcollison" }
```

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` (`routed-mpp`, 2026-10-04). Domain lookup is
**GET with a query-string `domain`**. Replaces the dead Abstract Company
Enrichment `POST /abstract-company-enrichment/lookup`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Company overview | `/companies/enrich` | `domain` (string, required) — bare host, no protocol or path |

```text
https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com
```

## Exa MPP — `MPP on Tempo`

serviceUrl: `https://exa.mpp.tempo.xyz`

Live-probed price: `$0.00525` per call (`routed-mpp`, 2026-10-04). All endpoints
are **POST with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person research | `/search` | `query` = `${firstName} ${lastName} ${company} recent news interviews talks` |
| Competitors | `/findSimilar` | `url` = `https://${domain}`, `numResults` (fixed `10`), `contents.text` (fixed `true`) |
| Company research | `/search` | `query` = `${company} recent news funding announcements partnerships press releases` |

```json
{ "url": "https://stripe.com", "numResults": 10, "contents": { "text": true } }
```

## Diffbot KG — `MPP on Tempo`

serviceUrl: `https://diffbot-kg.mpp.paywithlocus.com`

Live-probed price: `$0.03675` per call (`routed-mpp`, 2026-10-04; Locus lists
`$0.03`, `$0.12` with `refresh`). **POST with a JSON body**. One Organization
`enhance` call covers funding rounds and investors.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Funding + investors | `/diffbot-kg/enhance` | `type` (`Organization`), `name` (string array), `url` (string array), `refresh` (fixed `false`), `size` (fixed `1`) |

```json
{ "type": "Organization", "name": ["Stripe"], "url": ["https://stripe.com"], "refresh": false, "size": 1 }
```

## Firecrawl — `MPP on Tempo`

serviceUrl: `https://firecrawl.mpp.tempo.xyz`

Live-probed price: `$0.00525` per call (`routed-mpp`, 2026-10-04). **POST with a
JSON body**. Always called: `pricingUrl` must be a non-empty public HTTPS page
(the 402 quote does not check the URL, so an empty URL is paid and then errors).

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Pricing / features | `/v1/extract` | `urls` (string array) = `["${pricingUrl}"]`, `prompt` (string) |

```json
{ "urls": ["https://stripe.com/pricing"], "prompt": "Extract all products, pricing tiers, and features" }
```

## Free verification

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/comprehensive-enrichment \
  --email <known-work-email> --firstName <first> --lastName <last> \
  --company "<company>" --domain <bare-domain> \
  --linkedinUrl <person-linkedin-url> --pricingUrl <public-https-url> \
  --live-probe
```
