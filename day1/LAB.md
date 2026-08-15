# Day 1 — Lab

1:20–1:50 (30 minutes). Work individually, in this `day1` checkout. Six steps, timeboxed — if a step is running long, note where you stopped and move on; the trainer will circle back.

Keep a file called `NOTES.md` in the repo root open throughout — steps 1 and 3 ask you to record things in it.

---

## Step 1 — Install, auth, clone, test (5 min)

**Goal**: confirm your environment is working and observe the baseline test state.

```bash
claude --version
git clone <day1-repo-url>   # skip if already cloned
cd day1
npm ci
npm test
```

**Definition of done**: `npm test` has run to completion and printed a summary line like `Test Suites: 3 failed, 6 passed, 9 total`.

**Record in NOTES.md**: which test files failed. Do not attempt to fix them — they are seeded defects covered later in the programme, not a broken clone.

**Stuck?** If `npm ci` fails, check your Node version (`node --version`, must be 20+) before anything else. If `claude --version` fails, stop and flag your trainer — this should have been resolved via `SETUP.md`.

---

## Step 2 — Verify setup script (2 min)

**Goal**: confirm the machine-level checks pass, independent of the test suite.

```bash
node scripts/verify-setup.mjs
```

**Definition of done**: every line printed is green (✅). This script checks Node version, npm, the Claude CLI, installed dependencies, and that the TypeScript compiles — it does not run the test suite, so it will pass even though `npm test` showed failures in Step 1.

**Stuck?** A red ❌ line tells you exactly what failed and what to run to fix it (usually `npm install` or a Node upgrade). A yellow ⚠️ line is a soft warning, not a blocker.

---

## Step 3 — Orientation questions (5 min)

**Goal**: get comfortable asking Claude Code to explain a codebase you didn't write, and see how it grounds answers in the actual files.

Start an interactive session:

```bash
claude
```

Ask it these three questions, one at a time, in the same session:

1. "What does this API do, at a high level?"
2. "Where is request validation implemented, and how do the routes use it?"
3. "What does `src/legacy/reportBuilder.ts` do, and does anything about it look worth flagging?"

**Definition of done**: `NOTES.md` has a short (1–3 sentence) summary of each answer, in your own words, plus which file(s) Claude opened to answer each one.

**Stuck?** If an answer seems vague or generic, ask a follow-up: "Which specific file and line are you basing that on?" — a grounded answer should be able to point to one.

---

## Step 4 — First edit, in plan mode (8 min)

**Goal**: use plan mode for a real (small) change, and see a proposed diff before anything touches disk.

In your `claude` session, enter plan mode (`Shift+Tab`), then prompt:

```
Add a GET /tasks/:id/summary route that returns { id, title, dueIn }. Follow the existing conventions in src/routes/tasks.ts — reuse the validation and error-envelope helpers already used by the other routes, and don't touch src/repo/ directly.
```

`dueIn` should be a human-readable or numeric measure of time remaining until the task's due date — your choice, but be able to explain your reasoning if asked.

Review the plan Claude proposes. Only approve it once you understand what it intends to touch.

**Definition of done**: the route exists, `npm test` still shows the same 3 intentional failures as Step 1 (no new failures), and you can explain in one sentence why you approved (or, if you rejected and re-prompted, what was wrong with the first plan).

**Stuck?** If Claude proposes editing `src/repo/taskRepo.ts` directly, reject the plan and re-prompt, pointing at the specific convention it missed — this is a normal, expected outcome, not a failure on your part.

---

## Step 5 — Author CLAUDE.md (7 min)

**Goal**: write a project CLAUDE.md that documents this repo's real conventions, so Claude doesn't need them repeated in every prompt.

Create `CLAUDE.md` in the repo root with exactly these four `##` sections (you may add more, but these four are required and must use this exact heading text):

```markdown
## Commands
## Architecture
## Conventions
## Do Not Touch
```

Fill each in based on what you've observed in Steps 1–4 and by reading `src/` directly. Keep it short — a competent new hire reading it for two minutes should come away knowing how to run things, how the code is laid out, what rules the code follows, and what not to touch. Don't restate line-by-line what the code does.

**Definition of done**: all four sections present with real content (not placeholders), file is under roughly 100 lines.

**Stuck?** If you're unsure what counts as a "convention" worth recording, look back at Step 4 — the validation-helper and no-direct-repo-access rules you just relied on are exactly the kind of thing that belongs here.

---

## Step 6 — Configure permissions (3 min)

**Goal**: set a real permission policy instead of leaving every tool call to ad-hoc prompts.

Create `.claude/settings.json` with rules that:

- **allow** `npm test` and `npm run lint` to run without prompting
- **deny** `rm` outright
- require **ask** confirmation before `git push`

Use the `permissions` structure Claude Code reads from `settings.json` (allow / deny / ask arrays of tool-pattern strings).

**Definition of done**: the file parses as valid JSON and contains all three rule types. Test it by asking Claude, in a fresh prompt, to run `npm test` — it should no longer prompt you for that specific command.

**Stuck?** If you're not sure of the exact permission string syntax, ask Claude Code itself: "What's the correct settings.json syntax to allow Bash(npm test) without prompting?" — this is a legitimate, encouraged use of the tool during setup.

---

At 1:50, stop where you are. `NOTES.md`, `CLAUDE.md`, and `.claude/settings.json` from this lab feed directly into `ASSESSMENT.md`.
