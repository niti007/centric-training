# Day 7 — Lab

0:50–1:28 (38 minutes), Block 1's hands-on window. Work individually, in this `day7` checkout. Three steps, timeboxed — if a step is running long, note where you stopped and move on; the trainer will circulate. This lab **is** the graded practical — everything you do here is what `ASSESSMENT.md` grades, there's no separate practice/assessment split like earlier days had.

Blocks 2 and 3 (the capstone) are not covered in this file — jump to the pointer section at the bottom once Block 1 wraps.

---

## Step 1 — Fix the notification-escaping bug, with a regression test (15 min)

**Goal**: fix a real, currently-shipping issue — not a toy exercise — and prove the fix with a test that would actually catch a regression.

Open `src/services/notifyService.ts`. Both `buildTaskAssignedNotification` and `buildTaskCompletedNotification` build HTML notification bodies by interpolating `task.title`, `task.description`, and `user.name` straight into a template string, with no escaping. Any of those three values can come from user input (an authenticated user can set their own display name; anyone with access to create or update a task controls its title and description) — a value containing `<script>...</script>` or an `onerror` handler goes into the notification's `html` field exactly as written.

Prompt Claude Code to fix it. Don't just say "fix the security bug" — give it the specifics: every user-supplied value that ends up in the HTML template needs to be escaped before interpolation, in **both** functions, for **all three** values (`task.title`, `task.description`, `user.name`), and non-dangerous plain text must render exactly as before (a task called `"Ship the Q3 report"` should still read `"Ship the Q3 report"` in the output, not some mangled or over-escaped version of it).

Then write (or have Claude write) a regression test under `tests/` that:
- Constructs a task whose title contains a `<script>` tag (or similar HTML-injection-shaped payload).
- Asserts the resulting notification's `html` does **not** contain the raw, unescaped tag.
- Passes against your fixed code.

**Prove the test is real, not tautological**: temporarily revert your fix in `notifyService.ts` (comment it out, or `git stash` if you're using git locally) and re-run your new test. It must fail. If it still passes with the bug reintroduced, your test isn't actually checking anything — go back and fix the test, not just the code. Restore your fix afterward.

**Definition of done**: `npm test` is fully green including your new test; the fix covers all three values in both functions, not just the first one you happened to look at; you've personally confirmed the test fails against the unfixed code.

**Stuck?** If Claude's first pass only escapes `task.title` and misses `description` and `user.name`, that's the exact partial-fix pattern the Block 1 walkthrough warned about — point it out explicitly in your next prompt rather than fixing the other two by hand.

---

## Step 2 — Harden `.claude/settings.json` (12 min)

**Goal**: move this repo's permission policy from "day one, thin" to something a real team would actually run with.

Open `.claude/settings.json`. As shipped today it has two `allow` entries, one `deny` entry (`Bash(rm:*)`), and one `ask` entry (`Bash(git push:*)`) — a reasonable starting point, not a hardened policy.

Extend it. At minimum:
- **`deny`**: add rules blocking reads of anything that looks like a secret or credential file (`.env`, `.env.*`, anything with `secret` or `credentials` in the path) and blocking destructive git operations beyond what's already denied (`git push --force`, `git reset --hard`).
- **`ask`**: add rules covering operations that are risky but sometimes legitimate — `npm install`, `npm publish`, writes to `package.json`, writes to `.github/**`. These shouldn't be silently allowed, but they also shouldn't be a hard deny — a human should see the prompt and decide.
- Keep the existing `allow` entries and the existing `hooks` block intact — you're extending the policy, not replacing it. If you widen `allow` at all, widen it narrowly (e.g. adding the other verify-loop commands like `npm run build`/`npm run test:cov` alongside the existing `npm test`/`npm run lint`), not with a broad wildcard.

**Definition of done**: `.claude/settings.json` is still valid JSON; `deny` has more entries than it started with and covers secret/credential files; `ask` has more entries than it started with and covers at least install/publish and risky-path writes; the pre-existing hooks are untouched.

**Stuck?** If you're not sure whether something belongs in `deny` versus `ask`, use this test: would a human ever legitimately want to approve this, even occasionally? If yes, `ask`. If the answer is "no team should ever want this to happen automatically or otherwise," it's `deny`.

---

## Step 3 — Write `.claude/rules/security.md` and `.claude/rules/testing.md` (10 min)

**Goal**: turn today's two lessons — don't reintroduce an injection bug, don't ship a fix without a regression test that actually fails without it — into standing, enforced project memory, not something that only lived in your head for the last 25 minutes.

`.claude/rules/` doesn't exist yet in this repo. Create it, with two files:

- **`security.md`** — rules covering, at minimum: never interpolate user-supplied strings into HTML/SQL/shell commands without escaping or parameterizing; every route that reads or mutates a specific resource must check ownership, not just authentication; never commit secrets, and stop and flag it rather than "fixing later" if one is accidentally staged; treat all request bodies as untrusted until validated.
- **`testing.md`** — rules covering, at minimum: every new source file gets a sibling test; a bug fix ships with a regression test that fails when the fix is reverted (a test that passes either way is not a test); don't update snapshot tests to make a change pass without verifying the new output is actually intentional; run the full verify loop (lint, build, test) before calling anything done.

Write these as rules Claude Code should follow going forward in this repo, not as a summary of what you did today — the point is that the next person (or the next session) working in this codebase inherits the same discipline automatically.

**Definition of done**: both files exist under `.claude/rules/`, each with substantive content (not one-line stubs) covering the points above in your own words.

**Stuck?** If you're tempted to just paste today's walkthrough notes in verbatim, don't — write these as instructions for Claude to follow, the same register as `CLAUDE.md`'s existing conventions section.

---

At 1:28, stop where you are — the graded practical (`ASSESSMENT.md`) is exactly this work; run `node scripts/grade.mjs` to see where you stand, then move to Block 2 with the room.

---

## Blocks 2 and 3

Not covered in this file. Team and track were assigned on Day 5; the full capstone scenario, your track's deliverables, the shared constraints, the submission format, and the presentation demo script all live in `capstone/CAPSTONE.md`. Go there once Block 1 wraps — there is nothing to repeat here.
