---
name: translate-text
description: Use this skill when the user wants text translated into another language — "translate this to Spanish", "translation please", "say this in Japanese". Single routed x402 call (USDC via Circle Gateway) to AgentUtility.ai's translate-text endpoint; preserves Markdown, code blocks, URLs, and proper nouns, and auto-detects the source language. Do NOT use for general chat/rewriting — this is translation only.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.2, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: Tatakafria
  version: "1.0"
  rail: routed
  kind: single
---

# translate-text

## When To Use

Use when the user wants text translated from one language to another — agent
messages, support replies, or documents — and the target language is known.
The upstream auto-detects the source language, so only the target matters.
Preserves Markdown, code blocks, URLs, and proper nouns.

Not for: general rewriting, summarizing, or tone adjustments in the same
language (the model does that natively, free).

## Workflow

1. Install: `selat skill install translate-text`
2. Run: `selat skill run translate-text --text "<text>" --target_language "<es|Spanish|…>"`
3. The CLI compiles the step into a `selat-pay` call (routed x402 via the
   SELAT Router) and prints the result.
4. Tell the user the translated text and, if shown, the detected source
   language — in plain language.

Step: **AgentUtility.ai** `POST /translate-text` — routed via the SELAT Router (outbound leg: x402 via Circle Gateway, ~$0.002/call).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `text` | yes | — | Text to translate. Max 12k chars. |
| `target_language` | yes | — | Target language as an ISO code or name, e.g. `es` or `Spanish`. |

Output: JSON with `translated_text` and `detected_source_language`.

Optional request fields supported by the upstream but NOT wired as manifest
params (they'd ship as empty strings in the body): `source_language` (ISO code
or name; auto-detected when omitted) and `formality` (`casual` | `formal` |
`neutral`, default neutral). To set them, hand-build a call:

```bash
selat-pay POST https://x402.agentutility.ai/translate-text \
  --body '{"text":"…","target_language":"es","formality":"formal"}' \
  --chain <funded-chain> --max-amount 0.01
```

## Gotchas

- **Both params are required** — a body without `target_language` 4xx's (and
  still charges).
- **Cost cap:** live quote is ~$0.002/call (Gateway quote $0.0021, eip155:8453);
  `maxAmount` 0.01 leaves headroom, it is a filter not a price.
- **No type coercion:** `text` and `target_language` are plain strings; keep
  them unquoted in the body (the manifest handles that).
- **Formality/source_language are string enums** — hand-built calls only (see
  Inputs And Outputs); empty-string defaults would break the API contract.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe (no pay): `selat-pay POST "https://x402.agentutility.ai/translate-text" --body '{"text":"Hello world","target_language":"Spanish"}' --chain base --probe-only`
- A successful run prints `status=200`.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
- Upstream OpenAPI — https://x402.agentutility.ai/openapi.json (`/translate-text`)
