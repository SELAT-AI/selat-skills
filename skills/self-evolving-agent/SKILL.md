---
name: self-evolving-agent
description: Use this skill when the user wants to design or operate a budgeted economic agent with its own operational identity, AgentMail address, agent-wallet treasury, infrastructure budget, social and financial intelligence loop, monetization or trading hypotheses, and reinvestment policy. The skill enforces treasury controls, paper-trading first, compliance checks, and explicit approval before any paid inbox creation, wallet funding, purchase, or live trade.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, Node.js 18+, and a reachable SELAT Router. Paid intelligence/infrastructure steps need a funded Circle Gateway balance. Live trading requires separately configured, user-approved venues and must comply with applicable law.
metadata:
  author: SELAT-CLI local agent
  version: "2.0"
  rail: mixed
  kind: multi
---

# self-evolving-agent

Design and operate a **budgeted economic agent**: an agent given a fixed budget
and its own operational identity. The agent can provision an AgentMail address,
use that address to authenticate its Circle Agent Wallet, acquire
infrastructure, gather social and financial intelligence, produce monetizable
insight or trading hypotheses, and use realized profits to sustain expenses.

This skill treats "self-evolving" as economic adaptation under constraints. The
agent evolves by reallocating budget toward tools, data sources, strategies, and
products that improve verified net returns. It does not assume profitability,
does not bypass regulatory or exchange constraints, and does not make live
trades without explicit user-approved risk limits.

## When To Use

Use this skill when the user asks to:

- build an autonomous or semi-autonomous economic agent;
- give an agent its own email address and agent-wallet treasury;
- use an agent-owned mailbox to receive OTPs for the agent's own Circle wallet;
- give an agent a budget and have it buy compute, hosting, domains, or paid data;
- gather social intelligence, financial intelligence, or market signals;
- test whether intelligence can be monetized through subscriptions, reports,
  lead generation, trading, or prediction-market research;
- define a reinvestment loop where profits sustain operating expenses;
- add treasury, runway, P&L, risk, and shutdown rules to an agent.

Do not use this skill to provide personalized financial advice, promise profits,
evade platform rules, trade on inside information, manipulate markets, retrieve
OTPs from a human's mailbox, or move funds without explicit approval.

## Operating Definition

A self-evolving economic agent follows this loop:

```text
identity -> agent wallet -> budget -> acquire infrastructure
         -> gather intelligence -> form hypotheses -> monetize or paper-trade
         -> measure P&L -> reinvest, pause, or shut down
```

The agent is successful only if realized revenue or trading profits exceed:

- compute and hosting;
- domain and storage;
- paid data/API calls;
- trading fees, slippage, and taxes/accounting reserves;
- monitoring and operational overhead.

Profit sustainability is an objective to test, not an assumption.

## Workflow

1. **Provision Operational Identity**
   - Register an AgentMail inbox for the agent only after the user approves the
     mailbox cost and intended use.
   - Use the AgentMail address as the Circle Agent Wallet login email when the
     user has approved that the agent may own the wallet identity.
   - Retrieve Circle OTPs only from the agent-owned AgentMail inbox, only during
     an active wallet-login flow, and never print or store the OTP.
   - Record mailbox address, inbox ID, provider, creation cost, and expiry or
     renewal rules. Store API keys, mailbox tokens, and Circle auth material only
     in the approved secret store, never in state files.

2. **Initialize Treasury**
   - Record starting budget, denomination, owner, allowed spend categories, and
     runway target.
   - Bind the treasury to the agent's Circle Agent Wallet and funded Gateway
     balance. Treat Gateway balance as spendable operating cash, not unlimited
     authorization.
   - Define expense caps: daily, weekly, monthly, per-endpoint, per-provider.
   - Define loss caps: max daily loss, max strategy drawdown, max total loss.
   - Define shutdown rules before the first purchase.

3. **Acquire Infrastructure**
   - Start with no-cost or low-cost options.
   - Use SELAT discovery for compute, hosting, domain, and storage candidates.
   - Separate "quote", "purchase", and "activate" phases.
   - Never buy domains, deploy paid compute, fund Gateway, or renew services
     without explicit approval and a spend cap.

4. **Gather Intelligence**
   - Social: KOL sentiment, Twitter/X trends, influencer movement, community
     chatter, attention velocity, narrative changes.
   - Financial: token prices, funding rates, open interest, prediction markets,
     on-chain flows, trades, liquidity, news summaries.
   - Source each signal with timestamp, endpoint cost, confidence, and expiry.

5. **Generate Hypotheses**
   - Convert signals into testable hypotheses:
     - "Narrative X is accelerating before price response."
     - "Funding and sentiment diverge for asset Y."
     - "A report/API product can sell to audience Z."
   - Each hypothesis must include expected edge, invalidation criteria, required
     data, estimated cost, and monetization path.

6. **Validate Before Monetizing**
   - Backtest when historical data exists.
   - Paper-trade before live trading.
   - Run small paid intelligence loops only when projected value exceeds cost.
   - Require a minimum sample size before promoting a strategy.

7. **Monetize**
   - Non-trading first: publish paid reports, alerts, lead lists, dashboards, or
     research feeds.
   - Trading second: only after paper-trading shows positive expected value net
     of fees/slippage and risk controls are approved.

