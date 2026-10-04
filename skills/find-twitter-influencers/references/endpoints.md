# Endpoints — find-twitter-influencers

Use only these endpoint families for `find-twitter-influencers`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Brand context by name | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-search` | MPP on Tempo | $0.0399 | $0.05 |
| 2 — Brand context by domain | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 | $0.02 |
| 3 — Curated web roundups | POST | `https://exa.mpp.tempo.xyz/search` | MPP on Tempo | $0.00525 | $0.0075 |
| 4 — Twitter account search | GET | `https://catalog.selat.ai/twitter/user/search?query=${userQuery}` | x402 via Circle Gateway | $0.001 | $0.0015 |
| 5 — Current Twitter topic search | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${tweetQuery}&queryType=Latest` | x402 via Circle Gateway | $0.001 | $0.0015 |

This is a fixed 5-call, read-only manifest. The step table matches
`manifest.json` exactly. `selat skill run` executes all five steps every time;
none is conditional. There is no contact-data purchase.

Live-probed 2026-10-04 (free, `--probe-only --live-probe`): expected total
**$0.060262** per run. Per-step caps are $0.05 / $0.02 / $0.0075 / $0.0015 /
$0.0015 (sum **$0.0805**). The manifest's top-level `maxAmount` (`$0.02`) is
only a per-step fallback for a step without its own cap — it is not a full-run
cap. Arm a session budget for the cumulative limit.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Apollo via Locus (`apollo.mpp.paywithlocus.com`), Orthogonal Company Enrich (`mpp.orthogonal.com`), and Exa (`exa.mpp.tempo.xyz`, MPP on Tempo but not Locus). Verify prints `routed-mpp`.
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`). Verify prints `routed-x402`. The buyer pays from the funded Gateway chain; this is not a pay-chain claim.

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.0399` per call (`routed-mpp`, 2026-10-04). **POST with a
JSON body.** Per-step cap `$0.05`. The skill bounds the first page to five
records. Match the returned domain to the user-supplied `domain`; a similar
company name is not enough.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Brand context by name | `/apollo/org-search` | `q_organization_name` (string, required), `per_page` (integer, fixed 5), `page` (integer, fixed 1) |

```json
{ "q_organization_name": "Acme Pay", "per_page": 5, "page": 1 }
```

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` per call (`routed-mpp`, 2026-10-04). **GET with a
query-string `domain`.** Per-step cap `$0.02`. Returns industry, employee count,
revenue, location, funding, technologies, and social links when found; 404 if
the domain is unknown. Replaces the dead Abstract Company Enrichment route.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Brand context by domain | `/companies/enrich` | `domain` (string, required) — bare host, no protocol or path |

```text
https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=acme.com
```

## Exa MPP — `MPP on Tempo`

serviceUrl: `https://exa.mpp.tempo.xyz`

Live-probed price: `$0.00525` per call (`routed-mpp`, 2026-10-04). **POST with a
JSON body.** Per-step cap `$0.0075`. x.com / twitter.com profiles are not
reliably in Exa's index — search for independent roundup pages. A handle parsed
from a roundup is an unverified lead until a Twitter result corroborates it.
The former `findSimilar` step was removed (deprecated upstream).

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Curated web roundups | `/search` | `query` (string, required), `numResults` (integer, fixed 10), `contents.text.maxCharacters` (integer, fixed 5000) |

```json
{ "query": "best fintech payments Twitter X creators to follow", "numResults": 10, "contents": { "text": { "maxCharacters": 5000 } } }
```

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`, 2026-10-04). **GET with
query-string params.** Per-step cap `$0.0015` each.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Twitter account search | `/twitter/user/search` | `query` (string, required — concise keywords), optional `cursor` (not used) |
| Current Twitter topic search | `/twitter/tweet/advanced_search` | `query` (string, required — supports X operators such as `lang:en`, `min_faves:`, `since:`, hashtags, `from:`), `queryType` (fixed `Latest`), optional `cursor` (not used) |

```text
https://catalog.selat.ai/twitter/user/search?query=fintech%20payments
https://catalog.selat.ai/twitter/tweet/advanced_search?query=%28fintech%20OR%20payments%29%20min_faves%3A50%20lang%3Aen&queryType=Latest
```

`queryType=Latest` emphasizes current activity and can underrepresent
established creators who have not posted recently. Normalize returned handles
without `@`; do not infer private or sensitive characteristics from profile
text.

## Removed calls

- **Abstract Company Enrichment:** the host stopped serving a payment challenge; replaced by Orthogonal Company Enrich.
- **Exa findSimilar:** deprecated upstream.
- **Hunter email-finder and Clado contacts:** removed so the discovery run never buys email/phone data. Contact enrichment for a selected candidate is a separately quoted, separately approved follow-up.
- **Single-handle profile and last-tweets reads:** replaced with multi-candidate user and topic search. Use `twitter-research` for a selected-candidate deep dive.

## Free live probes

These commands read payment challenges and never sign or settle:

```bash
selat skill verify ./skills/find-twitter-influencers \
  --company "Acme Pay" \
  --domain acme.com \
  --webQuery "best fintech payments Twitter X creators to follow" \
  --userQuery "fintech payments" \
  --tweetQuery "(fintech OR payments) min_faves:50 lang:en" \
  --live-probe

selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/org-search" \
  --body '{"q_organization_name":"Acme Pay","per_page":5,"page":1}' \
  --chain base --max-amount 0.05 --probe-only --live-probe

selat-pay GET \
  "https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=acme.com" \
  --chain base --max-amount 0.02 --probe-only --live-probe

selat-pay POST "https://exa.mpp.tempo.xyz/search" \
  --body '{"query":"best fintech payments Twitter X creators to follow","numResults":10,"contents":{"text":{"maxCharacters":5000}}}' \
  --chain base --max-amount 0.0075 --probe-only --live-probe

selat-pay GET \
  "https://catalog.selat.ai/twitter/user/search?query=fintech%20payments" \
  --chain base --max-amount 0.0015 --probe-only --live-probe

selat-pay GET \
  "https://catalog.selat.ai/twitter/tweet/advanced_search?query=%28fintech%20OR%20payments%29%20min_faves%3A50%20lang%3Aen&queryType=Latest" \
  --chain base --max-amount 0.0015 --probe-only --live-probe
```

`--chain base` above is only selat-pay's required flag; a probe never settles
and the CLI resolves the funded Gateway chain for paid runs. Re-probe before
payment because prices and modes can change.

Provider names and trademarks belong to their respective owners and are used
only for endpoint identification.
