# Day 2 — Pre-work

Day 2 does not repeat Day 1's install walkthrough. If Claude Code isn't installed and authenticated on your machine yet, stop and go do Day 1's `SETUP.md` first — everything below assumes that's already done.

## What to check before the session

```bash
cd day2
npm ci
npm test
```

**Expected result: 3 failing tests, same as Day 1.** Day 1's solution (the branch/state this repo starts from) added a new route; it did not fix any of the underlying defects those 3 failures encode. Seeing the same failure count here is confirmation you're on the right starting state, not a sign anything broke between Day 1 and Day 2.

If your count doesn't match:

- **More failures than 3, or different files failing**: you may be on the wrong branch/checkout, or a merge picked up stray local edits. Re-clone rather than debugging in place.
- **Fewer failures, or all green**: same — you're likely on a later day's starting state or someone's solution branch by mistake. Flag it to your trainer before the session rather than trying to "fix" it yourself; those tests are supposed to be red right now.

Also run the same machine check from Day 1 — it's carried forward unchanged and doesn't depend on test outcomes:

```bash
node scripts/verify-setup.mjs
```

All lines should print green. This checks your toolchain (Node, npm, Claude CLI, dependencies, TypeScript compile) — it is independent of the intentional test failures above.

## Read before the session starts

Unlike Day 1, this repo already has `CLAUDE.md` and `.claude/settings.json` populated. Read both — five minutes, not a formality. Today's lab and assessment assume you know what conventions they already encode (validation-through-`util/validate.ts`, the error envelope shape, the service/route boundary, ownership checks) so you're not relying on Claude to re-discover them from scratch every prompt.

If anything in `CLAUDE.md` is unclear or looks wrong to you, note it — that's a legitimate observation to raise in the lab's context-management exercise, not something to silently work around.
