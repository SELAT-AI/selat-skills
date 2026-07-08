# Economic Model

Use this reference when converting the skill into an operating plan.

## Core Ledger

Track the agent as a small business, not as a magic trading loop.

Required ledgers:

- agent mailbox address and inbox ID;
- agent wallet ID/address;
- Gateway balance;
- starting capital;
- cash balance;
- committed expenses;
- realized revenue;
- realized trading P&L;
- unpaid liabilities;
- reserved taxes/accounting buffer;
- runway in days;
- cost per signal;
- revenue or value per signal.

Do not count unrealized gains, open positions, or unverifiable leads as profit
for reinvestment.

## Treasury Wallet Model

The default treasury is the agent's Circle Agent Wallet plus funded Gateway
balance. The agent should authenticate that wallet with its own AgentMail
address so wallet login, OTPs, payment receipts, and account notices route to the
agent's operational inbox rather than a human's personal email.

Track these separately:

- mailbox creation cost;
- wallet setup status;
- Gateway deposits approved by the user;
- Gateway spend on SELAT/x402 calls;
- off-Gateway balances or optional strategy wallets;
- realized revenue returned to treasury.

Gateway balance is operating cash. It is not permission to spend without caps.

## Budget Allocation

For a conservative default, allocate:

- 45% cash reserve and runway;
- 20% data and intelligence experiments;
- 15% infrastructure, hosting, and domain;
- 10% operational identity, mailbox, and monetization experiments;
- 10% contingency.

Trading allocation starts at 0 until the user approves a paper-trading plan and
risk policy. Live trading allocation starts at 0 until the user separately
approves venue, position size, loss caps, and asset universe.

## Revenue Paths

Prefer non-trading monetization before live trading:

- paid market-intelligence briefings;
- alert feeds for niche communities;
- lead generation from public company or investor signals;
- dashboards with sourced social and financial signal summaries;
- API access to cleaned, scored intelligence;
- research products for prediction-market or crypto communities.

Trading can be included as an experiment only after evidence exists that the
strategy remains positive after fees, slippage, failed calls, stale data, and
operating costs.

## Reinvestment Rule

Reinvest only realized surplus:

```text
reinvestable_surplus =
  realized_revenue
+ realized_closed_trade_profit
- paid_operating_expenses
- trading_fees
- slippage_estimate
- reserve_buffer
```

If reinvestable surplus is negative for the review period, reduce spend, pause
the weakest experiment, or shut down.

## Review Cadence

Daily:

- cash balance;
- endpoint spend;
- signal freshness;
- active hypotheses;
- kill-switch breaches.

Weekly:

- P&L;
- runway;
- strategy scorecard;
- source reliability;
- promote, pause, or retire decisions.
