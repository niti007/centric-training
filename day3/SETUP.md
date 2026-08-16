# Day 3 — Pre-work

Short today — you already did the heavy lifting on Day 1. This is a sanity check, not a new install.

## Requirements

- Everything from Day 1: Node 20+, Claude Code installed and authenticated (`claude --version` works).
- No new tools today. Jest and Supertest are already in this repo's `devDependencies` — `npm ci` pulls them in.

## Confirm your environment

```bash
git clone <day3-repo-url>
cd day3
npm ci
node scripts/verify-setup.mjs
```

**Definition of ready**: `verify-setup.mjs` prints all-green (✅ on every hard check).

Then run the test suite once, just to see where it starts:

```bash
npm test
```

Expected result — same shape as Day 1 and Day 2:

| Check | Expected |
|---|---|
| `verify-setup.mjs` | all-green, exits 0 |
| `npm test` | runs to completion; **3 tests fail** |

The 3 failures are the same seeded defects you've been told about since Day 1 — do not attempt to fix them before the session. They are today's actual subject matter, and today's lab and graded practical walk you through finding and fixing two of them properly, with regression tests, rather than by guessing.

## If something's off

- `verify-setup.mjs` reports red: fix that first (usually `npm install` or a Node upgrade) — it's the same check from Day 1.
- `npm test` shows more than 3 failures, or different ones than expected: don't debug it yourself before the session — flag it to your trainer. A different failure set usually means a bad clone or a `node_modules` mismatch, not a new bug for you to chase down early.
- `npm test` shows 0 failures: also flag it — it likely means you're looking at a solved/solution branch by mistake, not this day's starting state.
