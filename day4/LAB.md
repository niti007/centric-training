# Day 4 — Lab

1:10–1:45 (35 minutes). Work individually, in this `day4` checkout, until Step 5, which needs a partner. Five steps, timeboxed — if a step is running long, note where you stopped and move on; the trainer will circle back. Step 2's `qa-report.md` and Step 3's `SKILL.md` are the basis for the graded practical in `ASSESSMENT.md`, so don't skip them even under time pressure — the other three steps are ungraded practice, but those two carry forward.

Keep `NOTES.md` open in the repo root throughout — Steps 3 and 5 ask you to record things in it.

---

## Step 1 — Build `.claude/commands/review.md` (7 min)

**Goal**: a command that reviews the current diff against this repo's actual conventions, scoped so it can't accidentally change anything.

Build `.claude/commands/review.md`:

- `description`: what the command does, specifically enough that a teammate picking it from the command list knows what they're getting.
- `allowed-tools`: scope this to read-only tools plus `git` — a review command has no business holding `Write` or unscoped `Bash`. If you're not sure how to write the scope, ask Claude directly: "what's the minimal `allowed-tools` for a command that only reads files and runs `git diff`?"
- Body: review `git diff` (staged and unstaged) against the conventions actually documented in this repo's `CLAUDE.md` — validation through `util/validate.ts`, the error envelope shape, the service/route boundary, ownership checks, sibling tests for new files. Report findings as **Blocking** / **Suggested** / **Nit**, and end with a one-line verdict (`Ready to merge` / `Needs changes`).

**Definition of done**: `/review` runs without a permission prompt for anything outside its scoped tools, and produces the three-tier report against whatever's currently changed in your working tree (even a trivial change is fine to test against).

**Stuck?** If `/review` tries to edit a file, your `allowed-tools` scope is too broad — narrow it and re-test. A review command that can silently apply its own suggestions has stopped being a review.

---

## Step 2 — Build `.claude/commands/qa-report.md` (8 min)

**Goal**: the same command built live in the demo, from scratch, in your own words — not copied verbatim.

Build `.claude/commands/qa-report.md`:

- `description`: specific — not "runs checks," but naming exactly which checks and what it produces.
- Body: run `npm run lint`, `npm run build`, and `npm test`, in that order, capturing real output — say explicitly in the prompt not to fabricate results if a step is slow or ambiguous.
- Output: a fixed-schema report — Lint (pass/fail, error count), Build (pass/fail), Tests (X passed, Y failed, failing test names if any), Overall (`GREEN` only if all three passed, else `RED` naming the blocking step first).

**Definition of done**: running `/qa-report` produces a report in that exact shape, grounded in commands that actually ran (spot-check: does the reported test count match what `npm test` prints on its own?).

**Stuck?** If the report looks plausible but you can't tell whether it's real, that's the failure mode the demo warned about — go back and make the instruction to run real commands and report real output more explicit and more forceful.

---

## Step 3 — Build `.claude/skills/api-endpoint/SKILL.md` and test auto-activation (10 min)

**Goal**: a skill that fires from a natural request, without anyone naming it — the hardest and most important exercise today.

Build `.claude/skills/api-endpoint/SKILL.md`:

- `name: api-endpoint`, and a `description` written the way Block 4 described: concrete situation + action verbs, not generic ("Helps with endpoints" will not reliably fire — "Add a new REST endpoint to the TaskFlow API following repo conventions. Use when asked to add, create, or scaffold a new route/endpoint" is the shape to aim for).
- Body: this repo's actual convention for adding an endpoint — route file → validate via `util/validate.ts` before touching a service → delegate to a service (never `repo/` directly) → ownership check (`resource.userId === req.userId`) where applicable → error envelope `{ error: { code, message, details? } }` → sibling test under `tests/` → docs (README table + JSDoc).

**Test it without naming it.** In a fresh session (`/clear` first), give a prompt that never says "skill" or "api-endpoint" — for example: *"I need a new endpoint that lets a user archive a task."* Watch whether the response follows your skill's convention (validation first, service delegation, ownership check, error envelope, a test) unprompted.

**Record in `NOTES.md`** under `## Skill Auto-Activation Test`: the exact prompt you used, and whether the skill's convention showed up in the response — quote one concrete piece of evidence (e.g., "it added a validation call before the service call, matching my SKILL.md's step 2" ), not just "yes it worked."

**Stuck?** If it doesn't fire, the description is almost always the problem — rewrite it to name the concrete action (add/create/scaffold + endpoint/route) rather than a vague summary of the skill's existence, then retest with a *different* natural-language prompt (reusing the exact same failed prompt after only a small tweak makes it hard to tell what actually changed).

---

## Step 4 — Slim `CLAUDE.md` (5 min)

**Goal**: apply progressive disclosure for real — move detail out of always-loaded memory into on-demand skill content, then prove nothing broke.

Look at `CLAUDE.md`'s "Conventions" section. Some of that detail — specifically the endpoint-adding steps — now lives more fully in `.claude/skills/api-endpoint/SKILL.md`. Shorten `CLAUDE.md` to a one- or two-line pointer for that convention (still name the rule, don't delete it outright — just stop repeating the full procedure in a file that loads every session) and let the skill carry the detail.

**Definition of done**: `CLAUDE.md` is shorter than it was at the start of this step. Ask Claude to add an endpoint in a fresh session (same kind of prompt as Step 3) and confirm the convention is still followed correctly — behavior should be unchanged even though `CLAUDE.md` now says less.

**Stuck?** If you're not sure what's safe to trim, ask: "is this a one-line rule someone needs on every single task, or a multi-step procedure only relevant when doing one specific thing?" The former stays in `CLAUDE.md`; the latter belongs in a skill.

---

## Step 5 — Swap `.claude/` with a partner (5 min)

**Goal**: confirm your commands and skill are actually portable — not just working on your machine because of some local state you didn't notice you were relying on.

Pair up. Copy your partner's `.claude/commands/` and `.claude/skills/` into your checkout (back up or stash your own first). Run their `/qa-report` and their `api-endpoint` skill test (the same untouched prompt from Step 3, or your own equivalent) exactly as they built them — no edits.

**Record in `NOTES.md`** under `## Partner Swap`: your partner's name/handle, whether their `/qa-report` ran cleanly with no changes needed, and whether their skill fired on your test prompt. If something needed a tweak to work on your machine, name the specific thing — a hardcoded path, an assumption about working directory, anything.

**Stuck?** No partner available? Do this against your own files from a completely fresh clone of the repo in a different directory instead — the point is testing portability outside the exact environment you built it in, and a fresh clone gets you most of the way there.

---

At 1:45, stop where you are. `.claude/commands/`, `.claude/skills/`, `CLAUDE.md`, and `NOTES.md` from this lab are exactly what you carry into `ASSESSMENT.md` — the graded practical builds directly on Steps 2 and 3, it does not start over.
