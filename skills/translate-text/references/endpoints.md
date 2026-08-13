# Endpoints — translate-text

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| translate | POST | `https://x402.agentutility.ai/translate-text` | routed (x402 via Circle Gateway) | $0.002 |

- **Provider:** AgentUtility.ai (x402 endpoint, catalog `bazaar`)
- **Payment:** routed via the SELAT Router (outbound leg: x402 via Circle Gateway; quote observed $0.0021 on eip155:8453)
- **Request schema** (from the upstream OpenAPI, corroborated by probe):
  - `text` (string, required, max 12k chars) — text to translate
  - `target_language` (string, required) — ISO code or name, e.g. `es` / `Spanish`
  - `source_language` (string, optional) — auto-detected if omitted
  - `formality` (string, optional; enum `casual` | `formal` | `neutral`)
- **Response:** `{ "translated_text": string, "detected_source_language": string }`
- **Verify (probe, free):**
  ```bash
  selat-pay POST "https://x402.agentutility.ai/translate-text" \
    --body '{"text":"Hello world","target_language":"Spanish"}' \
    --chain base --probe-only
  ```
