# Endpoints — social-intel

Use only these endpoint families for `social-intel`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Semantic web context (Exa) | POST | `https://api.exa.ai/search` | x402 via Circle Gateway | $0.007 | $0.01 |
| 2 — Advanced web corroboration (Tavily) | POST | `https://x402.tavily.com/search` | x402 via Circle Gateway | $0.0105 | $0.02 |

This is a fixed 2-call manifest of two web searches. The step table matches
`manifest.json` exactly, and `selat skill run` pays for both steps on every
run. It does not call Reddit, X/Twitter, or any other social-platform API.
Live-probed total (2026-10-04): **$0.0175**. Sum of per-step caps: **$0.03**.
The top-level `maxAmount` (`$0.02`) is only a per-step fallback for a step
without its own cap. It is not a cumulative run cap.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** Exa (`api.exa.ai`) and Tavily (`x402.tavily.com`). The probe reports `routed-x402` for both. The buyer pays from whichever chain holds the funded Gateway balance. This is not a pay-chain claim.

## Exa — `x402 via Circle Gateway`

serviceUrl: `https://api.exa.ai`

Live-probed price: `$0.007` per call (`routed-x402`, 2026-10-04). Per-step cap
`$0.01`. Exa used to resolve `routed-mpp` at `$0.00735`. The live probe now
resolves routed x402. **POST with a JSON body.** Neural/semantic search that
returns page text.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Semantic web context | `/search` | `query` (string, required), `numResults` (integer), `contents.text.maxCharacters` (integer) |

```json
{ "query": "${topic}", "numResults": 10, "contents": { "text": { "maxCharacters": 4000 } } }
```

Results include URL, title, score, and the requested page text when available.

## Tavily — `x402 via Circle Gateway`

serviceUrl: `https://x402.tavily.com`

Live-probed price: `$0.0105` per call (`routed-x402`, 2026-10-04). Per-step cap
`$0.02`. **POST with a JSON body.** Aggregation search with
`search_depth: advanced`.

Tavily's 402 challenge lists two offers: a `$0.01` USDC offer, which the router
selects (`$0.0105` routed), and a second offer written as the decimal string
`0.016`. Older selat-pay builds failed to parse that second offer
(`Cannot convert 0.016 to a BigInt`). selat-pay `>= 0.12.0` parses it. The cap
stays above `$0.016` so a switch to that offer cannot strand the step.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Advanced web corroboration | `/search` | `query` (string, required), `search_depth` (string — `advanced`), `max_results` (integer) |

```json
{ "query": "${topic}", "search_depth": "advanced", "max_results": 10 }
```

Results include ranked URL, title, snippet, and score. The manifest does not
request a generated answer or raw page content.

## Free probes

Whole skill (reads payment challenges only, never settles):

```bash
selat skill verify ./skills/social-intel --topic "stablecoin payments for AI agents October 2026" --live-probe
```

Single step (`--chain base` is only selat-pay's required flag; a probe never
settles, and paid runs use whichever chain holds your Gateway balance):

```bash
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"stablecoin payments for AI agents","numResults":10,"contents":{"text":{"maxCharacters":4000}}}' \
  --chain base --max-amount 0.01 --probe-only --live-probe
selat-pay POST "https://x402.tavily.com/search" \
  --body '{"query":"stablecoin payments for AI agents","search_depth":"advanced","max_results":10}' \
  --chain base --max-amount 0.02 --probe-only --live-probe
```

A passing probe proves payment compatibility and cap fit. It does not prove the
quality or success of the paid response. A paid provider error can still be
charged, so never retry automatically.

## Interpretation limits

- The two responses are raw and independent. The manifest performs no synthesis.
- The same page retrieved by both engines is one source, not two confirmations.
- Web search gives no platform-native engagement, audience, or sentiment data.
- Add dates or recency terms to `topic` when freshness matters, and keep the
  publication dates returned by sources.
