# manhwa-chapter-check — endpoints

All three endpoints below are probe-verified live-payable (selat-pay --probe-only, 2026-08-09). Caps (maxAmount) are set with headroom above the live price. All three steps are routed MPP through the SELAT Router.

| Step | Method | URL | Rail | ~Live price | Cap |
|---|---|---|---|---|---|
| 1 — Exa web search | POST | `https://api.exa.ai/search` | routed MPP | $0.007 | $0.05 |
| 2 — Parallel search corroboration | POST | `https://parallelmpp.dev/api/search` | routed MPP | $0.011 | $0.05 |
| 3 — Reddit search | POST | `https://stablesocial.dev/api/reddit/search` | routed MPP | $0.063 | $0.10 |

**Payment:** Routed MPP through the SELAT Router outbound leg. Paid via USDC from the Circle Gateway balance. Accepts any series name as input — every step interpolates `${series}`.