8. **Execute With Gates**
   - Read-only discovery and analysis can run freely.
   - AgentMail inbox creation and Circle wallet setup require explicit user
     approval because they create operational identity and may trigger paid or
     regulated services.
   - Paid API calls need a max spend cap.
   - Infrastructure purchases need itemized approval.
   - Live trades need explicit approval or a standing trading policy signed off
     by the user.
   - The agent must stop trading after any kill-switch condition.

9. **Evolve**
   - Keep tools and strategies with positive verified ROI.
   - Demote or remove tools that burn budget without signal value.
   - Increase budget only from realized profits or explicit user top-up.
   - Write weekly P&L, strategy, and capability reviews.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `mission` | yes | `sustain agent expenses from social and financial intelligence` | The economic objective or niche. |
| `budget_usd` | yes | `100` | Starting operating budget, not a guarantee of spend. |
| `risk_profile` | no | `conservative` | `conservative`, `balanced`, or `aggressive`; affects suggested caps only. |
| `asset_universe` | no | `crypto majors and prediction markets` | Markets or assets the agent may research. |
| `monetization` | no | `reports, alerts, dashboards, paper-trading` | Allowed revenue paths. |

Outputs:

- operating charter;
- operational identity and mailbox plan;
- treasury/risk policy;
- infrastructure acquisition plan;
- social and financial intelligence plan;
- paper-trading or monetization experiment plan;
- P&L and runway report;
- stop, continue, or reinvest recommendation.

## Manifest Steps

The manifest is an optional intelligence preflight. It does not purchase
infrastructure, create inboxes, fund wallets, or place trades.

Current candidate steps from SELAT discovery:

1. **Otto KOL sentiment** for market-moving social intelligence.
2. **Otto Hyperliquid market data** for funding, open interest, and price context.
3. **StableDomains availability check** for infrastructure/domain planning.

AgentMail inbox creation is intentionally not in the manifest because it is an
identity-provisioning action with a live catalogue price near `$2.00`; perform it
only during the identity bootstrap with explicit user approval.

Live 402 verification remains the submission gate; see
`references/verification.md`.

## Required State Files

Initialize these files before operating:

- `.economic-agent/CHARTER.md`
- `.economic-agent/IDENTITY.md`
- `.economic-agent/MAILBOX.md`
- `.economic-agent/TREASURY.md`
- `.economic-agent/RISK_POLICY.md`
- `.economic-agent/EXPENSES.md`
- `.economic-agent/SIGNALS.md`
- `.economic-agent/HYPOTHESES.md`
- `.economic-agent/PAPER_TRADES.md`
- `.economic-agent/PNL.md`
- `.economic-agent/REVIEWS.md`

Do not store secrets, private keys, exchange API secrets, OAuth tokens, AgentMail
API keys, Circle auth material, OTPs, full transcripts, or raw personal data in
these files.

## Hard Safety Rules

- No AgentMail inbox creation unless the user approves the mailbox provider,
  expected price, and purpose.
- No OTP retrieval from any mailbox except the agent-owned AgentMail inbox
  during an active agent-wallet login flow.
- Never log, persist, summarize, or reuse OTPs.
- No funding commands unless the user explicitly asks to deposit a concrete USDC
  amount.
- No live trades before paper-trading and risk-policy approval.
- No leverage unless separately approved in writing with max liquidation loss.
- No strategy promotion without net-of-fees performance evidence.
- No use of private, hacked, leaked, or non-public material.
- No market manipulation, wash trading, spam, or deceptive promotion.
- No investment recommendations presented as guaranteed or personalized advice.
- Shut down or pause when runway, drawdown, compliance, or data-quality limits
  are breached.

## Gotchas

- Revenue must be realized, not marked-to-market wishfulness.
- Data APIs can be right, late, partial, or stale; assign expiry windows.
- Social sentiment can be adversarial and manipulated.
- Backtests often overfit. Require forward paper-trading.
- Infrastructure spending is sticky; favor reversible monthly or usage-based
  costs before domains and annual commitments.
- A strategy that pays for data but loses after fees is not sustainable.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe. Probing
> reads a free, chain-independent quote and never settles. A paid run resolves
> settlement from the funded Gateway balance.

- Static check: `selat skill validate ./skills/self-evolving-agent`
- Free live-price check: `selat skill verify ./skills/self-evolving-agent`
- Paid check only after approval: `selat skill verify ./skills/self-evolving-agent --pay`

If live verification fails, use this skill as a local guidance skill and do not
submit it as a paid SELAT catalogue skill until at least one manifest endpoint
quotes within cap.

## References

- `manifest.json` - machine-readable intelligence preflight recipe.
- `references/economic-model.md` - operating model and accounting loop.
- `references/identity-wallet-bootstrap.md` - AgentMail and Circle Agent Wallet bootstrap.
- `references/risk-policy.md` - treasury, trading, and shutdown controls.
- `references/catalogue-findings.md` - SELAT catalogue findings for this definition.
- `references/clawhub-patterns.md` - prior ClawHub self-improvement patterns.
- `references/verification.md` - current validation and live-probe status.
- `../../references/agent-skill-authoring-sop.md` - SELAT skill authoring standard.
