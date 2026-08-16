# Day 7 — Pre-work

Day 7 does not repeat Day 1's install walkthrough. If Claude Code isn't installed and authenticated on your machine yet, stop and go do Day 1's `SETUP.md` first — everything below assumes that's already done.

## What to check before the session

```bash
cd day7
npm ci
npm test
```

**Expected result: all 35 tests passing, 13 suites, 3 snapshots.** Day 7 starts from Day 6's solution, and Day 6 didn't leave anything red behind — so this repo is green on arrival, same as Days 4–6 were. If you see red here, that's a real problem, not an intentional gap like Days 1–3 had.

If your result doesn't match:

- **Any failures**: check your Node version first (`node --version`, expect `v20.x`). If Node is correct and you still see failures, re-clone rather than debugging in place — a stray local edit or wrong branch is the likely cause.
- **A different total test count**: you're probably on the wrong day's starting state. Flag it to your trainer before the session.

Also run the machine check from Day 1 — it's carried forward unchanged and doesn't depend on test outcomes:

```bash
node scripts/verify-setup.mjs
```

All lines should print green.

## Bring for the capstone (Blocks 2–3)

- Your team and track assignment from Day 5 — know which of Track A/B/C you're building before Block 2 starts, don't decide in the room.
- Whatever you'll need for a 10-minute demo at the end of the day: if your presentation depends on something calling a live model, have a fallback recording or committed output ready, per `capstone/CAPSTONE.md`'s demo advice. Sort that out in advance, not during the checkpoint.

## What today needs that earlier days didn't

Nothing new on the toolchain side — Node 20.x and an authenticated Claude Code CLI, same as every other day. What's different is time: this is a 6-hour day with a hard 3-hour build block, so arrive on time and with your machine already in the state above. There is no slack in Block 1 to debug a broken `npm ci`.

## Read before the session starts

Same as every day since Day 2: `CLAUDE.md` and `.claude/settings.json` are already populated — read both. `.claude/settings.json` in particular is the file you'll be hardening in Block 1's practical, so know what it currently allows, denies, and asks about before you start changing it.
