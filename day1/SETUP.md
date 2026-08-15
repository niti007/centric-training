# Day 1 — Pre-work (send 48 hours ahead)

Complete this before the session. Installation and corporate auth problems are the biggest time sink on Day 1 — there is no slack in the 2-hour agenda to debug them live.

## Requirements

- **Node.js 20 or later**, with npm. Check: `node --version`.
- **Git**, configured with your name and email.
- **A terminal** and an editor of your choice (VS Code, JetBrains, vim — anything).
- **Claude Code**, installed and authenticated (below).

## Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Confirm it installed:

```bash
claude --version
```

## Authenticate

Two options — use whichever your organisation has arranged:

- **Subscription login** (Pro/Max/Team/Enterprise): run `claude`, follow the browser login prompt. Default for most attendees.
- **API key**: set `ANTHROPIC_API_KEY` in your shell environment if your organisation issues API access instead of a seat-based subscription.

If you don't know which applies to you, ask your team lead before the session, not during it.

## Corporate network / proxy notes

- If your company terminates TLS via a corporate proxy (Zscaler, Netskope, etc.), you may need to point Node at your organisation's CA bundle, e.g. `NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem`. Ask IT for the certificate path — this is the single most common install blocker.
- If `npm install -g` fails with a permissions error, do not use `sudo`. Fix your npm global prefix (`npm config set prefix ~/.npm-global` and add it to `PATH`) instead.
- If outbound HTTPS is blocked entirely, you will not be able to authenticate. Flag this to IT well before the session — a firewall exception request can take days.
- If your machine is locked down and none of the above is fixable in time, see the fallback below.

## Prove you're ready

Before the session, send your trainer a screenshot of:

```bash
claude --version
```

run from a terminal on the machine you'll bring to training. This is the readiness signal the trainer is checking for — no screenshot, assume you are not ready and plan to arrive early.

## Clone the training repo

```bash
git clone <day1-repo-url>
cd day1
npm ci
```

Do not run `npm test` and try to "fix" anything yet — some failures there are intentional and are covered on the day.

## Fallback if you are hard-blocked

If you cannot get Claude Code installed or authenticated by the deadline (locked-down corporate laptop, no firewall exception in time, etc.):

- Tell your trainer at least 24 hours before the session, not on the day.
- A limited number of loaner environments (browser-based or a pre-configured VM) will be available — these let you follow the session but are not a substitute for having your own setup working, since Days 2 onward assume a working local install.
- Escalate the firewall/proxy exception request through your IT department in parallel; most attendees who need this resolve it before Day 2.
