# Endpoints - read-pdf-documents

This skill composes two native x402 services from the live SELAT federated catalogue.
Schemas are pinned from each provider's own OpenAPI and prices are corroborated by
free `selat-pay --probe-only` calls on 2026-08-12. The routed quote includes SELAT's
router margin, so manifest caps carry headroom.

## Selection policy

| Order | Endpoint | Use | Catalogue price | Live routed quote | Cap |
|---|---|---|---|---|---|
| 1 | `POST https://api.utilia.ink/base/v1/pdf/to-markdown` | Normal text-layer PDF | $0.0025 | $0.002625 | $0.01 |
| 2 | `GET https://visual.hugen.tokyo/visual/ocr` | Scanned/image-only PDF fallback | $0.05 | $0.052500 | $0.075 |

Run step 1 first. Run step 2 only when step 1 returns empty/negligible text or an
explicit scanned/image-only warning and the user confirms the additional spend.

## Step 1: Utilia PDF to Markdown

Provider-owned schema: `GET https://api.utilia.ink/openapi.json`, operation
`convertPdfToMarkdownOnBase` (`/base/v1/pdf/to-markdown`, OpenAPI 3.1.0).

Request body:

| API field | Required | Type | Manifest input | Constraints |
|---|---|---|---|---|
| `url` | one of `url`/`pdfBase64` | string, URI | `${pdfUrl}` | Public HTTPS PDF; no credentials/private networks; maximum 8 MiB; at most 3 vetted redirects. |
| `pdfBase64` | one of `url`/`pdfBase64` | string | not wired | Mutually exclusive with `url`; omitted to keep this skill URL-based. |
| `title` | no | string | `${title}` | Maximum 200 characters. |
| `maxPages` | no | integer | not wired | 1-100, default 50. Do not wire through string substitution. |

The manifest sends only string-typed fields:

```json
{
  "url": "${pdfUrl}",
  "title": "${title}"
}
```

HTTP 200 response fields: `title` (string), `totalPages` (integer), `sourceBytes`
(integer), `textCharacters` (integer), `sha256` (64-character lowercase hex),
`markdown` (string), and `warning` (string). Markdown is page-delimited. The service
does not OCR image-only PDFs and reports that condition in `warning`.

```bash
selat-pay POST "https://api.utilia.ink/base/v1/pdf/to-markdown" \
  --body '{"url":"https://api.utilia.ink/.well-known/utilia/examples/document.pdf","title":"Document intake"}' \
  --chain base --max-amount 0.01 --probe-only
```

## Step 2: Visual scanned-PDF OCR

Provider-owned schema: `GET https://visual.hugen.tokyo/openapi.json`, operation
`visual_ocr_visual_ocr_get` (`/visual/ocr`, OpenAPI 3.1.0).

Query parameters:

| API field | Required | Type | Manifest input | Constraints |
|---|---|---|---|---|
| `url` | yes | string | `${pdfUrl}` | URL of the scanned PDF, maximum 4096 characters. |
| `max_pages` | no | integer | fixed `50` | 1-200, default 50. Fixed in the manifest to bound work and avoid type ambiguity. |

The OpenAPI does not declare a response schema. The catalogue describes the response
as structured OCR text and metadata for English scanned PDFs. Treat all returned
confidence, pagination, and metadata fields as provider output; do not promise fields
that the live response does not contain.

```bash
selat-pay GET "https://visual.hugen.tokyo/visual/ocr?url=https%3A%2F%2Fapi.utilia.ink%2F.well-known%2Futilia%2Fexamples%2Fdocument.pdf&max_pages=50" \
  --chain base --max-amount 0.075 --probe-only
```

## Payment and failure behavior

- Both endpoints are catalogue-listed native x402 services. `selat-pay` detects
  `x402=yes`, routes through `https://router.selat.ai`, and obtains a
  GatewayWalletBatched quote on `eip155:8453`.
- Probes are free and prove challenge reachability and cap compliance only. They do
  not validate the PDF or exercise a paid HTTP 200 response.
- The router settles before the provider validates the document request. Invalid,
  inaccessible, oversized, private-network, non-PDF, or unsupported documents can
  fail after payment.
- The full-run cap is $0.09. A normal one-step read is about $0.002625; a confirmed
  OCR escalation brings the expected total to about $0.055125.
