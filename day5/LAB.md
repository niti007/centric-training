# Day 5 — Lab

1:05–1:40 (35 minutes). Work individually, in this `day5` checkout. Five steps, timeboxed — if a step is running long, note where you stopped and move on; the trainer will circle back. None of this lab is graded directly (the graded practical is `ASSESSMENT.md`), but every step here builds a piece the assessment needs, so don't skip one entirely even if you're behind schedule — do a thin version instead.

Keep a `NOTES.md` open in the repo root throughout — Step 4 asks you to record something in it.

## The hook JSON contract, once, up front

Every hook command receives a single JSON object on **stdin** and communicates back to Claude Code through its **exit code** (and, for a blocking exit, its **stderr**):

- `PreToolUse` / `PostToolUse` payload includes `tool_name` (e.g. `"Write"`, `"Edit"`) and `tool_input` — for `Write` that's `{ file_path, content }`; for `Edit` that's `{ file_path, old_string, new_string }`.
- `Stop` payload is smaller and doesn't carry `tool_input` — treat it as informational only.
- Exit `0` = pass silently (nothing shown to the user, nothing fed back to Claude).
- Exit `2` = **block**. For `PreToolUse` this stops the tool call before it happens. For `PostToolUse` the tool already ran; exit `2` surfaces your stderr back to Claude as feedback it can act on (e.g. "fix these lint errors"), it does not undo the write. Either way, write your reason to **stderr**, not stdout.
- Any other non-zero exit = treated as a hook **error**: shown to the user, but does **not** block anything. This is the one everyone gets wrong at least once — a hook that crashes with an uncaught exception (exit 1) looks like it failed loudly, but Claude Code just shows the error and moves on as if the hook had passed.

Wire a hook in `.claude/settings.json` under `hooks.<EventName>`, as an array of `{ "matcher": "<regex on tool name>", "hooks": [{ "type": "command", "command": "node .claude/hooks/<file>.mjs" }] }`. `Stop` has no tool to match, so it omits `matcher` entirely — just `{ "hooks": [...] }`.

---

## Step 1 — `PostToolUse` hook: lint-on-write (7 min)

**Goal**: every `.ts`/`.tsx` file Claude writes or edits gets linted immediately, automatically — not "remember to run lint before you're done."

Create `.claude/hooks/lint-on-write.mjs`. It should:
1. Read the JSON payload from stdin.
2. If `tool_input.file_path` doesn't end in `.ts` or `.tsx`, exit `0` immediately (nothing to do).
3. Otherwise run `npx eslint "<file_path>"` against that file.
4. If ESLint reports errors, write the ESLint output to stderr and exit `2`. If it's clean, exit `0`.

Wire it into `.claude/settings.json` under `hooks.PostToolUse`, matcher `"Write|Edit"`.

