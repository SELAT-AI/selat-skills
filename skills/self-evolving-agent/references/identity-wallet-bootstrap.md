# Identity And Wallet Bootstrap

Use this reference when the agent needs its own operating identity and treasury.

## Target Model

The agent should have:

- an AgentMail inbox for account email and operational messages;
- a Circle Agent Wallet authenticated with that AgentMail address;
- a funded Circle Gateway balance for SELAT/x402 spend;
- a local ledger that maps mailbox, wallet, Gateway balance, approvals, and
  expenses without storing secrets.

The mailbox and wallet belong to the agent's operating identity, not to the
human's personal identity. The human still approves creation, funding, spending
policy, and any regulated or money-moving action.

## Catalogue Endpoints

Free catalogue discovery found these AgentMail endpoints:

- `POST https://x402.api.agentmail.to/v0/inboxes` - Create Inbox. Catalogue
  price found: about `$2.00`.
- `GET https://x402.api.agentmail.to/v0/inboxes` - List Inboxes. Catalogue
  price found: `$0.00`.
- `GET https://x402.api.agentmail.to/v0/threads` - List Threads.
- `GET https://x402.api.agentmail.to/v0/threads/{thread_id}` - Get Thread.
- `GET https://x402.api.agentmail.to/v0/threads/{thread_id}/attachments/{attachment_id}` -
  Get Attachment.
- `POST https://x402.api.agentmail.to/v0/webhooks` - Create Webhook for inbox
  events.

AgentMail catalogue metadata describes it as email inboxes, threads, and sending
for autonomous agents.

## Bootstrap Flow

1. Quote AgentMail inbox creation with a maximum spend cap.
2. Ask the user to approve the inbox provider, price, and purpose.
3. Create the inbox only after approval.
4. Store the inbox address and inbox ID in `.economic-agent/IDENTITY.md` and
   `.economic-agent/MAILBOX.md`.
5. Store AgentMail credentials or API keys only in the approved secret store.
6. Start Circle Agent Wallet setup using the AgentMail address.
7. Poll or read AgentMail only for Circle messages addressed to the agent inbox.
8. Extract the OTP in memory, use it immediately for the Circle login flow, and
   discard it.
9. Record wallet ID/address, Gateway chain, spending policy, and funding status
   in `.economic-agent/TREASURY.md`.

## OTP Rules

- Retrieve OTPs only from the agent-owned AgentMail inbox.
- Retrieve OTPs only during an active Circle Agent Wallet login or renewal flow.
- Match sender, subject, timestamp, recipient, and expected login attempt before
  using an OTP.
- Never print the OTP in user-visible output.
- Never write the OTP to state files, logs, transcripts, prompts, evals, or PRs.
- Do not use the mailbox to access a human's personal accounts.
- If multiple OTPs are present, use the newest matching message and expire older
  candidates.

## Treasury Rules

The Circle Agent Wallet and Gateway balance are the default SELAT payment
treasury. The agent can spend from that treasury only within the approved policy:

- per-call cap;
- daily cap;
- weekly cap;
- provider cap;
- identity/bootstrap cap;
- infrastructure cap;
- trading cap, which defaults to zero.

Funding the Gateway balance always requires the user to approve a concrete USDC
amount. Live trading still requires a separate trading policy.
