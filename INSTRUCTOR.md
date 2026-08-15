# INSTRUCTOR ONLY — do not publish

This file is the trainer's key to the whole programme. It must never be committed to any of the seven public day repositories. Each `dayN/.gitignore` excludes it.

---

## 1. The sample application

**TaskFlow API** — Node 20, TypeScript, Express 4, Jest + Supertest, ESLint.

```
src/
  index.ts              express app factory + server bootstrap
  routes/tasks.ts       CRUD + list + bulk endpoints
  routes/users.ts       user CRUD
  routes/auth.ts        toy bearer-token auth middleware
  services/taskService.ts    list/create/update/complete, pagination
  services/userService.ts
  services/notifyService.ts  builds notification messages
  repo/taskRepo.ts      in-memory store, seeded fixtures
  legacy/reportBuilder.ts    ~300-line god function (Day 2 refactor target)
  util/validate.ts      request validation helpers + error envelope
  util/dates.ts         due-date maths
  util/money.ts         cost rollups
tests/                  deliberately sparse
```

Conventions the repo enforces (learners encode these in CLAUDE.md on Day 1):
- Every route validates input through `util/validate.ts` before touching a service.
- Errors return the envelope `{ error: { code, message, details? } }`.
- Services never import Express types. Routes never touch `repo/` directly.
- Every new source file gets a sibling test in `tests/`.

---

## 2. Seeded defect map

Six defects are planted on purpose. Do not fix them ahead of the session.

| # | Location | Defect | Surfaces on | How learners should find it |
|---|---|---|---|---|
| 1 | `src/services/taskService.ts` — `list()` | Off-by-one in pagination: `slice(page * size, page * size + size)` with 1-indexed `page`, so page 1 skips the first record and the last page drops one. | Day 3 | Generated unit tests on boundary pages |
| 2 | `src/util/dates.ts` — `isOverdue()` | Compares a UTC-stored due date against local-time `new Date()`, so tasks flip overdue up to a day early/late depending on TZ. | Day 3 (live demo) | Test with a fixed clock across two timezones |
| 3 | `src/util/money.ts` — `sumCosts()` | Float accumulation (`0.1 + 0.2`) instead of integer minor units; rollups drift by cents. | Day 3 | Assertion on a known-bad sum |
| 4 | `src/routes/tasks.ts` — `PATCH /tasks/:id` | Authenticates but never authorises: any bearer token can edit any user's task. All sibling routes check ownership; this one doesn't. | Day 6 | Security sub-agent |
| 5 | `src/legacy/reportBuilder.ts` | N+1: loops tasks and calls `userService.getById()` per row instead of batching. | Day 6 | Performance sub-agent |
| 6 | `src/services/notifyService.ts` | Interpolates a user-supplied task title straight into an HTML notification body — no escaping. | Day 7 | Security best-practices walkthrough |

**Defect #2 is the pedagogical centrepiece.** On Day 3 the trainer asks Claude to fix it cold; Claude proposes a confident, plausible, *wrong* fix (usually normalising the wrong side of the comparison). The trainer then writes the failing test first and the real fix follows. This is the moment the "verify AI output" message lands. Do not shortcut it.

---

## 3. Day-state progression

Each day repo ships the app at that day's **starting** state.

| Repo | src/tests state | `.claude/` contents |
|---|---|---|
| day1 | Baseline. Defects 1–6 all present. Tests sparse, some failing by design. | empty — learners create `CLAUDE.md` + `settings.json` |
| day2 | + Day 1 solution: `GET /tasks/:id/summary`, `CLAUDE.md`, settings | CLAUDE.md, settings.json |
| day3 | + Day 2 solution: `reportBuilder` refactored into units, `POST /tasks/bulk`, JSDoc | same |
| day4 | + Day 3 solution: defects 1 & 3 fixed w/ regression tests, coverage ≥80% on services | same |
| day5 | + Day 4 solution: commands `/review`, `/qa-report`; skill `api-endpoint` | + commands/, skills/ |
| day6 | + Day 5 solution: hooks wired, `.github/workflows/claude-review.yml` | + hooks in settings.json, workflow |
| day7 | + Day 6 solution: 3 reviewer agents, `.mcp.json`, `plugins/taskflow-kit/`; defects 4 & 5 fixed | full set |

Defect #6 survives to Day 7 on purpose — it is the security case study.

---

## 4. Expected test state per day

Learners will run `npm test` on arrival. Tell them up front which failures are intentional.

| Repo | Expected on `npm test` |
|---|---|
| day1 | Builds clean. Test suite runs; a small number of tests fail — these encode the seeded defects and are the Day 3 work. Failures are expected, not a broken clone. |
| day2–day3 | Same intentional failures, minus anything fixed by the prior day's solution. |
| day4 onward | Green. Any red here is a genuine problem — check Node version first. |

`node scripts/verify-setup.mjs` (Day 1) is the real "is my machine OK" check and must print all-green regardless of test failures.

---

## 5. Timing notes and known risks

- **Day 1**: installation and corporate proxy/auth issues are the single biggest time sink. Send `day1/SETUP.md` 48 hours ahead and ask for a screenshot of `claude --version`. Keep a browser/IDE fallback for anyone hard-blocked so they aren't stranded for two hours.
- **Day 2**: the "wrong way first" demo needs discipline — cap the deliberate bad prompt at 4 minutes or it eats the block.
- **Day 3**: the defect #2 debugging demo runs long if you improvise. Rehearse it once.
- **Day 5**: hook exit-code semantics confuse people (0 = pass, 2 = block, other non-zero = error shown to user but not blocking). Draw it on the board.
- **Day 6**: three heavy blocks in six hours is the tightest day. Mitigations already built in — the MCP server skeleton and the plugin scaffold are pre-provided so those blocks are fill-in-the-blank rather than from-scratch. If you are running late, compress the plugin block, never the sub-agent block.
- **Day 7**: teams routinely over-scope the capstone. The 90-minute checkpoint is mandatory — walk every team and force a cut if they have not got something running.

---

## 6. Grading

`scripts/grade.mjs` in each day repo is deterministic: it inspects files on disk and runs tests. It never reads chat logs, so learners cannot pass by pasting a convincing transcript.

Each grader is validated to **fail on the day's starting state and pass on that day's solution**. If a grader passes on the start state, it is broken — do not use its score.

Scoring weights for every graded task, matching the programme spec:

| Criterion | Weight | What it means in practice |
|---|---|---|
| Functionality | 30% | The thing works and meets the stated acceptance criteria |
| Tool usage | 25% | Used the Claude Code features the day taught, appropriately |
| Code quality | 20% | Readable, conventional, tested |
| Presentation | 15% | Clear commits, notes, and explanation of what was done |
| Best practices | 10% | Scoped permissions, verified output, no secrets |

Partial credit is expected — the grader emits a per-criterion table, and the trainer assigns the presentation score by hand.

**Anti-cheat**: for bug-fix tasks the grader reverts the candidate fix and asserts the test then fails. A test that passes both with and without the fix is not a test.

---

## 7. Answer keys

Reference solutions live in this local folder only, under `solutions/dayN/`, and are never pushed. Publish nothing from there until the day is over.
