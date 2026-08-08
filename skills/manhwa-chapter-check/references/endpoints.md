# manhwa-chapter-check — endpoints

Both endpoints below are probe-verified live-payable (selat-pay --probe-only, 2026-07-17). Caps (maxAmount) are set with headroom above the live price. Both steps are routed MPP through the SELAT Router.

| Step | Method | URL | Rail | ~Live price | Cap |
|---|---|---|---|---|---|
| 1 — Exa web search | POST | `https://api.exa.ai/search` | routed MPP | $0.007 | $0.10 |
| 2 — Reddit subreddit | POST | `https://stablesocial.dev/api/reddit/subreddit` | routed MPP | $0.063 | $0.25 |

**Payment:** Routed MPP through the SELAT Router outbound leg. Paid via USDC from the Circle Gateway balance. Accepts any series name as input.
