# Risk Policy

Use this reference when writing the plan that follows the three-call
preflight. The skill itself executes none of the gated actions below. These
gates apply to anything the user later does outside the manifest.

## Approval Gates

Allowed without additional approval:

- local planning;
- free catalogue discovery;
- static validation;
- free endpoint probes;
- paper-trading simulation with no live orders.

Requires explicit approval and a maximum spend:

- creating any inbox, wallet login, or other identity for the agent;
- paid intelligence calls;
- paid compute;
- paid hosting;
- domain purchase or renewal;
- storage;
- paid deployment or monitoring.

Requires separate explicit trading approval:

- live order placement;
- exchange or broker API use;
- wallet funding for trading;
- trade-capable SELAT catalogue endpoints, including Hyperliquid perpetuals,
  token swaps, margin updates, deposits, withdrawals, or unsigned transaction
  builders;
- position sizing;
- leverage;
- derivatives;
- standing autonomy policy.

## Default Caps

Conservative defaults until the user says otherwise:

- no more than 5% of starting budget committed to infrastructure before first
  revenue;
- no more than 10% of starting budget spent on intelligence experiments before
  the first weekly review;
- no live trading;
- no leverage;
- no strategy promotion before at least 20 forward paper-trade observations;
- stop any experiment whose measured value is less than its cost for two review
  periods.

## Kill Switches

Pause the agent when any condition is true:

- cash runway drops below the configured minimum;
- daily spend cap is reached;
- strategy drawdown reaches the configured limit;
- data source fails, becomes stale, or changes terms;
- a live venue, API, or payment rail behaves unexpectedly;
- the task would require private, hacked, leaked, or non-public information;
- the task would create personalized financial advice without proper controls;
- the agent is asked to read a one-time code or credential from any mailbox;
- the user has not approved the next paid step.

## Trading Controls

Before live trading, require:

- written asset universe;
- written venue list;
- maximum notional exposure;
- maximum loss per day;
- maximum loss per strategy;
- order types allowed;
- leverage policy;
- paper-trading evidence;
- monitoring and emergency stop path.

Trade-capable catalogue endpoints are available but locked behind policy. Do
not call `trade-perpetuals`, `close-position`, `modify-hl-order`,
`update-position-margin`, `hl-deposit-withdraw`, `swap`, `withdraw`, or
`deposit` endpoints unless all trading controls are complete and the user has
approved the specific run or a standing autonomy policy.

Trading outputs should be phrased as research, hypotheses, or execution logs,
not guaranteed returns or personalized recommendations.
