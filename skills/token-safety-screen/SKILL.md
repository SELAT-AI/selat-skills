---
name: token-safety-screen
description: Pre-buy safety screen for any crypto token — fuses web scam/rugpull reports (Exa), live X/Twitter chatter for honeypot/rug signals (SELAT Twitter advanced_search), and smart-money positioning (Nansen holdings) into one verdict brief. Answers "is this token a trap?" before the user apes in.
license: Apache-2.0
compatibility: Requires Node.js 18+, the selat CLI, and selat-pay >= 0.7.0 on PATH. Verifying routed steps needs SELAT_ROUTER_URL set; `selat skill verify` (without --pay) is free and needs no funded wallet.
metadata:
  author: user00shinru
  version: "1.0"
  rail: mixed
  kind: multi
---

# token-safety-screen

Screen any crypto token for scam/rugpull signals **before buying** — one command,
three independent signal sources, paid per call via selat-pay (USDC via Circle
Gateway), no API keys.

This is the question a price brief doesn't answer: established assets get market
briefs; new and small-cap tokens get honeypotted. This skill checks what the web
is reporting about the token, what live X chatter is saying right now, and
whether smart money is actually positioned.

## How This Differs From `financial-intel`

`financial-intel` answers **"is this token worth buying?"** — price action,
market structure, fundamentals, direction signals. This skill answers a
different question: **"is this token a trap?"** — counterparty risk, not
valuation. The capability that makes it its own entry is **token safety
screening**:

- Different inputs: scam/rugpull report corpus (Exa) and honeypot chatter
  (X `advanced_search`, `queryType=Latest`) — not price/market feeds.
- Different reasoning: recency-weighted scam signals, chatter independence,
  and smart-money accumulation vs exit divergence — not TA or valuation.
- Different output: a GREEN/YELLOW/RED safety verdict with evidence dates and
  an explicit "what was not checked" list — not a market brief.

The two compose: run `financial-intel` for the thesis, this skill for the
green light. Neither substitutes for the other.

## When To Use

Use when a user is about to buy a token (especially new, small-cap, or trending
memecoin launches) and asks any of: "is this safe?", "is this a rug?",
"check this token first", "should I ape?". Also fits post-hoc triage after a
user already holds a suspicious token.

Not for: price/market briefs on established assets (use `financial-intel`),
wallet attribution (use `wallet-desk-brief`), or deep Twitter research menus
(use `twitter-research`).

## Workflow

1. **Confirm the token with the user** — resolve ambiguous symbols to the
   specific token + chain the user means (many symbols collide across chains).
   Tell the user: "screening <TOKEN> costs about $0.07 in API calls — proceed?"
2. **Run the screen** (agent executes):

   ```bash
   selat skill run token-safety-screen --token <SYMBOL> --network <chain>
   ```

   All three steps run in one invocation; selat-pay settles each step
   separately and the session budget gates the total.

3. **Read the three signals against each other** — the verdict is the
   *combination*, not any single row:
   - **Exa web reports** (`api.exa.ai/search`) — look for audit write-ups,
     rugpull reports, honeypot warnings from reputable security outlets.
     Recent dates matter: a clean 2024 report says nothing about a v2 relaunch.
   - **Live X chatter** (`catalog.selat.ai/twitter/tweet/advanced_search`,
     `queryType=Latest`) — this is the *right-now* signal: "can't sell",
     "honeypot", "rug", "dev wallet moved". Scan recency and independence —
     five tweets from one account is noise, five from different accounts in
     the last hour is a signal.
   - **Nansen smart-money holdings** (`api.nansen.ai/api/v1/smart-money/holdings`)
     — is the label in the smart-money lists, and are those wallets accumulating
     or exiting? Smart money absent isn't damning, but smart money *exiting*
     while the chart pumps is the classic pre-rug tell.

4. **Relay a plain-language verdict to the user** — never dump raw JSON.
   Structure: one-line verdict (GREEN / YELLOW / RED with confidence),
   then the strongest 2-3 evidence points with dates, then what was NOT
   checked (contract code, honeypot simulation — this skill is off-chain
   signals only). Be explicit that this is not financial advice and a clean
   screen is not a guarantee.

## Inputs And Outputs

| Param | Required | Default | Used by |
|---|---|---|---|
| `token` | yes | `PEPE` | Exa scam-report query + X chatter search (URL-encoded into the query string) |
| `network` | no | `ethereum` | Nansen `chains` array (named `network` — `--chain` is a reserved settlement flag of the selat CLI) |

**Output**: the agent fuses the three step outputs into a verdict brief:
verdict + confidence, key evidence with dates, smart-money positioning,
explicit list of what was not checked. Raw step JSON stays out of the relay.

## Gotchas

- **Symbols collide.** `$PEPE` exists on Ethereum, Base, and Solana with
  different safety profiles. Always confirm chain with the user; pass
  `--network` to Nansen explicitly. (Do not use `--chain` — that is the selat
  CLI's reserved settlement flag and would never reach the skill.)
- **The X search is encoded into the URL** — the `${token}` substitution lands
  inside a query string, so the rest of the template is pre-encoded
  (`%20`, parentheses). If you edit the query, keep it URL-safe or the GET 402s.
- **Nansen takes `chains` as an array** (`{"chains":["solana"]}`), not a string.
- **Nansen is dual-protocol with a gated MPP challenge** — a bare probe 402s
  x402-only; the MPP `WWW-Authenticate: Payment` surfaces only under an
  `Authorization: Payment` probe (selat-pay's probe 2 handles this).
- **Absence of evidence is not evidence of safety.** No scam reports for a
  token launched yesterday means *nothing is reported yet* — weight live X
  chatter and smart-money movement higher for very young tokens.
- **Cost expectation**: live total ≈ $0.061 per full run (Exa ~$0.0073 + X
  ~$0.001 + Nansen ~$0.0525). `maxAmount` 0.35 is headroom, not a price.

## Validation

```bash
selat skill validate ./skills/token-safety-screen   # static SOP check
selat skill verify   ./skills/token-safety-screen   # free 402/rail probe (the gate)
selat skill verify   ./skills/token-safety-screen --pay --token PEPE  # one capped live run
```

Verified 2026-08-29: all three steps serve challenges and settle 200 (see
`.selat/verify-receipt.json`).

## References

- `references/endpoints.md` — per-endpoint method, URL, rail, price, probe commands
- `evals/evals.json` — trigger/notrigger assertions
