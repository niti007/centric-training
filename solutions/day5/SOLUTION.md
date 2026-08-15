# Day 5 Solution

## What changed

- `.claude/hooks/lint-on-write.mjs` — PostToolUse hook on Write|Edit: runs
  ESLint against the touched `.ts`/`.tsx` file, exits 2 (block-style
  feedback surfaced to Claude) with the ESLint output on failure, 0
  otherwise.
- `.claude/hooks/secret-block.mjs` — PreToolUse hook on Write|Edit: scans
  the content about to be written for secret-shaped patterns (PEM private
  keys, AWS access key IDs, `sk-...` style API keys, `api_key: "..."`
  assignments) and exits 2 to block the write if found.
- `.claude/hooks/notify-stop.mjs` — Stop hook: prints a one-line
  completion notice, always exits 0 (informational only, never blocks).
- `.claude/settings.json` — extends the Day 1 permissions with the three
  hooks above, wired to `PostToolUse`/`PreToolUse`/`Stop`.
- `.github/workflows/claude-review.yml` — CI: on every PR, installs deps,
  runs lint/build/test, then (if that job passes) runs the `/review` slash
  command via `claude-code-action` and posts review feedback on the PR.

## Why

This demonstrates the hook exit-code contract taught on Day 5: `0` = pass
silently, `2` = block with a message the agent sees and can act on, other
non-zero = error shown to the user but non-blocking. `lint-on-write`
enforces code quality automatically instead of relying on the model to
remember to run lint; `secret-block` is a hard safety rail that can't be
skipped by a distracted prompt; `notify-stop` is a minimal, non-blocking
example of the third hook type. The workflow ties the same review command
from Day 4 into CI so review coverage isn't only local.
