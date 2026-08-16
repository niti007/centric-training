# Day 2 — Lab

1:10–1:45 (35 minutes). Work individually, in this `day2` checkout. Five steps, timeboxed — if a step is running long, note where you stopped and move on; the trainer will circle back. None of this lab is graded directly (the graded practical is `ASSESSMENT.md`), but Step 1's output and Step 3's readability refactor establish habits the assessment expects.

Keep `NOTES.md` open in the repo root throughout — Steps 4 and 5 ask you to record things in it.

---

## Step 1 — Generate `POST /tasks/bulk` from a spec (10 min)

**Goal**: practice giving Claude a written spec plus existing conventions, instead of an open-ended "add a bulk endpoint" prompt.

**Spec** (paste or paraphrase this into your prompt — do not just say "add a bulk create endpoint"):

> Add `POST /tasks/bulk` to `src/routes/tasks.ts`. Request body: `{ tasks: Array<{ title, description?, dueDate, cost? }> }`, same field shapes as the existing `POST /tasks` handler. Validate every item in the array using the existing helpers from `util/validate.ts` (`requireString`, `optionalString`, `requireISODate`, `optionalNumber`) before creating anything. If **any** item fails validation, create nothing and respond `400` with an envelope whose `details` lists each failing item's index and the validation error — a partial success is not acceptable. If all items are valid, create all of them via `taskService.create` (attaching the authenticated `req.userId`), and respond `201` with the array of created tasks. An empty `tasks` array should be rejected with `400`, not treated as a no-op success.

Follow this repo's conventions from `CLAUDE.md`: go through `taskService`, not `repo/` directly; use `errorEnvelope` for the error shape; add a sibling test under `tests/`.

**Definition of done**: the route exists, handles the happy path, the all-or-nothing validation failure case, and the empty-array case; a test under `tests/` exercises at least the happy path and one failure case; `npm test` shows no *new* failures beyond the 3 you already had.

**Stuck?** If Claude's first attempt does partial creation (creates the valid items, skips the invalid ones) instead of all-or-nothing, that's a spec-following miss worth calling out explicitly in your next prompt, not something to hand-fix.

---

## Step 2 — Generate JSDoc + a README API table (8 min)

**Goal**: generate documentation from the code as it actually is, not from what you remember it doing.

Prompt Claude to:
1. Add JSDoc comments to every exported route handler in `src/routes/tasks.ts` (including the bulk route you just added) — params, response shape, and error cases.
2. Add or extend an API table in `README.md` covering every route in `tasks.ts`: method, path, auth requirement, one-line description.

**Definition of done**: every handler in `tasks.ts` has a JSDoc block; `README.md` has a table listing all of them, including `POST /tasks/bulk`; spot-check three entries against the actual route code — the whole point of this exercise is that generated docs can still be wrong, so verify, don't just accept.

**Stuck?** If the generated JSDoc describes what a route *should* do rather than what it actually does (e.g. glossing over the all-or-nothing bulk behavior), point at the specific mismatch and ask for a correction grounded in the code, not a rewrite from scratch.

---

## Step 3 — Refactor `util/money.ts` for readability (7 min)

**Goal**: a readability-only refactor, behavior fully unchanged — proven, not assumed.

Before you prompt anything: run `npx jest money.test.ts` and note the exact result (pass or fail, and if it fails, the exact assertion failure). Whatever that baseline result is, your job in this step is to reproduce it *exactly* after the refactor — not to make a failing test pass. If it's failing before you start, that's a known limitation outside today's scope; fixing it is not the task here, and doing so anyway would be an unrelated change hiding inside a "readability" refactor.

Prompt Claude to improve `src/util/money.ts` for readability (naming, structure, comments where genuinely useful) without changing what any function returns for any input.

**Definition of done**: `npx jest money.test.ts` produces the *identical* result (same pass/fail, same failure message if it fails) before and after your refactor. Paste both outputs into `NOTES.md` under a `## Money Refactor` heading as your proof.

**Stuck?** If you're not sure whether a change you're tempted to make is "readability" or "behavior," ask: does it change any return value for any input, even an edge case like an empty array? If yes, it's out of scope for this step.

---

## Step 4 — Blow up context, then `/compact` (5 min)

**Goal**: feel the context budget yourself, not just hear about it in Block 7.

In a fresh `claude` session (`/clear` first if continuing an old one), ask Claude to read roughly 10 files across the repo — for example, everything under `src/routes/`, `src/services/`, `src/util/`, and `src/legacy/`. One prompt is fine: "Read through src/routes/, src/services/, src/util/, and src/legacy/reportBuilder.ts so you understand the whole request-handling path."

Then:

```
/context
```

Note the token count and rough breakdown. Then:

```
/compact
```

Immediately ask a question that depends on an exact detail from before the compact (e.g. "what was the exact line count you reported for reportBuilder.ts?" or "quote the JSDoc you'd propose for the bulk route's error case"). See what comes back.

**Record in NOTES.md** under `## Context Exercise`: the token count before and after `/compact`, and one concrete thing that was lost or had to be re-established — not a generic "some detail was lost," the actual detail.

**Stuck?** If nothing seems lost, push harder on specificity — ask for something verbatim (an exact number, an exact quote) rather than something summarizable. Compaction is lossy for exact details even when it preserves the gist.

---

## Step 5 — Same task, two model tiers (5 min)

**Goal**: build judgment about which tier fits which task, from a real side-by-side rather than a rule of thumb.

Pick one small, well-defined task you haven't done yet — for example, "add a JSDoc comment to `sumCosts` in `util/money.ts` explaining its parameters and return value" (small and cheap on purpose; you have 5 minutes). Run it once on a lower tier (e.g. Haiku) and once on a higher tier (e.g. Sonnet) via `/model`, undoing the change between runs so each starts from the same baseline.

**Record in NOTES.md** under `## Model Comparison`: which two tiers you used, rough wall-clock time for each, and your own judgment of output quality — were they meaningfully different for this task, or was the cheaper tier just as good?

**Stuck?** If you can't tell the outputs apart, that's a real and useful finding — say so plainly in `NOTES.md` rather than inventing a difference. "No meaningful difference for this task" is exactly the kind of judgment this exercise is trying to build.

---

At 1:45, stop where you are. `NOTES.md` and the state of `src/`, `tests/`, and `README.md` from this lab are yours to keep working from, but the graded practical in `ASSESSMENT.md` is a separate task against `src/legacy/reportBuilder.ts` — start it fresh.
