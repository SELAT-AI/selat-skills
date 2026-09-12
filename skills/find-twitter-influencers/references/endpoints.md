# Endpoints — find-twitter-influencers

This skill is a fixed five-call, read-only discovery bundle. Free live
verification on **2026-08-30** observed three `routed-mpp` calls and two
`routed-x402` calls. It contains no contact-data purchase.

## Endpoint matrix

| # | Purpose | Method and endpoint | Required request data | Declared rail / observed mode | Live quote | Per-step cap |
|---|---|---|---|---|---:|---:|
| 1 | Brand context by name | `POST apollo.mpp.paywithlocus.com/apollo/org-search` | JSON: `q_organization_name`; bounded `per_page`, `page` | MPP on Tempo / `routed-mpp` | $0.00525 | $0.01 |
| 2 | Brand context by domain | `GET mpp.orthogonal.com/company-enrich/companies/enrich?domain=…` | Query: `domain` | MPP on Tempo / `routed-mpp` | $0.012862 | $0.02 |
| 3 | Curated web roundups | `POST exa.mpp.tempo.xyz/search` | JSON: `query`, bounded `numResults` and text | MPP on Tempo / `routed-mpp` | $0.00525 | $0.01 |
| 4 | Twitter account search | `GET catalog.selat.ai/twitter/user/search?query=…` | Query: `query` | x402 via Circle Gateway / `routed-x402` | $0.001 | $0.002 |
| 5 | Current Twitter topic search | `GET catalog.selat.ai/twitter/tweet/advanced_search?query=…&queryType=Latest` | Query: `query`; fixed `queryType=Latest` | x402 via Circle Gateway / `routed-x402` | $0.001 | $0.002 |

Expected total at the recorded quotes: **$0.025362**. The five independent
per-step caps sum to **$0.044**. The manifest's top-level `$0.02` is only a
fallback for a step without an override, not a cumulative cap.

## Request and interpretation notes

### Apollo organization search

- Public OpenAPI accepts `q_organization_name`, `per_page`, and `page` in a JSON
  POST body.
- The skill bounds the first page to five records. Match the returned domain to
  the user-supplied `domain`; a similar company name is not enough.

### Company Enrich

- The replacement endpoint is a GET lookup by bare domain and returns company
  industry, employee, revenue, location, funding, technology, and social fields
  when found.
- It replaces the former Abstract Company Enrichment route, which returned no
  x402 or MPP challenge during the 2026-08-30 live gate.

### Exa search

- `query` is required; the skill requests ten results and bounded text for
  independent list/roundup evidence.
- Exa does not reliably index x.com/twitter.com profiles. A handle parsed from a
  roundup is an unverified lead until corroborated by Twitter output.
- The former `findSimilar` step was removed because Exa's current public OpenAPI
  marks that operation deprecated and recommends search with a descriptive
  query instead.

### SELAT Twitter user search

- Public OpenAPI requires `query` and optionally accepts a pagination `cursor`.
- It searches public accounts by keyword. Normalize returned handles without
  `@`; do not infer private or sensitive characteristics from profile text.

### SELAT Twitter advanced search

- Public OpenAPI requires `query` and accepts `queryType` and `cursor`.
- The manifest fixes `queryType=Latest` to emphasize current activity. This can
  underrepresent established creators who have not posted recently.
- `tweetQuery` can use supported X operators such as `lang:en`, `min_faves:`,
  `since:`, hashtags, cashtags, and `from:`.

## Removed calls

- **Abstract Company Enrichment:** removed because its live host stopped serving
  a detectable payment challenge.
- **Exa findSimilar:** removed because the current public operation is
  deprecated.
- **Hunter and Clado contact enrichment:** removed from mandatory discovery to
  avoid buying email/phone data before the user selects a candidate. Contact
  enrichment is a separately quoted follow-up.
- **Single-handle profile and tweet reads:** replaced with multi-candidate user
  and topic searches. Use `twitter-research` for a selected-candidate deep dive.

## Free live probes

These commands read payment challenges and do not sign or settle:

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
  --chain base --max-amount 0.01 --probe-only --live-probe

selat-pay GET \
  "https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=acme.com" \
  --chain base --max-amount 0.02 --probe-only --live-probe

selat-pay POST "https://exa.mpp.tempo.xyz/search" \
  --body '{"query":"best fintech payments Twitter X creators to follow","numResults":10,"contents":{"text":{"maxCharacters":5000}}}' \
  --chain base --max-amount 0.01 --probe-only --live-probe

selat-pay GET \
  "https://catalog.selat.ai/twitter/user/search?query=fintech%20payments" \
  --chain base --max-amount 0.002 --probe-only --live-probe

selat-pay GET \
  "https://catalog.selat.ai/twitter/tweet/advanced_search?query=%28fintech%20OR%20payments%29%20min_faves%3A50%20lang%3Aen&queryType=Latest" \
  --chain base --max-amount 0.002 --probe-only --live-probe
```

`--chain base` above is the settlement-chain argument required by `selat-pay`.
It has no effect on free, chain-independent challenge probing. Re-probe before
payment because prices and modes can change.

Provider names and trademarks belong to their respective owners and are used
only for endpoint identification.
