# Day 6 — Pre-work

Day 6 does not repeat Day 1's install walkthrough. If Claude Code isn't installed and authenticated on your machine yet, stop and go do Day 1's `SETUP.md` first — everything below assumes that's already done.

## What to check before the session

```bash
cd day6
npm ci
npm test
```

**Expected result: all 32 tests passing, 11 suites, 3 snapshots.** Day 6 starts from Day 5's solution, and Day 5 didn't touch `src/` or `tests/` — so this repo is green on arrival, same as Day 4 and Day 5 were. If you see red here, that's a real problem, not an intentional gap like Days 1–3 had.

If your result doesn't match:

- **Any failures**: check your Node version first (`node --version`, expect `v20.x`). If Node is correct and you still see failures, re-clone rather than debugging in place — a stray local edit or wrong branch is the likely cause.
- **A different total test count**: you're probably on the wrong day's starting state. Flag it to your trainer before the session.

Also run the machine check from Day 1 — it's carried forward unchanged and doesn't depend on test outcomes:

```bash
node scripts/verify-setup.mjs
```

All lines should print green.

## Build the app once before Block 1

Block 1's MCP server (`mcp/taskflow-server.mjs`) reads from `dist/services/taskService.js`, not from `src/`. Run the build once now so you're not debugging a missing `dist/` folder in the middle of the MCP exercise:

```bash
npm run build
```

Confirm it worked:

```bash
ls dist/services/taskService.js
```

If that file exists, you're ready. Re-run `npm run build` any time you change `src/` during the day — `dist/` is not watched automatically.

## What today needs that earlier days didn't

- **GitHub CLI or a GitHub personal access token**, for the Block 1 GitHub MCP connector demo/exercise. If you don't already have `gh` authenticated (`gh auth status`), sort that out before the session — don't burn Block 1 time on GitHub auth.
- **Node 20.x**, same as every other day — the MCP server and the plugin scaffold don't add any new runtime requirement beyond what Day 1 already had you install.

## Read before the session starts

Same as every day since Day 2: `CLAUDE.md` and `.claude/settings.json` are already populated — read both. Today also carries forward Day 5's `.claude/hooks/` and `.github/workflows/claude-review.yml`; you don't need to re-read those in depth, but know they exist, since Block 3's plugin packaging exercise references the commands and skill (not the hooks) that live alongside them.
