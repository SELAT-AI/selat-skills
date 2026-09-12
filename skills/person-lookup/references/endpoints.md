# Endpoints — person-lookup

Use only this endpoint family for `person-lookup`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

The previous Clado `POST /clado/search` route no longer serves a 402. Company
Enrich `POST /people/search` does quote (`routed-mpp`, ~$0.129 at `pageSize=5`)
but it is a directory filter (required `pageSize`; `query` matches company
name/domain, not a person). Apollo `people-search` is the live 1:1 replacement:
natural-language keywords, already used in-repo, free-probed 2026-09-12.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Person search | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-search` | MPP on Tempo | $0.00525 |

This is a fixed 1-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Apollo via Locus (`apollo.mpp.paywithlocus.com`).

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.00525` per call (`routed-mpp`, 2026-09-12). The endpoint
is **POST with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person search | `/apollo/people-search` | `q_keywords` (string, required) — name plus company / role / geography |

Body pattern:

```json
{ "q_keywords": "Dario Amodei Anthropic CEO" }
```

Do not call Clado `/clado/search` (dead — no 402). Do not substitute StableEnrich
`contacts-enrich` ($0.21). Company Enrich `/people/search` is live but is not a
1:1 person-name lookup.

## Free verification

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/person-lookup \
  --query "Dario Amodei Anthropic CEO" \
  --live-probe
```
