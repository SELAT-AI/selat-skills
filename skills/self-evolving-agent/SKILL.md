---
name: self-evolving-agent
description: Use this skill when the user wants a bounded, read-only paid preflight before planning a budgeted economic agent. It runs a fixed three-call bundle - one broad crypto KOL sentiment report, Hyperliquid market data for one explicit asset ticker, and availability and price for one explicit domain candidate - then turns the results into a budget, expense, risk, and paper-trading plan. Before payment, require both inputs, free-verify every call, disclose the live total and the sum of per-step caps, and obtain explicit approval. It does not create inboxes or wallet identities, fund wallets, buy domains or compute, or place trades. Do not use it for a single price lookup, live trading, or account setup.
license: Apache-2.0
compatibility: "Requires the selat CLI and selat-pay with a funded Circle Agent Wallet for paid runs; all three calls traverse a reachable SELAT Router (SELAT_ROUTER_URL) - two as routed x402, one as routed MPP. `selat skill verify --live-probe` is free and needs no funded wallet."
metadata:
  author: SELAT-AI
  version: "2.1"
  rail: mixed
  kind: multi
---

# self-evolving-agent

A fixed three-call, read-only **economic-agent preflight**. It gathers the
minimum paid context someone needs before deciding whether a budgeted agent is
worth running. The agent then turns that context into a plan.

## When To Use

Use this skill when the user wants to:

- check broad crypto social sentiment, market data for one Hyperliquid asset,
  and one domain candidate's availability and price in one paid run, before
  committing a budget to an agent; and
- turn those three results into a budget, expense, runway, risk, and
  paper-trading or monetization plan for an autonomous or semi-autonomous agent.

Do not use it to:

- create an email inbox, wallet login, or any other identity for an agent;
- fund a wallet or Gateway balance, or buy a domain, hosting, or compute;
- place, modify, or close a trade, or run a live trading loop;
- look up a single price (use a narrower skill or one `selat-pay` call); or
- give personalized financial advice or promise profits.

## Workflow

1. Install the vetted recipe:

   ```bash
   selat skill install self-evolving-agent
   ```

2. Collect both required inputs. There are no defaults:
   - `asset`: one Hyperliquid ticker such as `BTC` or `ETH`;
   - `domainCandidate`: one full domain on a TLD the provider supports, such as
     `agent-alpha-research.com`.

3. Probe every payment challenge for free:

   ```bash
   selat skill verify ~/.config/selat/skills/self-evolving-agent \
     --asset BTC \
     --domainCandidate agent-alpha-research.com \
     --live-probe
   ```

4. Show the three live quotes, their expected total, and the sum of the
   per-step caps. Wait for explicit approval. The domain-check price depends on
   the TLD: about `$0.0105` for `.com`, `.net`, `.org`, `.co` and similar, and
   `$0.0525` for `.ai`, `.io`, `.xyz`, `.dev` and similar.

5. After approval and with a spendable Gateway balance, arm a session budget
   equal to the approved amount, run the bundle once, and disarm the budget:

   ```bash
   selat budget start --amount <approved-amount>
   selat skill run self-evolving-agent --asset <ticker> --domainCandidate <domain>
   selat budget stop
   ```

   `selat skill run` executes and pays for all three calls, in order, on every
   run. The session budget is a selat-pay spending tripwire. It does not select
   or skip steps.

6. Inspect the per-step results and payment history. Then write the plan from
   the three responses and the user's planning inputs (mission, starting budget,
   runway target, loss limits, allowed monetization paths):
   - budget, expense categories, and runway;
   - risk policy, loss caps, and kill switches (see `references/risk-policy.md`);
   - paper-trading or non-trading monetization experiments, never live trades;
   - what any later purchase (domain, hosting, compute) would cost, quoted
     separately and approved separately; and
   - a stop, continue, or reinvest rule (see `references/economic-model.md`).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `asset` | yes | none | One Hyperliquid ticker such as `BTC` or `ETH`. Research input only, not trading authorization. |
| `domainCandidate` | yes | none | One full domain such as `agent-alpha-research.com`. Availability check only, not purchase authorization. |

Steps (fixed, no data passes between them):

| # | Call | Rail | Live quote (2026-10-04) | Cap |
|---|---|---|---|---|
| 1 | Otto KOL sentiment (broad, not filtered by `asset`) | x402 via Circle Gateway | $0.00315 | $0.004 |
| 2 | Otto Hyperliquid market for `asset` | x402 via Circle Gateway | $0.00105 | $0.002 |
| 3 | StableDomains availability and price for `domainCandidate` | MPP on Tempo | $0.0105 (`.com`) – $0.0525 (`.ai`/`.io`/`.xyz`) | $0.075 |

Expected total: **$0.0147** for a `.com`-class domain, **$0.0567** for an
`.ai`/`.io`-class domain. Sum of per-step caps: **$0.081**. The top-level
`maxAmount` is only a per-step fallback for a step without its own cap. It is
not a run cap.

Output:

1. the three provider responses with retrieval time, each tagged with its
   freshness fields (`dataAsOf`, `generatedAt`, `degraded` where present);
2. the plan from step 6 of the Workflow; and
3. per-step status plus the final settled cost.

## Gotchas

- **Fixed pipeline.** Every run pays for all three calls. There is no step
  filter, no cheapest-first logic, and no stop after a useful result.
- **A paid call can still fail.** Each step settles independently. A provider
  error after payment may still be charged. Check `selat history` before any
  retry, and never re-run the whole bundle to repair one step.
- **The KOL report is broad.** Do not imply that every narrative in it is about
  the requested `asset`.
- **Domain price depends on the TLD.** A malformed or unsupported domain quotes
  `$0.105`, which the `$0.075` cap refuses before payment. Validate the domain
  first. A check is point-in-time. It is not a reservation or a purchase.
- **CLI validation checks presence, not meaning.** Confirm `asset` is a simple
  supported Hyperliquid ticker before approval.
- **Planning is not execution.** Inbox or wallet setup, Gateway funding,
  infrastructure purchases, and trades are outside this skill. Each needs its
  own quote, its own explicit approval, and a different tool.
- **Profit is a hypothesis.** Count only realized revenue. Backtests overfit,
  social sentiment can be manipulated, and data can be late or stale.

## Validation

- Static: `selat skill validate ./skills/self-evolving-agent`
- Required-input gate: `selat skill verify ./skills/self-evolving-agent --live-probe`
  fails before any network probe, because both inputs are required.
- Free live gate: `selat skill verify ./skills/self-evolving-agent --asset BTC --domainCandidate agent-alpha-research.com --live-probe`
- Paid check, only after fresh quotes, explicit approval, and an armed session
  budget: add `--pay` to the free live gate. Every call may settle
  independently.

## References

- `manifest.json` - machine-readable three-call recipe.
- [`references/endpoints.md`](references/endpoints.md) - request contracts, live prices, caps, and rails.
- [`references/verification.md`](references/verification.md) - latest free live-probe results.
- [`references/economic-model.md`](references/economic-model.md) - budget, P&L, and reinvestment model for the plan.
- [`references/risk-policy.md`](references/risk-policy.md) - approval gates, caps, and kill switches for the plan.
- [`references/catalogue-findings.md`](references/catalogue-findings.md) - historical catalogue snapshot (not executed by this skill).
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) - authoring standard.

Provider and product names identify third-party services only. This skill is
not affiliated with or endorsed by those providers and is not investment advice.
