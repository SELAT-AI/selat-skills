# Risk Policy

Use this reference when the user asks the agent to spend money, acquire
infrastructure, or trade.

## Approval Gates

Allowed without additional approval:

- local planning;
- free catalogue discovery;
- static validation;
- free endpoint probes;
- paper-trading simulation with no live orders.

Requires explicit approval and a maximum spend:

- AgentMail inbox creation or renewal;
- Circle Agent Wallet setup using the agent-owned mailbox;
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
- position sizing;
- leverage;
- derivatives;
- standing autonomy policy.

## Default Caps

Conservative defaults until the user says otherwise:

- no paid mailbox creation until the user approves provider, address purpose,
  and quoted price;
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
- the agent is asked to retrieve an OTP from any inbox other than its own
  AgentMail address;
- a Circle wallet login was not initiated by the agent's current approved flow;
- the user has not approved the next paid step.

## OTP Controls

OTP retrieval is allowed only for the agent's own AgentMail inbox and only for
the agent's own Circle Agent Wallet login. The OTP is a transient credential:

- verify recipient, sender, subject, and timestamp;
- use the newest matching code only;
- keep the code in memory only;
- never print, log, persist, or summarize the code;
- discard the code immediately after the login attempt;
- pause if the mailbox contains unexpected account-security alerts.

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

Trading outputs should be phrased as research, hypotheses, or execution logs,
not guaranteed returns or personalized recommendations.
