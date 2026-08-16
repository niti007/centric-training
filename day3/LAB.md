# Day 3 — Lab

1:10–1:45 (35 minutes). Work individually, in this `day3` checkout. Five steps, timeboxed — if a step is running long, note where you stopped and move on; the trainer will circle back.

Keep a file called `NOTES.md` in the repo root open throughout — Step 5 asks you to log findings in it, and your graded practical writeup builds on it.

Before you start: skim `CLAUDE.md` (already in this repo from Day 2) so you know this codebase's conventions and its "Do Not Touch" list before you start editing.

---

## Step 1 — Unit suite for `services/taskService.ts` (10 min)

**Goal**: generate a real unit test suite for the task-listing logic, and find whatever's actually wrong with it the way you'd find it in a real codebase — by testing boundary cases, not by being told where to look.

In a `claude` session:

```
List the edge cases and boundary values worth testing for taskService.list() in src/services/taskService.ts, before writing any test code. Think about pagination specifically: first page, a page in the middle, the last page, and anything unusual about page or size values.
```

Review the list it proposes before letting it write anything. Then have it write the tests, run them, and look closely at what fails and why — one existing test in `tests/taskService.list.test.ts` already covers page 1; your job is to extend that file (or add to it) with the boundary cases from your list, especially the **last page** case.

**Definition of done**: `tests/taskService.list.test.ts` (or a file you add alongside it) has more than one test, at least one of which specifically checks a last/partial-page boundary — and you can state in one sentence what's actually wrong with pagination and why your new test proves it.

**Stuck?** If everything you write passes and nothing fails, you haven't hit the boundary yet — try a page size that doesn't evenly divide the number of matching records, and check whether the very last record shows up anywhere.

---

## Step 2 — Supertest integration tests for `routes/tasks.ts` (8 min)

**Goal**: extend the integration coverage on the tasks routes — happy path plus the 4xx paths — using the existing `tests/tasks.routes.test.ts` as your model.

Prompt Claude to add tests (in `tests/tasks.routes.test.ts` or a new file) covering scenarios not already exercised there. Push past whatever's already covered — the existing file is a **starting** model, not the finished suite. At minimum, make sure between the existing tests and your new ones, these are each covered by a named, specific test (not one catch-all "bad request" test):

- a 200/201 happy path
- 401 (missing/invalid auth)
- 400 (invalid input)
- 403 (accessing another user's task)
- 404 (task that doesn't exist)

**Definition of done**: `npx jest tests/tasks.routes.test.ts` (and any new file you added) passes, and you can point to a specific test for each status code above.

**Stuck?** If you're not sure how to set the auth header in a Supertest call, look at how the existing tests in the file do it (`Authorization: Bearer token-u1`) — the fixtures are seeded so `token-u1` through `token-u3` all work and map to different users.

---

## Step 3 — TDD a new feature: `PATCH /tasks/:id/complete` (7 min)

**Goal**: practice the red-before-green discipline from today's TDD block on a small, real feature.

This repo already has `POST /tasks/:id/complete`. Your job is to add an **idempotent PATCH alternative** at the same path — same ownership-checked behavior, different HTTP verb — and to do it test-first.

1. Write a Supertest test for `PATCH /tasks/:id/complete` that expects the task's status to come back as `done`, **before** any route handler exists for it.
2. Run it and confirm it fails — and read the failure message closely enough to be sure it's failing because the route is missing, not because of an unrelated typo.
3. Only now, ask Claude to implement the route (following the ownership-check pattern already used by the existing `POST` version and `DELETE /tasks/:id` in the same file).
4. Rerun the test and confirm it's green.

**Definition of done**: you watched the test fail for the right reason before any implementation existed, and it passes now. Note in `NOTES.md` what the failure message looked like before the fix.

**Stuck?** If you're not sure what "the right reason" looks like, compare a 404-because-route-doesn't-exist failure to a 500-because-of-a-typo failure — they look different, and only one of them tells you your test is correctly targeting a missing feature.

---

## Step 4 — Debug the money rollup and add a regression test (6 min)

**Goal**: run the actual debugging loop — reproduce, isolate, hypothesize, verify — on a real failing test, then lock the fix in with a regression test.

`tests/money.test.ts` already has a failing test for `sumCosts()` in `src/util/money.ts`. Don't guess at the fix — run the loop:

1. **Reproduce**: `npx jest tests/money.test.ts` and read the actual failure — note the expected vs. received values exactly.
2. **Isolate**: look at what `sumCosts` actually does with the specific numbers in the failing test.
3. **Hypothesize**: state, in a sentence, what you think is going wrong and why — before changing any code.
4. **Verify**: check your hypothesis against the numbers from Step 1 before writing a fix.
5. Ask Claude to fix `sumCosts` based on your (verified) hypothesis, then confirm the existing test goes green.
6. Add at least one more test with a *different* set of numbers than the existing test uses — one that would also have failed on the old implementation.

**Definition of done**: the existing test in `tests/money.test.ts` passes, you've added at least one additional assertion with different input values, and you can state your Step 3 hypothesis and how Step 4 confirmed it.

**Stuck?** If your fix makes the existing test pass but you're not confident it's general, try a third, different set of numbers by hand (mentally or in a scratch script) before trusting it.

---

## Step 5 — Structured code review of the Day 2 refactor (4 min)

**Goal**: practice asking for a structured review instead of "does this look good?" — on real code you're not seeing for the first time.

This repo's `src/legacy/reportBuilder.ts` is already in its Day 2 end-state — the refactored version, split into small units, that Day 2's graded practical was about. Ask Claude for a structured review of it:

```
Review src/legacy/reportBuilder.ts. Give me findings in three separate categories: correctness, security, and performance. For each finding, cite the specific function or line, and rate your confidence.
```

**Definition of done**: log in `NOTES.md`, under a `## Code review` heading, what Claude flagged in each of the three categories (or "nothing found" if genuinely nothing), and for each finding, one line on whether you agree and why. Disagreeing with a finding — with a stated reason — is a completely valid and expected outcome here.

**Stuck?** If every category comes back empty, push once: "what's the strongest objection you have to how this file is currently structured?" — and log whether that produced anything more substantive.

---

At 1:45, stop where you are. `NOTES.md` and everything on disk from this lab feed directly into `ASSESSMENT.md` — in particular, Steps 1 and 4 are the direct groundwork for the graded practical's two required bug fixes.