**Definition of done**: ask Claude to write a `.ts` file containing an obvious lint error (e.g. a stray `debugger;` statement — `no-debugger` is an error-level rule in this repo's ESLint config, not just a warning) and watch the hook fire and report it back. Then ask it to fix the file and confirm the hook goes quiet (exit 0) on the next write.

**Stuck?** If the hook never seems to fire, check `node --check .claude/hooks/lint-on-write.mjs` first (a syntax error in the hook script fails silently from Claude Code's point of view — see the exit-code note above), then double-check the matcher string and that the command path is relative to the repo root.

---

## Step 2 — `PreToolUse` hook: block secret-shaped writes (7 min)

**Goal**: a hard safety rail that can't be skipped by a distracted prompt — unlike lint-on-write, this one runs *before* the write happens and can stop it outright.

Create `.claude/hooks/secret-block.mjs`. It should:
1. Read the JSON payload from stdin.
2. Pull the text about to be written from `tool_input.content` (Write) or `tool_input.new_string` (Edit).
3. Check it against a small set of secret-shaped patterns — at minimum an AWS access key ID (`AKIA` + 16 alphanumerics), a generic API-key-shaped token (e.g. `sk-` followed by 20+ alphanumerics), and a PEM private key header (`-----BEGIN ... PRIVATE KEY-----`).
4. If any pattern matches, write a clear reason to stderr and exit `2` — this **blocks the write from happening at all**. Otherwise exit `0`.

Wire it into `.claude/settings.json` under `hooks.PreToolUse`, matcher `"Write|Edit"`.

**Definition of done**: ask Claude to write a file containing something that looks like `const apiKey = "sk-<20+ random characters>";` and confirm the write is blocked — the file should **not** appear on disk, and Claude should see your block message. Then ask for the same file without the fake key and confirm it writes normally.

**Stuck?** If the write goes through anyway, check you're reading the right field — `Write` and `Edit` calls use different `tool_input` shapes, and a hook that only checks `content` will silently miss every `Edit` call.

---

## Step 3 — `Stop` hook: completion notice (5 min)

**Goal**: the simplest hook type — advisory only, never blocks, just tells you something happened.

Create `.claude/hooks/notify-stop.mjs`. It should print one line (to stdout is fine here — this one's for you, not for Claude) noting Claude finished a turn, with a timestamp, and **always** exit `0`. A `Stop` hook that blocks is almost never what you want; there's nothing left to block.

Wire it into `.claude/settings.json` under `hooks.Stop` (no `matcher` needed).

**Definition of done**: run any prompt to completion and see your notice print when the turn ends.

**Stuck?** If you're tempted to make this hook exit non-zero on some condition, stop and ask: what would that even block? `Stop` fires after Claude is already done — there's no tool call left to intercept.

---

## Step 4 — Headless review of a diff (8 min)

**Goal**: run Claude Code non-interactively, get structured output back, and use it in a script — the shape every CI job in Step 5 and beyond depends on.

Make a small, real change first (anything — e.g. add a comment to `src/util/money.ts`), don't commit it. Then run:

```bash
claude -p "Review the current uncommitted diff for correctness and convention issues. Report findings as a JSON-friendly summary." --output-format json > /tmp/review-output.json
```

Look at `/tmp/review-output.json` — note its top-level shape (it wraps the response plus metadata, not just raw prose).

Write a short script (`node`, a dozen lines is plenty) that reads that JSON file and prints just the review text, or exits non-zero if the file doesn't parse as JSON at all. This is the exact pattern Step 5's CI job needs: run headless, capture JSON, parse it, decide pass/fail programmatically.

**Record in `NOTES.md`** under `## Headless Review`: the exact command you ran and one thing about `--output-format json`'s shape that surprised you or that you'd have gotten wrong guessing.

**Stuck?** If the command hangs, you're probably missing `-p` (interactive mode waits on a TTY that isn't there in a script/CI context) — `-p` is what makes it headless in the first place.

---

## Step 5 — `.github/workflows/claude-review.yml` (8 min)

**Goal**: the same headless pattern from Step 4, running in CI on every pull request, with least-privilege tool access and a real pass/fail gate.

Create `.github/workflows/claude-review.yml`. It needs, at minimum:
- Trigger on `pull_request`.
- A job that installs dependencies and runs `npm run lint`, `npm run build`, `npm test` — the same checks `/qa-report` runs locally, now automated.
- A second job (gated behind the first passing) that installs the Claude Code CLI, then runs it **headlessly** with tools restricted to the minimum needed for a *read-only* review — `--allowedTools "Read,Grep,Glob"` — and `--output-format json`, in the same shape as Step 4.
- A step after that parses the JSON output and **fails the build** (non-zero exit) if the review reports a critical/blocking finding.
- The Anthropic API key read from a GitHub Actions secret (`${{ secrets.ANTHROPIC_API_KEY }}`), never hardcoded.

**Definition of done**: the YAML is well-formed (no tabs, consistent indentation, parses as valid YAML), `--allowedTools` is present and does **not** include `Write`, `Edit`, or unscoped `Bash` for the review step, and there's a script or step that turns "the review found something critical" into a non-zero exit code — not just a comment posted with no consequence.

**Stuck?** If you're not sure what "critical finding" should look like in JSON, keep it simple for the lab: have your review prompt ask Claude to end its response with a single line like `VERDICT: BLOCK` or `VERDICT: OK`, and have your parsing script grep for that line rather than trying to design a rich schema under time pressure. `ASSESSMENT.md` is where this gets exercised for real, against a seeded bad branch.

---

At 1:40, stop where you are. The hooks, `.claude/settings.json`, and `.github/workflows/claude-review.yml` from this lab are exactly what the graded practical in `ASSESSMENT.md` builds on — you're not starting that fresh, you're finishing it.
