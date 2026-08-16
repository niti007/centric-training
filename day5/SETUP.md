# Day 5 — Pre-work

Day 5 does not repeat Day 1's install walkthrough. If Claude Code isn't installed and authenticated on your machine yet, stop and go do Day 1's `SETUP.md` first — everything below assumes that's already done.

## What to check before the session

```bash
cd day5
npm ci
npm test
```

**Expected result: all tests passing (11 suites, 32 tests).** Day 4's solution left the suite fully green, and Day 5's work is entirely in `.claude/hooks/`, `.claude/settings.json`, and `.github/workflows/` — nothing here touches `src/` or `tests/`, so the count shouldn't move.

If your result doesn't match:

- **Any failures**: you're likely on the wrong branch/checkout, or a merge picked up stray local edits. Re-clone rather than debugging in place — by Day 5 red tests are never intentional.
- **A different pass count**: same — flag it to your trainer before the session rather than trying to "fix" it yourself.

Also run the same machine check from Day 1 — it's carried forward unchanged and doesn't depend on test outcomes:

```bash
node scripts/verify-setup.mjs
```

All lines should print green.

## Read before the session starts

You'll be writing to `.claude/settings.json` today, which already exists (from Day 1/2). Read it first so you know what permissions are already configured — today's hooks block extends that file, it doesn't replace it.

If you have a GitHub account handy and know how repository secrets work (`Settings → Secrets and variables → Actions`), the CI portion of the lab will go faster. You won't need to actually run a workflow against a live GitHub repo to complete the lab or assessment — the grader validates the YAML and the underlying scripts locally — but if you want to see it run for real, having a scratch repo and an API key to add as a secret ahead of time saves time mid-session.
