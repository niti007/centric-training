# Day 4 — Pre-work

Day 4 does not repeat Day 1's install walkthrough. If Claude Code isn't installed and authenticated on your machine yet, stop and go do Day 1's `SETUP.md` first — everything below assumes that's already done.

## What to check before the session

```bash
cd day4
npm ci
npm test
```

**Expected result: all tests passing — 32 passed, 0 failed.** Unlike Days 1–3, there are no intentional failures left by this point: Day 3's solution fixed the two seeded defects that were still open, and the service layer carries the coverage bar the earlier days built toward. Green here is the expected baseline, not a sign you did something extra.

If your count doesn't match:

- **Any failures at all**: re-check your Node version first (`node -v` — this programme targets Node 20), then re-clone rather than debugging in place. A red suite on Day 4 is a genuine setup problem, not part of the exercise.
- **More tests than 32, or different files**: you're likely on the wrong day's checkout. Flag it to your trainer before the session.

Also run the same machine check from Day 1 — it's carried forward unchanged and doesn't depend on test outcomes:

```bash
node scripts/verify-setup.mjs
```

All lines should print green. This checks your toolchain (Node, npm, Claude CLI, dependencies, TypeScript compile) independently of the test suite above.

## Read before the session starts

`CLAUDE.md` and `.claude/settings.json` are already present, carried forward unchanged — read both before you start. What's *not* present yet is `.claude/commands/` and `.claude/skills/`: today you build both from a blank starting point, the same way you built `CLAUDE.md` itself on Day 1. Don't go looking for starter files that "should" be there — there aren't any, on purpose.
