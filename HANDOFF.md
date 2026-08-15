# HANDOFF — Claude Code Training build

**Paused**: 2026-08-15 · **Root**: `C:\Users\nitis\centric-training` · **Plan**: `C:\Users\nitis\.claude\plans\i-have-this-toc-curried-lampson.md`

Resume by reading this file, then the plan file. Everything below reflects verified on-disk state, not intent.

---

## Where we are

| Wave | Status |
|---|---|
| 0 — root scaffold, README, INSTRUCTOR.md | **done** |
| 1 — TaskFlow app + solutions + 7 day states | **done, unverified** |
| capstone brief | **done** (`capstone/CAPSTONE.md`) |
| 2a — day1–3 content (TEACH/LAB/ASSESSMENT/RUBRIC/grade.mjs) | **not started** |
| 2b — day4–6 content | **not started** |
| 2c — day7 content | **not started** |
| 3 — verification pass | **not started** |
| 4 — create + push 7 GitHub repos | **not started** |

The Wave 1 builder agent was stopped mid-flight after it had already materialised all seven day folders. **It never delivered its final report**, so the seeded-defect line numbers and per-day test counts were never handed back. One of those (day1) has since been verified manually — see below.

---

## What exists on disk

```
centric-training/
  README.md                 programme index
  INSTRUCTOR.md             defect map, day-state table, grading rules (LOCAL ONLY)
  HANDOFF.md                this file
  capstone/CAPSTONE.md      full brief: 3 tracks, rubric, submission, demo script
  capstone/starters/        EMPTY — still to build
  _build/baseline/          canonical app (43 files) — scratch, not published
  solutions/day1..day7/     50 files, reference answers + SOLUTION.md each (LOCAL ONLY)
  day1/ .. day7/            self-contained repo roots, 30–67 files each
```

Per-day file counts (excl. node_modules): day1 30, day2 45, day3 46, day4 46, day5 49, day6 53, day7 67. The upward slope is correct — later days carry accumulated `.claude/`, `.github/`, `mcp/`, `plugins/`.

Day 1 correctly has **no** `CLAUDE.md` — learners author it. Days 2+ do.

---

## Verified

- `day1`: `npx jest` → **3 failed / 19 passed, 22 total; 3 snapshots passed**. Exactly the 3 intentional failures the spec calls for. Failures are pagination, timezone, and money — defects #1, #2, #3.
- All seven day folders exist and are populated.
- `solutions/day1..day7` each contain a `SOLUTION.md`.

## NOT verified — do this first on resume

1. `npm run build` and `npm test` on **day2–day7**. Expected: days 2–3 carry a shrinking subset of the intentional failures; **day4 onward must be fully green**.
2. Actual line numbers of all six seeded defects (INSTRUCTOR.md section 2 names files and functions, but the line numbers were never reported back).
3. That `solutions/dayN` applied to `dayN` genuinely produces `day(N+1)`.
4. That no `INSTRUCTOR.md`, `SOLUTION.md`, or `solutions/` content leaked into any `dayN/`.

---

## Known issues to fix before publishing

1. **Test filenames telegraph the seeded defects.** `day1/tests/` contains `taskService.pagination.test.ts`, `dates.timezone.test.ts`, `money.sumCosts.test.ts`. A learner reading the directory listing on Day 1 is handed the answer to the Day 3 exercise. Rename to neutral names (e.g. `taskService.list.test.ts`, `dates.test.ts`, `money.test.ts`) across every day folder, and update snapshot paths.
2. **`dist/` present in day7** (and possibly others). Gitignored, so harmless to the push, but delete before committing to keep clones clean.
3. **`node_modules/` present in day folders** from local installs. Gitignored — confirm before `git init`.
4. **`capstone/starters/` is empty.** Three minimal scaffolds (option-a/b/c) still needed; CAPSTONE.md tells teams to use them.
5. **Test suite is slow** — 160s for day1, with `app.test.ts` and route tests each ~138s. That is too slow for a classroom feedback loop where learners run tests repeatedly. Investigate (likely a real timer or unmocked wait in the Express app factory) and get it under ~20s.

---

## Resume sequence

1. Read this file, then the plan file.
2. Run the "NOT verified" checks above. Fix issues 1–3.
3. **Wave 2a — day1 content first, alone.** Dispatch one Sonnet builder for `day1/` only: `README.md`, `TEACH.md`, `LAB.md`, `ASSESSMENT.md`, `RUBRIC.md`, `scripts/grade.mjs`. Show the result to the user in full and get format sign-off *before* batching days 2–7 — this was the user's explicit instruction.
4. Wave 2a remainder (day2, day3), then 2b (day4–6), then 2c (day7 + capstone starters).
5. Wave 3: fresh Sonnet verifier, per-day pass/fail table. Graders must **fail on the start state and pass on the solution**.
6. Wave 4: `git init` + commit each `dayN`, then `gh repo create <name> --public --source=dayN --push`.

### Repo names (user-approved, public, under `niti007`)

| Repo | Day |
|---|---|
| `centric-cc-day1-foundation` | Introduction & Foundation |
| `centric-cc-day2-dev-workflows` | Core Dev Workflows & Code Generation |
| `centric-cc-day3-qa-testing` | QA Workflows & Testing Automation |
| `centric-cc-day4-commands-skills` | Slash Commands, Skills & Customisation |
| `centric-cc-day5-hooks-cicd` | Hooks, Automation & CI/CD |
| `centric-cc-day6-mcp-agents-plugins` | MCP, Sub-agents & Plugins |
| `centric-cc-day7-capstone` | Best Practices & Capstone |

`gh` auth verified: account `niti007`, scopes include `repo` and `workflow` (so the Day 5 workflow file can be pushed).

---

## Decisions already locked — do not relitigate

- Stack: Node 20 + TypeScript + Express + Jest/Supertest.
- Assessments are **practical only**, no MCQs. Weights 30/25/20/15/10.
- Each day repo is **self-contained** (full app copy), one repo per day, public.
- The client TOC stays as sold. Modernizations (current model tiers, full hook lifecycle, MCP transports, plan mode, `/context`) go **silently into the teaching content**. No TOC-review document — the user explicitly rejected one.
- Orchestration: Opus specifies and verifies; Sonnet subagents write bulk content; a separate fresh Sonnet agent verifies.

## Unrelated, still outstanding

`C:\Users\nitis\workspace` git remote has a GitHub PAT (`ghp_…`) embedded in its URL. Rotate the token and move to SSH or a credential helper.
