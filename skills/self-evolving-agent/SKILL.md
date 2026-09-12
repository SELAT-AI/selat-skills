---
name: self-evolving-agent
description: Use this skill when the user wants to design or operate a budgeted economic agent with its own operational identity, AgentMail address, agent-wallet treasury, infrastructure budget, social and financial intelligence loop, monetization or trading hypotheses, and reinvestment policy. The skill enforces treasury controls, paper-trading first, compliance checks, and explicit approval before any paid inbox creation, wallet funding, purchase, or live trade.
license: Apache-2.0
compatibility: Tested with SELAT CLI 0.16.15 and Node.js 18+; requires a reachable SELAT Router. Paid preflight steps need a funded Circle Gateway balance. Live trading is outside the manifest and requires separately configured, user-approved venues and compliance with applicable law.
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

Planning inputs belong to the operating playbook and are **not** manifest flags:

- mission and success metric;
- starting budget and runway target;
- risk profile and loss limits;
- allowed asset universe; and
- allowed monetization paths.

The executable manifest accepts only the inputs its provider requests consume:

| Param | Required | Default | Description |
|---|---|---|---|
| `asset` | yes | none | One Hyperliquid ticker such as `BTC` or `ETH`; research input only, not trading authorization. |
| `domainCandidate` | yes | none | One full domain such as `example.com`; availability check only, not purchase authorization. |

Both inputs must be supplied explicitly. The manifest returns three independent
provider responses; it does not synthesize them, carry data between steps, or
generate the complete operating plan by itself. The agent using this playbook
should turn those responses and the planning inputs into:

- operating charter;
- operational identity and mailbox plan;
- treasury/risk policy;
- infrastructure acquisition plan;
- social and financial intelligence plan;
- paper-trading or monetization experiment plan;
- P&L and runway report;
- stop, continue, or reinvest recommendation.

## Manifest Steps

The manifest is a fixed three-call intelligence preflight. It does not purchase
infrastructure, create inboxes, fund wallets, or place trades.

Current manifest steps from SELAT discovery:

1. **Otto KOL sentiment** for market-moving social intelligence.
2. **Otto Hyperliquid market data** for the explicit `asset` ticker's funding,
   open interest, and price context.
3. **StableDomains availability check** for the explicit `domainCandidate`.

AgentMail inbox creation is intentionally not in the manifest because it is an
identity-provisioning action. A 2026-06-30 catalogue snapshot quoted it near
`$2.00`; re-probe before relying on that historical price and perform creation
only during the identity bootstrap with explicit user approval.

Trade-capable catalogue endpoints may be referenced as **available but locked
behind policy**. Do not add live execution endpoints to the manifest or call
them until the user has approved the venue, asset universe, treasury allocation,
position sizing, leverage policy, loss limits, monitoring, and emergency stop.
Known gated candidates include Otto AI Hyperliquid position endpoints and Otto
same-chain token swap endpoints; see `references/endpoints.md` and
`references/risk-policy.md`.

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

- `selat skill run` executes all three calls in order. It does not choose the
  cheapest provider, skip an irrelevant step, or stop after a useful result.
- Every paid call settles independently. A later provider-side validation error
  may still follow an already accepted payment; inspect history before retrying.
- A free 402 probe proves reachability and quote compatibility, not successful
  post-payment business output. The Hyperliquid endpoint's live schema requires
  `asset`, which is why the manifest includes it in the query string.
- CLI validation checks that inputs are present, not that they are meaningful.
  Before approval, confirm `asset` is a simple supported Hyperliquid ticker and
  `domainCandidate` is a syntactically valid full domain on a TLD supported by
  the live provider schema.
- The KOL report is broad rather than filtered by `asset`. Preserve the
  provider's `dataAsOf`, `generatedAt`, `degraded`, and source-health fields and
  do not imply that every narrative in the report concerns the requested asset.
- A domain availability response is only a point-in-time check, not a
  reservation or purchase.
- Revenue must be realized, not marked-to-market wishfulness.
- Data APIs can be right, late, partial, or stale; assign expiry windows.
- Social sentiment can be adversarial and manipulated.
- Backtests often overfit. Require forward paper-trading.
- Infrastructure spending is sticky; favor reversible monthly or usage-based
  costs before domains and annual commitments.
- A strategy that pays for data but loses after fees is not sustainable.

## Validation

- Static check: `selat skill validate ./skills/self-evolving-agent`
- Required-input gate: `selat skill verify ./skills/self-evolving-agent --live-probe`
  must fail before network probing.
- Free live-price check: `selat skill verify ./skills/self-evolving-agent --asset BTC --domainCandidate agent-alpha-research.com --live-probe`
- Paid check only after a fresh quote, explicit approval of the expected total
  and cumulative cap, and an armed session budget: add `--pay` to that command.

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

Provider and product names identify third-party services only. This skill does
not imply provider endorsement and is not investment advice.
